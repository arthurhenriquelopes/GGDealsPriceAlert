import smtplib
import os
from dotenv import load_dotenv

load_dotenv()

SENDER = os.getenv("EMAIL_SENDER")
PASSWORD = os.getenv("EMAIL_PASSWORD")

print(f"Testando login para: {SENDER}")
print(f"Senha (sem espacos): {PASSWORD}")

try:
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(SENDER, PASSWORD)
        print("LOGIN SUCESSO!")
except Exception as e:
    print(f"ERRO: {e}")
