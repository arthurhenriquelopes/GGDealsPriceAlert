import time
import json
import smtplib
import os
from email.message import EmailMessage
from datetime import datetime, timezone, timedelta
import schedule


# Bloco seguro para garantir que a lib Scrapling está disponível, caso contrário orienta a instalação
try:
    from scrapling.fetchers import StealthyFetcher
except ImportError:
    print("A biblioteca 'scrapling' inicial não foi encontrada ou faltam deps.")
    print("Por favor, certifique-se de instalar: pip install scrapling msgspec curl_cffi patchright browserforge schedule")
    exit(1)


# Configurações de busca
MAX_PRICE = 10
DRM_STEAM_ID = 1  # O DRM do Steam no GG.Deals geralmente é 1
BASE_URL = f"https://gg.deals/deals/?maxPrice={MAX_PRICE}&drm={DRM_STEAM_ID}&sort=date"


# Configurações de E-mail
# Use variáveis de ambiente para esconder suas credenciais do código (especialmente p/ o Github)
EMAIL_SENDER = "arthurhenriquelopesf1@gmail.com"
EMAIL_PASSWORD = os.environ.get("EMAIL_PASSWORD", "")
EMAIL_RECEIVER = "arthurhenriquelopesf@gmail.com"  # Destinatário do alerta
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 465


def send_email_alert(deals):
    """Envia um alerta por e-mail com as promoções encontradas."""
    if not EMAIL_SENDER or not EMAIL_PASSWORD:
        print("\n[!] Aviso: A variável de ambiente EMAIL_PASSWORD não foi configurada.")
        print(" O alerta por e-mail NÃO será enviado, mas os dados foram salvos no json.")
        return

    msg = EmailMessage()
    msg["Subject"] = f"Alert GG.Deals: {len(deals)} novos jogos Steam abaixo de R${MAX_PRICE}"
    msg["From"] = EMAIL_SENDER
    msg["To"] = EMAIL_RECEIVER

    # Corpo do e-mail em HTML
    html_content = "<h2>Ofertas encontradas hoje nas últimas 24h:</h2><ul>"
    for d in deals:
        html_content += (
            f"<li><b>{d['title']}</b> - "
            f"<span style='color:green;'>{d['price']}</span><br>"
            f"<a href='{d['deal_url']}'>Link GG.Deals</a></li><br>"
        )
    html_content += "</ul>"

    msg.set_content("Ative a visualização HTML do seu cliente de e-mail para ver os detalhes completos.")
    msg.add_alternative(html_content, subtype="html")

    try:
        # Usa SMTP_SSL para Gmail (na porta 465)
        with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.login(EMAIL_SENDER, EMAIL_PASSWORD)
            smtp.send_message(msg)
        print(f"E-mail de alerta enviado com sucesso para {EMAIL_RECEIVER}!")
    except Exception as e:
        print(f"Falha ao enviar e-mail: {e}")


def fetch_daily_deals():
    current_page = 1
    recent_deals = []

    now = datetime.now(timezone.utc)
    twenty_four_hours_ago = now - timedelta(hours=24)  # Apenas 24 horas atrás

    keep_scraping = True

    print(
        f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] "
        f"Iniciando busca de promoções das últimas 24h (Max R${MAX_PRICE}, DRM Steam)..."
    )

    while keep_scraping:
        page_url = f"{BASE_URL}&page={current_page}"
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

            if deal_time < twenty_four_hours_ago:
                # Chegamos no limiar de tempo de 24 horas (como os itens estão em sort=date, os próximos serão ainda mais antigos)
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

            recent_deals.append(
                {
                    "title": title,
                    "price": price_text,
                    "deal_url": deal_url,
                    "time": dt_str,
                }
            )
            added_in_this_page += 1

        if keep_scraping:
            # Caso a página tenha tido todos os items mais novos que 24h, vai pra próxima.
            if added_in_this_page == 0:
                break

            current_page += 1
            time.sleep(3)  # Pausa amigável para não sobrecarregar os servidores ou alarmar a cloudflare

    # Salvar resultados diários
    if recent_deals:
        filename = f"deals_steam_abaixo_10_{now.strftime('%Y%m%d')}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(recent_deals, f, indent=4, ensure_ascii=False)
        print(
            f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] "
            f"Sucesso! {len(recent_deals)} promoções das últimas 24h foram salvas no arquivo '{filename}'."
        )

        # Chama a função para o Disparo de E-mail
        send_email_alert(recent_deals)
    else:
        print(
            f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] "
            f"Nenhuma nova promoção no Steam abaixo de R${MAX_PRICE} encontrada nas últimas 24h."
        )


def main():
    fetch_daily_deals()

    # Se estiver rodando no GitHub Actions, não entra no loop de agendamento
    if os.environ.get("GITHUB_ACTIONS") == "true":
        print("\nAmbiente GitHub Actions detectado. Finalizando após execução única.")
        return

    print("\n--- Modo Diário Automático ---")
    print("O agendador foi iniciado. Este script rodará todos os dias às 10:00 do seu PC.")
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
