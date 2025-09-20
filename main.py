from fastapi import FastAPI
import requests

app = FastAPI()

SIUR_URL = "https://servicios.siur.com.co/saldo/js/cliete.php"


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/balance")
def get_balance(card: str = "05200727", type: str = "06"):
    params = {"card": card, "type": type}
    try:
        response = requests.get(SIUR_URL, params=params, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        return {"error": str(e)}

    try:
        data = response.json()
        return {"balance": data.get("balance"), "raw": data}
    except ValueError:
        # If the API doesn’t return valid JSON
        return {"raw": response.text}
