import time
import json
import smtplib
import os
import requests
from email.message import EmailMessage
from datetime import datetime, timezone, timedelta
import urllib.parse
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

try:
    from scrapling.fetchers import StealthyFetcher
except ImportError:
    print("A biblioteca 'scrapling' não encontrada. Instale via pip install -r requirements.txt")
    exit(1)

# Supabase Credentials
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY") # Pode ser a SERVICE_ROLE ou ANON_KEY com RLS adequado

def fetch_configs_from_supabase():
    """Busca todas as configurações de alerta ativas no Supabase."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("[Error] Supabase credentials missing in environment.")
        return []
    
    url = f"{SUPABASE_URL}/rest/v1/alert_configs?select=*"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[Supabase] Erro ao buscar configurações: {e}")
        return []

def build_url(config):
    """Monta a URL do gg.deals a partir de um registro do banco de dados."""
    platform = config.get("platform_family", "pc")
    
    params = {
        "minRating": config.get("min_rating", 5),
        "maxPrice": config.get("max_price", 20),
    }

    if config.get("only_historical_low"):
        params["onlyHistoricalLow"] = 1
    
    if config.get("stores"):
        params["store"] = config.get("stores")
    
    if config.get("drms"):
        params["drm"] = config.get("drms")

    base_url = f"https://gg.deals/deals/{platform}/"
    query = urllib.parse.urlencode(params)
    return f"{base_url}?{query}"

def send_email_alert(deals, config, sender_email, sender_password):
    """Envia um alerta por e-mail (Template Premium)."""
    receiver = config.get("email_receiver")
    if not receiver:
        print(f"[Email] Sem destinatário para o usuário {config.get('user_id')}")
        return

    msg = EmailMessage()
    msg["Subject"] = f"🔥 {len(deals)} Novas Ofertas GG.Deals"
    msg["From"] = f"GG.Deals Alert <{sender_email}>"
    msg["To"] = receiver

    # CSS Industrial de Alto Contraste para o E-mail
    css = """
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #000; color: #e8f1f2; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #0a0a0a; border: 1px solid #1a1a1a; }
    .header { padding: 30px; text-align: center; border-bottom: 2px solid #04f06a; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 900; color: #04f06a; text-transform: uppercase; letter-spacing: 2px; }
    .deal-card { display: flex; padding: 15px; border-bottom: 1px solid #1a1a1a; text-decoration: none; color: inherit; }
    .game-img { width: 100px; height: 50px; object-fit: cover; border: 1px solid #1a1a1a; }
    .deal-info { margin-left: 15px; }
    .game-title { font-size: 14px; font-weight: 900; color: #e8f1f2; margin: 0; text-transform: uppercase; }
    .price-row { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
    .current-price { color: #04f06a; font-size: 16px; font-weight: 900; }
    .footer { padding: 20px; text-align: center; font-size: 10px; color: #84596b; text-transform: uppercase; }
    """

    html_content = f"<html><head><style>{css}</style></head><body><div class='container'><div class='header'><h1>GG.Deals Alert</h1></div>"
    for d in deals:
        html_content += f"""
        <a href="{d['deal_url']}" class="deal-card">
            <img src="{d['image_url']}" class="game-img">
            <div class="deal-info">
                <p class="game-title">{d['title']}</p>
                <div class="price-row">
                    <span class="current-price">{d['price']}</span>
                    <span style="color: #087ca7; font-size: 11px;">{d['shop']}</span>
                </div>
            </div>
        </a>
        """
    html_content += f"<div class='footer'><p>Configuração do usuário: {config.get('user_id')}</p></div></div></body></html>"

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
    print(f"\n[Scraper] Processando config {config.get('user_id')[:8]}...")
    
    try:
        page = StealthyFetcher.fetch(url, headless=True, solve_cloudflare=True, timeout=60000)
    except Exception as e:
        print(f"[Scraper] Erro ao buscar: {e}")
        return

    deals_found = []
    items = page.css(".item")
    time_limit = datetime.now(timezone.utc) - timedelta(hours=24)

    for item in items:
        # Extração básica
        time_tag = item.css("time")
        if not time_tag: continue
        deal_time = datetime.fromisoformat(time_tag[0].attrib.get("datetime").replace("Z", "+00:00"))
        
        if deal_time < time_limit: break

        title_tag = item.css("a.game-info-title")
        title = title_tag[0].get_all_text(strip=True) if title_tag else "Unknown"
        price_tag = item.css("span.price") or item.css("span.base-price")
        price = price_tag[0].get_all_text(strip=True) if price_tag else "N/A"
        
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

    configs = fetch_configs_from_supabase()
    print(f"[Main] Encontradas {len(configs)} configurações ativas.")
    
    for config in configs:
        run_scraper_for_config(config, email_sender, email_password)
        time.sleep(5) # Delay entre execuções

if __name__ == "__main__":
    main()
