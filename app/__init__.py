from flask import Flask, render_template
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)
app.mongo = mongo

# Register routes
from app.routes.books import books_bp
from app.routes.users import users_bp
app.register_blueprint(books_bp, url_prefix="/books")
app.register_blueprint(users_bp, url_prefix="/users")

# Pages
@app.route("/")
def login():
    return render_template("login.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/forgot-password")
def forgot_password():
    return render_template("forgot_password.html")

@app.route("/dashboard")
def dashboard():
    return render_template("user_dashboard.html")

@app.route("/health")
def health():
    try:
        mongo.db.command("ping")
        return {"status": "ok"}, 200
    except Exception as e:
        return {"status": "error", "msg": str(e)}, 500

