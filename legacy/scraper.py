import time
import json
import smtplib
import os
from email.message import EmailMessage
from datetime import datetime, timezone, timedelta
import schedule
import urllib.parse
from dotenv import load_dotenv

# Carrega variáveis de ambiente do arquivo .env
load_dotenv()


# Bloco seguro para garantir que a lib Scrapling está disponível, caso contrário orienta a instalação
try:
    from scrapling.fetchers import StealthyFetcher
except ImportError:
    print("A biblioteca 'scrapling' inicial não foi encontrada ou faltam deps.")
    print("Por favor, certifique-se de instalar: pip install scrapling msgspec curl_cffi patchright browserforge schedule")
    exit(1)


# Caminho do arquivo de configuração
CONFIG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")


def load_config():
    """Carrega as configurações do config.json gerado pelo dashboard.
    Retorna valores default caso o arquivo não exista (retrocompatibilidade).
    """
    default_config = {
        "platform_family": "pc",
        "preset": "",
        "filters": {
            "minRating": 5,
            "maxPrice": 10,
            "drm": [1],
            "sort": "date",
        },
        "email": {
            "receiver": "arthurhenriquelopesf@gmail.com",
        },
        "scraper": {
            "check_interval_hours": 24,
            "time_window_hours": 24,
        },
    }

    if not os.path.exists(CONFIG_FILE):
        print(f"[Config] Arquivo '{CONFIG_FILE}' não encontrado. Usando configuração padrão.")
        return default_config

    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            config = json.load(f)
        print(f"[Config] Configuração carregada de '{CONFIG_FILE}'.")
        return config
    except (json.JSONDecodeError, IOError) as e:
        print(f"[Config] Erro ao ler config.json: {e}. Usando configuração padrão.")
        return default_config


def build_url(config):
    """Monta a URL completa do gg.deals a partir da configuração do dashboard."""
    platform = config.get("platform_family", "")
    preset = config.get("preset", "")
    filters = config.get("filters", {})

    # Monta o path base
    path_parts = ["https://gg.deals/deals"]
    if platform:
        path_parts.append(platform)
    if preset:
        path_parts.append(preset)
    base_url = "/".join(path_parts) + "/"

    # Monta os query params
    params = {}

    # Parâmetros simples (chave-valor direto)
    simple_params = [
        "minRating", "maxRating", "minPrice", "maxPrice",
        "minDiscount", "maxDiscount", "dealsDate", "dealsExpiryDate",
        "releaseDate", "steamReviews", "opencriticRating",
        "minMetascore", "maxMetascore", "minUserscore", "maxUserscore",
        "minOpencriticAverage", "maxOpencriticAverage",
        "minOpencriticRecommend", "maxOpencriticRecommend",
        "minSteamReviewsCount", "maxSteamReviewsCount",
        "minHltbCompletionMain", "maxHltbCompletionMain",
        "minHltbCompletionPlus", "maxHltbCompletionPlus",
        "minHltbCompletion100", "maxHltbCompletion100",
        "minHltbCompletionAll", "maxHltbCompletionAll",
        "wishlistsRank", "alertsRank", "collectionsRank",
        "wishlisted", "alerted", "owned", "ignored",
    ]

    for param in simple_params:
        val = filters.get(param)
        if val is not None and val != "" and val is not False:
            params[param] = val

    # Sort: "date" é o default do gg.deals, não incluir na URL
    sort_val = filters.get("sort", "date")
    if sort_val and sort_val != "date":
        params["sort"] = sort_val

    # Boolean: onlyHistoricalLow
    if filters.get("onlyHistoricalLow"):
        params["onlyHistoricalLow"] = 1

    # Parâmetros de lista (IDs separados por vírgula)
    list_params = ["store", "drm", "platform", "genre", "subscription"]
    for param in list_params:
        val = filters.get(param, [])
        if val:
            params[param] = ",".join(str(v) for v in val)

    if params:
        query = urllib.parse.urlencode(params)
        return f"{base_url}?{query}"

    return base_url


# Configurações de E-mail
EMAIL_SENDER = os.environ.get("EMAIL_SENDER", "arthurhenriquelopesf@gmail.com")
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD", "")
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465


