import time
import json
import smtplib
import os
import requests
from email.message import EmailMessage
from datetime import datetime, timezone, timedelta
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

try:
    from scrapling.fetchers import StealthyFetcher
except ImportError:
    print("A biblioteca 'scrapling' não encontrada. Instale via pip install -r requirements.txt")
    exit(1)

def fetch_configs():
    """Busca configurações ativas priorizando Supabase PostgREST, com fallback para API Localhost."""
    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
    
    # 1. Tentar Supabase Cloud (Produção no GitHub Actions)
    if SUPABASE_URL and SUPABASE_KEY:
        print("[Fetch] Conectando ao Banco Supabase na Nuvem...")
        url = f"{SUPABASE_URL}/rest/v1/alert_configs?select=*"
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            # PostgREST returns snake_case based on DB cols mapping by default?
            # Actually, PostgREST returns exact column names, which we created in Spring.
            # Spring uses camelCase mapped to snake_case in Postgres by default (SpringPhysicalNamingStrategy).
            # e.g., minDiscount -> min_discount. We should map snake_case back to camelCase for Python if needed.
            # Wait, previously we built the URL from camelCase. We'll add a quick normalization for snake_case keys.
            data = response.json()
            normalized = []
            for row in data:
                norm = {}
                for k, v in row.items():
                    # snake_case to camelCase conversion
                    parts = k.split('_')
                    camel_k = parts[0] + ''.join(word.capitalize() for word in parts[1:])
                    norm[camel_k] = v
                normalized.append(norm)
            return normalized

        except Exception as e:
            print(f"[Supabase] Erro ao buscar configurações na Nuvem: {e}")
            return []

    # 2. Tentar Servidor Spring Boot Local (Ambiente de Testes/Local PC)
    print("[Fetch] SUPABASE_URL ausente. Fazendo fallback para API Localhost Java...")
    url = "http://localhost:8080/api/config"
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[Backend] Erro ao buscar configurações no Spring Boot local: {e}")
        return []

def build_url(config):
    """Monta a URL do gg.deals a partir do AlertConfig completo."""
    # Assuming the API returns camelCase based on typical frameworks, matching our Java fields
    # Let's use lower case get handles in case of standard Jackson dict conversions
    
    # Platform could be embedded or we keep default "pc". The html search uses "pc".
    base_url = "https://gg.deals/deals/pc/"
    
    params = {}
    
    # String mapping helper mapping Java JSON keys to HTML URL param
    if config.get("title"): params["title"] = config.get("title")
    if config.get("minRating"): params["minRating"] = config.get("minRating")
    if config.get("maxRating"): params["maxRating"] = config.get("maxRating")
    if config.get("minPrice"): params["minPrice"] = config.get("minPrice")
    if config.get("maxPrice"): params["maxPrice"] = config.get("maxPrice")
    if config.get("onlyHistoricalLow"): params["onlyHistoricalLow"] = 1
    if config.get("minDiscount"): params["minDiscount"] = config.get("minDiscount")
    if config.get("maxDiscount"): params["maxDiscount"] = config.get("maxDiscount")
    if config.get("dealsDate"): params["dealsDate"] = config.get("dealsDate")
    if config.get("releaseDate"): params["releaseDate"] = config.get("releaseDate")
    if config.get("stores"): params["store"] = config.get("stores")
    if config.get("drms"): params["drm"] = config.get("drms")
    if config.get("platforms"): params["platform"] = config.get("platforms")
    if config.get("subscriptions"): params["subscription"] = config.get("subscriptions")
    if config.get("minMetascore"): params["minMetascore"] = config.get("minMetascore")
    if config.get("maxMetascore"): params["maxMetascore"] = config.get("maxMetascore")
    if config.get("steamReviews"): params["steamReviews"] = config.get("steamReviews")
    
    if config.get("maxHltbCompletionMain"): params["maxHltbCompletionMain"] = config.get("maxHltbCompletionMain")

    query = urllib.parse.urlencode({k: v for k, v in params.items() if v != "" and v is not None})
    return f"{base_url}?{query}"

