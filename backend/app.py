from flask import Flask, send_from_directory
import os
from flask_pymongo import PyMongo
from flask_cors import CORS
from dotenv import load_dotenv

# Setup
load_dotenv()
app = Flask(__name__, static_folder="../frontend", static_url_path="/")
CORS(app)
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)
app.mongo = mongo

# Register Blueprints
from routes.books import books_bp
from routes.users import users_bp
app.register_blueprint(books_bp, url_prefix="/books")
app.register_blueprint(users_bp, url_prefix="/users")

# Health check
@app.route("/health")
def health():
    try:
        mongo.db.command("ping")
        return {"status": "ok"}, 200
    except Exception as e:
        return {"status": "error", "msg": str(e)}, 500

# Serve frontend files
@app.route("/")
def serve_login():
    return send_from_directory(app.static_folder + "/home", "loginScreen.html")

@app.route("/<path:path>")
def serve_static_file(path):
    return send_from_directory(app.static_folder, path)

# Start app
if __name__ == "__main__":
    app.run(debug=True)