def send_email_alert(deals, config):
    """Envia um alerta por e-mail com as promoções encontradas (Template Premium)."""
    email_receiver = config.get("email", {}).get("receiver", "arthurhenriquelopesf@gmail.com")
    max_price = config.get("filters", {}).get("maxPrice", "N/A")

    if not EMAIL_SENDER or not EMAIL_PASSWORD:
        print("\n[!] Aviso: A variável de ambiente EMAIL_PASSWORD não foi configurada.")
        print(" O alerta por e-mail NÃO será enviado, mas os dados foram salvos no json.")
        return

    msg = EmailMessage()
    msg["Subject"] = f"🔥 {len(deals)} Novas Ofertas GG.Deals (Filtros Ativos)"
    msg["From"] = f"GG.Deals Alert <{EMAIL_SENDER}>"
    msg["To"] = email_receiver

    # CSS do E-mail Premium
    css = """
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f1113; color: #e9ecef; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1d1f; border-radius: 12px; overflow: hidden; border: 1px solid #2f3336; }
    .header { padding: 30px; text-align: center; background: linear-gradient(135deg, #10b981, #059669); color: white; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .deal-card { display: flex; padding: 20px; border-bottom: 1px solid #2f3336; text-decoration: none; color: inherit; transition: background 0.2s; }
    .deal-card:hover { background: #23272a; }
    .game-img { width: 120px; height: 56px; object-fit: cover; border-radius: 6px; background: #000; flex-shrink: 0; }
    .deal-info { margin-left: 20px; flex-grow: 1; }
    .game-title { font-size: 16px; font-weight: 700; margin: 0 0 5px 0; color: #fff; line-height: 1.2; }
    .deal-meta { font-size: 12px; color: #9ca3af; margin-bottom: 8px; }
    .price-row { display: flex; align-items: center; gap: 10px; }
    .current-price { color: #10b981; font-size: 18px; font-weight: 800; }
    .discount-badge { background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: 700; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .btn { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 13px; margin-top: 10px; }
    """

    html_content = f"""
    <html>
    <head><style>{css}</style></head>
    <body>
        <div class="container">
            <div class="header">
                <h1>GG.Deals Alert</h1>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">{len(deals)} ofertas encontradas abaixo de R${max_price}</p>
            </div>
    """

    for d in deals:
        img_tag = f'<img src="{d["image_url"]}" class="game-img">' if d.get("image_url") else '<div class="game-img"></div>'
        discount_tag = f'<span class="discount-badge">{d["discount"]}</span>' if d.get("discount") else ""
        shop_tag = f" na {d['shop']}" if d.get("shop") else ""

        html_content += f"""
        <a href="{d['deal_url']}" class="deal-card">
            {img_tag}
            <div class="deal-info">
                <p class="game-title">{d['title']}</p>
                <div class="deal-meta">{d.get('shop', 'GG.Deals')}{shop_tag}</div>
                <div class="price-row">
                    <span class="current-price">{d['price']}</span>
                    {discount_tag}
                </div>
            </div>
        </a>
        """

    html_content += """
            <div class="footer">
                <p>Configurado via GGDealsPriceAlert Dashboard</p>
                <p>Gerado em """ + datetime.now().strftime("%d/%m/%Y %H:%M") + """</p>
            </div>
        </div>
    </body>
    </html>
    """

    msg.set_content("Use um cliente de e-mail compatível com HTML para ver as promoções.")
    msg.add_alternative(html_content, subtype="html")

    try:
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.login(EMAIL_SENDER, EMAIL_PASSWORD)
            smtp.send_message(msg)
        print(f"E-mail de alerta enviado com sucesso para {email_receiver}!")
    except Exception as e:
        print(f"Falha ao enviar e-mail: {e}")


