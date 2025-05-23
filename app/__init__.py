from flask import Flask, redirect, url_for, session, render_template, request
from authlib.integrations.flask_client import OAuth
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Load env variables
load_dotenv()

app = Flask(__name__)
CORS(app)

app.secret_key = os.getenv("FLASK_SECRET_KEY") or "random_secret"
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)
app.mongo = mongo

# OAuth
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)
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
    user = session.get("user")
    if not user:
        return redirect(url_for("login"))
    return render_template("user_dashboard.html", user=user)

@app.route("/librarian-dashboard")
def librarian_dashboard():
    return render_template("lib_dashboard.html")

@app.route("/health")
def health():
    try:
        mongo.db.command("ping")
        return {"status": "ok"}, 200
    except Exception as e:
        return {"status": "error", "msg": str(e)}, 500

# Google OAuth Routes
@app.route("/google-login")
def google_login():
    redirect_uri = url_for("google_callback", _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route("/callback")
def google_callback():
    token = google.authorize_access_token()
    session.clear()
    resp = google.get("https://www.googleapis.com/oauth2/v1/userinfo")
    user_info = resp.json()

    db = app.mongo.db
    user = db.users.find_one({"email": user_info["email"]})

    if not user:
        # Insert new Google user (default to is_librarian: False)
        new_user = {
            "first_name": user_info.get("given_name"),
            "last_name": user_info.get("family_name"),
            "email": user_info["email"],
            "password": None,  # Optional: mark as Google account
            "is_librarian": False
        }
        db.users.insert_one(new_user)
        user = new_user
    else:
        # Ensure data is complete even if registered manually before
        user.setdefault("first_name", user_info.get("given_name"))
        user.setdefault("last_name", user_info.get("family_name"))
        user.setdefault("is_librarian", False)

    session["user"] = {
        "email": user["email"],
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "is_librarian": user.get("is_librarian", False)
    }

    if session["user"]["is_librarian"]:
        return redirect("/librarian-dashboard")
    return redirect("/dashboard")

@app.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return "", 204

@app.route("/search")
def search_page():
    user = session.get("user")
    if not user:
        return redirect(url_for("login"))
    query = request.args.get("q", "")
    return render_template("search_results.html", user=user, initial_query=query)

@app.route("/librarian/users")
def librarian_users_page():
    user = session.get("user")
    if not user or not user.get("is_librarian"):
        return redirect(url_for("login"))
    return render_template("lib_users.html", user=user)

@app.route("/librarian/books")
def librarian_books_page():
    user = session.get("user")
    if not user or not user.get("is_librarian"):
        return redirect(url_for("login"))
    return render_template("lib_books.html", user=user)

from app.routes.books import books_bp
from app.routes.users import users_bp
app.register_blueprint(books_bp, url_prefix="/books")
app.register_blueprint(users_bp, url_prefix="/users")
