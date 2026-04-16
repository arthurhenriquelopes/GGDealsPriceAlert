# GGDeals Price Alert Dashboard 🚀

Um sistema completo de monitoramento de promoções do GG.Deals com dashboard de configuração e alertas automáticos por e-mail.

## 🛠️ Tecnologias
- **Backend:** Python (HTTP Server)
- **Frontend:** HTML5, CSS3 vanilla (dark mode), JavaScript
- **Scraper:** Scrapling (StealthyFetcher p/ bypass de Cloudflare)
- **Automação:** GitHub Actions

## 🚀 Como usar localmente

1. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   python -m playwright install --with-deps chromium
   ```

2. **Configure suas credenciais:**
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   EMAIL_SENDER=seu-email@gmail.com
   EMAIL_PASSWORD=sua-senha-de-app-16-digitos
   ```
   *Nota: Use uma Senha de App do Google, não sua senha comum.*

3. **Inicie o Dashboard:**
   ```bash
   python dashboard_server.py
   ```
   Acesse no navegador: `http://localhost:8585`

4. **Rodar o Scraper manualmente:**
   Você pode clicar no botão **"Rodar Scraper"** no dashboard ou rodar via terminal:
   ```bash
   python scraper.py
   ```

## 🤖 Automação via GitHub Actions

Para que o scraper rode sozinho todos os dias e envie alertas para o seu e-mail:

1. Suba este repositório para o seu GitHub.
2. Vá em **Settings** -> **Secrets and variables** -> **Actions**.
3. Adicione os seguintes Secrets:
   - `EMAIL_SENDER`: O e-mail que vai enviar os alertas.
   - `EMAIL_PASSWORD`: A Senha de App de 16 dígitos desse e-mail.
4. O scraper rodará automaticamente às 10:00 UTC (07:00 BRT). Você também pode disparar manualmente em **Actions** -> **GGDeals Daily Alerts** -> **Run workflow**.

## 📁 Estrutura do Projeto
- `dashboard.html`: Interface do usuário.
- `dashboard_server.py`: Servidor que gerencia configurações e dispara o scraper.
- `scraper.py`: O "motor" que busca as ofertas e envia e-mails.
- `config.json`: Armazena seus filtros e preferências.
- `.env`: (Privado) Armazena suas credenciais de e-mail.