def send_email_alert(deals, config, sender_email, sender_password):
    """Envia um alerta por e-mail com Template Monocromático Premium."""
    receiver = config.get("emailReceiver")
    if not receiver:
        print(f"[Email] Sem destinatário para o usuário {config.get('userId')}")
        return

    msg = EmailMessage()
    msg["Subject"] = f"★ {len(deals)} Novas Ofertas Selecionadas GG.Deals"
    msg["From"] = f"GG.Deals Tracker <{sender_email}>"
    msg["To"] = receiver

    # Monochrome Serious Styling with precise Green accents for Offers
    css = """
    body { font-family: 'Inter', Arial, sans-serif; background-color: #000; color: #fff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 1px solid #1a1a1a; }
    .header { padding: 30px; text-align: center; border-bottom: 1px solid #1a1a1a; background: #050505; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 900; color: #fff; text-transform: uppercase; letter-spacing: 2px; }
    .deal-card { display: flex; padding: 20px; border-bottom: 1px solid #1a1a1a; text-decoration: none; color: inherit; transition: background 0.2s; }
    .deal-card:hover { background: #0f0f0f; }
    .game-img { width: 110px; height: auto; object-fit: cover; border: 1px solid #222; }
    .deal-info { margin-left: 18px; display: flex; flex-direction: column; justify-content: center; }
    .game-title { font-size: 15px; font-weight: 900; color: #fff; margin: 0 0 5px 0; text-transform: uppercase; }
    .price-row { display: flex; align-items: center; gap: 12px; }
    .current-price { color: #10b981; font-size: 18px; font-weight: 900; }
    .shop-name { color: #888; font-size: 11px; font-weight: 700; text-transform: uppercase; border: 1px solid #333; padding: 3px 8px; border-radius: 2px;}
    .footer { padding: 20px; text-align: center; font-size: 10px; color: #666; text-transform: uppercase; font-weight: 700; }
    """

    html_content = f"<html><head><style>{css}</style></head><body><div class='container'><div class='header'><h1>GG.Deals Tracker</h1></div>"
    for d in deals:
        html_content += f"""
        <a href="{d['deal_url']}" class="deal-card">
            <img src="{d['image_url']}" class="game-img">
            <div class="deal-info">
                <p class="game-title">{d['title']}</p>
                <div class="price-row">
                    <span class="current-price">{d['price']}</span>
                    <span class="shop-name">{d['shop']}</span>
                </div>
            </div>
        </a>
        """
    html_content += f"<div class='footer'><p>POLICY REF: {config.get('userId')}</p></div></div></body></html>"

    msg.add_alternative(html_content, subtype="html")

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        print(f"[Email] Alerta enviado para {receiver}")
    except Exception as e:
        print(f"[Email] Falha ao enviar: {e}")

def run_scraper_for_config(config, sender_email, sender_password):
    url = build_url(config)
    print(f"\n[Scraper] Processando config de origem {config.get('userId')}...")
    print(f"[Scraper] URI alvo gerada: {url}")
    
    try:
        page = StealthyFetcher.fetch(url, headless=True, solve_cloudflare=True, timeout=60000)
    except Exception as e:
        print(f"[Scraper] Erro ao buscar: {e}")
        return

    deals_found = []
    items = page.css(".item")
    time_limit = datetime.now(timezone.utc) - timedelta(hours=24)

    for item in items:
        time_tag = item.css("time")
        if not time_tag: continue
        deal_time = datetime.fromisoformat(time_tag[0].attrib.get("datetime").replace("Z", "+00:00"))
        
        if deal_time < time_limit: break

        title_tag = item.css("a.game-info-title")
        title = title_tag[0].get_all_text(strip=True) if title_tag else "Unknown"
        price_tag = item.css("span.price") or item.css("span.base-price")
        price = price_tag[0].get_all_text(strip=True) if price_tag else "N/A"
        
        # Ensure R$ format instead of default captured text if desired? Standard gg.deals uses locale.
        # Typically it uses 'R$' or '~R$' or 'Free'. We can ensure it has R$ if it has ~$.
        price = price.replace("~$", "~R$ ").replace("$", "R$ ")
        
        img_tag = item.css("img")
        img_url = img_tag[0].attrib.get("src") or img_tag[0].attrib.get("data-src") or ""

        deals_found.append({
            "title": title,
            "price": price,
            "image_url": img_url,
            "deal_url": f"https://gg.deals{title_tag[0].attrib.get('href')}",
            "shop": item.css(".shop-name")[0].get_all_text(strip=True) if item.css(".shop-name") else "GG.Deals"
        })

    if deals_found:
        send_email_alert(deals_found, config, sender_email, sender_password)
    else:
        print(f"[Scraper] Nenhuma oferta nova para este usuário.")

def main():
    email_sender = os.environ.get("EMAIL_SENDER")
    email_password = os.environ.get("EMAIL_PASSWORD")
    
    if not email_sender or not email_password:
        print("[Abort] Credenciais de e-mail não encontradas no ambiente.")
        return

    configs = fetch_configs()
    print(f"[Main] Encontradas {len(configs)} configurações ativas.")
    
    for config in configs:
        run_scraper_for_config(config, email_sender, email_password)
        time.sleep(5) # Delay entre execuções

if __name__ == "__main__":
    main()
