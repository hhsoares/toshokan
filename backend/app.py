import os
from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv

load_dotenv()  # reads .env

app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

# convenience handle
db = mongo.db

@app.route("/health")
def health():
    # simple ping
    try:
        db.command("ping")
        return {"status": "ok"}, 200
    except Exception as e:
        return {"status": "error", "msg": str(e)}, 500

if __name__ == "__main__":
    app.run(debug=True)