def fetch_daily_deals():
    # Carrega configuração do dashboard
    config = load_config()

    # Monta a URL a partir da config
    base_url = build_url(config)

    # Extrai parâmetros do scraper
    scraper_cfg = config.get("scraper", {})
    time_window_hours = scraper_cfg.get("time_window_hours", 24)
    max_price = config.get("filters", {}).get("maxPrice", "N/A")

    current_page = 1
    recent_deals = []

    now = datetime.now(timezone.utc)
    time_threshold = now - timedelta(hours=time_window_hours)

    keep_scraping = True

    print(
        f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] "
        f"Iniciando busca com filtros do dashboard..."
    )
    print(f"  URL base: {base_url}")
    print(f"  Janela de tempo: últimas {time_window_hours}h")

    while keep_scraping:
        # Adiciona paginação à URL
        separator = "&" if "?" in base_url else "?"
        page_url = f"{base_url}{separator}page={current_page}"
        print(f"Buscando página {current_page}...")

        try:
            # StealthyFetcher agora invocado como método de classe com as diretivas para bypasser CF/antibots
            page = StealthyFetcher.fetch(
                page_url,
                headless=True,
                solve_cloudflare=True,  # resolve o challenge do Cloudflare automaticamente
                network_idle=True,
                humanize=True,
                timeout=60000,
            )

            # Tratamento caso o Request volte um código de bloqueio explícito HTTP
            if getattr(page, "status", 200) in [403, 429, 503]:
                print(f"Bloqueio detectado pelo Cloudflare (Status {page.status}). Fim automático do Scraping.")
                break

        except Exception as e:
            print(f"Erro ao acessar {page_url}: {e}")
            break

        # O GG.deals encapsula os itens da listagem em elementos '.item'
        deals = page.css(".item")
        if not deals:
            print("Nenhum item encontrado ou bloqueio detectado que não estourou nos blocos try/catch Http.")
            break

        added_in_this_page = 0

        for deal in deals:
            times = deal.css("time")
            if not times:
                continue

            time_elem = times[0]
            # Novo uso de propriedades da classe Adaptor
            dt_str = time_elem.attrib.get("datetime")
            if not dt_str:
                continue

            try:
                # Transforma algo como '2026-04-13T14:33:01+00:00' para objeto datetime legível
                deal_time = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
            except ValueError:
                continue

            if deal_time < time_threshold:
                # Chegamos no limiar de tempo (como os itens estão em sort=date, os próximos serão ainda mais antigos)
                keep_scraping = False
                break

            titles = deal.css("a.game-info-title")
            # Adaptor agora extrai limpando espaços nativamente
            title = titles[0].get_all_text(strip=True) if titles else "Desconhecido"

            href = titles[0].attrib.get("href") if titles else ""
            deal_url = f"https://gg.deals{href}" if href and href.startswith("/") else href

            prices = deal.css("span.price")
            if not prices:
                prices = deal.css("span.base-price")

            price_text = prices[0].get_all_text(strip=True) if prices else "S/ Preço"

            # Extração adicional para o e-mail premium
            img_elems = deal.css("img")
            # Muitas vezes o src inicial é um placeholder, tentamos srcset ou data-src primeiro
            image_url = ""
            if img_elems:
                img = img_elems[0]
                image_url = img.attrib.get("src") or img.attrib.get("data-src") or ""
                # Se for relativo ou placeholder, tentamos srcset
                if "placeholder" in image_url or not image_url.startswith("http"):
                    srcset = img.attrib.get("srcset", "")
                    if srcset:
                        # Pega a primeira URL do srcset (geralmente a menor resolucao p/ email)
                        image_url = srcset.split(",")[0].split(" ")[0]

            discount_elems = deal.css(".discount")
            discount = discount_elems[0].get_all_text(strip=True) if discount_elems else ""

            shop_elems = deal.css(".shop-name")
            if not shop_elems:
                # Tenta ícone da loja caso o nome não esteja visível
                shop_elems = deal.css(".shop-icon img")
                shop = shop_elems[0].attrib.get("alt") if shop_elems else "GG.Deals"
            else:
                shop = shop_elems[0].get_all_text(strip=True)

            recent_deals.append(
                {
                    "title": title,
                    "price": price_text,
                    "discount": discount,
                    "shop": shop,
                    "image_url": image_url,
                    "deal_url": deal_url,
                    "time": dt_str,
                }
            )
            added_in_this_page += 1

        if keep_scraping:
            # Caso a página tenha tido todos os items mais novos que o threshold, vai pra próxima.
            if added_in_this_page == 0:
                break

            current_page += 1
            time.sleep(3)  # Pausa amigável para não sobrecarregar os servidores ou alarmar a cloudflare

    # Salvar resultados diários
    if recent_deals:
        # Gera nome do arquivo baseado nos filtros ativos
        platform = config.get("platform_family", "all")
        price_tag = f"_abaixo_{max_price}" if max_price != "N/A" else ""
        filename = f"deals_{platform}{price_tag}_{now.strftime('%Y%m%d')}.json"

        with open(filename, "w", encoding="utf-8") as f:
            json.dump(recent_deals, f, indent=4, ensure_ascii=False)
        print(
            f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] "
            f"Sucesso! {len(recent_deals)} promoções das últimas {time_window_hours}h foram salvas no arquivo '{filename}'."
        )

        # Chama a função para o Disparo de E-mail
        send_email_alert(recent_deals, config)
    else:
        print(
            f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] "
            f"Nenhuma nova promoção encontrada nas últimas {time_window_hours}h com os filtros configurados."
        )


def main():
    fetch_daily_deals()

    # Se estiver rodando no GitHub Actions, não entra no loop de agendamento
    if os.environ.get("GITHUB_ACTIONS") == "true":
        print("\nAmbiente GitHub Actions detectado. Finalizando após execução única.")
        return

    # Carrega config para pegar o intervalo de checagem
    config = load_config()
    interval_hours = config.get("scraper", {}).get("check_interval_hours", 24)

    print("\n--- Modo Diário Automático ---")
    print(f"O agendador foi iniciado. Este script rodará a cada {interval_hours}h.")
    print("Para sair e impedir que rode novamente, basta fechar o terminal atual ou pressionar 'Ctrl + C'.")
    schedule.every().day.at("10:00").do(fetch_daily_deals)

    while True:
        try:
            schedule.run_pending()
            time.sleep(60)
        except KeyboardInterrupt:
            print("\nExecução finalizada pelo usuário.")
            break


if __name__ == "__main__":
    main()
