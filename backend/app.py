from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv
import os

# load env and config
load_dotenv()
app = Flask(__name__)
app.config["MONGO_URI"] = os.getenv("MONGO_URI")

# enable CORS (allow all origins for dev)
CORS(app)  # You can restrict origins with: CORS(app, origins=["http://localhost:5173"])

# connect to Mongo
mongo = PyMongo(app)
app.mongo = mongo  # attach for access in blueprints

# health check
@app.route("/health")
def health():
    try:
        mongo.db.command("ping")
        return {"status": "ok"}, 200
    except Exception as e:
        return {"status": "error", "msg": str(e)}, 500

# import and register blueprints
from routes.books import books_bp
from routes.users import users_bp
app.register_blueprint(books_bp, url_prefix="/books")
app.register_blueprint(users_bp, url_prefix="/users")

if __name__ == "__main__":
    app.run(debug=True)
