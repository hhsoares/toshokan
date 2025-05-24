from flask import Blueprint, request, jsonify, current_app, session
from bson import ObjectId

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
def get_users():
    db = current_app.mongo.db
    users = list(db.users.find())
    for user in users:
        user["_id"] = str(user["_id"])
    return jsonify(users)

@users_bp.route("/", methods=["POST"])
def add_user():
    db = current_app.mongo.db
    data = request.get_json()

    required_fields = {"first_name", "last_name", "email", "password", "confirm_password"}
    if not required_fields.issubset(data):
        return {"error": "Missing required fields"}, 400

    if data["password"] != data["confirm_password"]:
        return {"error": "Passwords do not match"}, 400

    if db.user_requests.find_one({"email": data["email"]}) or db.users.find_one({"email": data["email"]}):
        return {"error": "Email already exists"}, 409

    request_data = {
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "email": data["email"],
        "password": data["password"],
        "is_librarian": data.get("is_librarian", False),
        "status": "pending"
    }

    db.user_requests.insert_one(request_data)
    return {"message": "Registration request submitted and pending librarian approval."}, 201

@users_bp.route("/login", methods=["POST"])
def login_user():
    session.clear()
    db = current_app.mongo.db
    data = request.get_json()

    if "email" not in data or "password" not in data:
        return {"error": "Missing email or password"}, 400

    user = db.users.find_one({"email": data["email"]})

    if not user or user["password"] != data["password"]:
        return {"error": "Invalid email or password"}, 401

    user_info = {
        "first_name": user["first_name"],
        "last_name": user["last_name"],
        "email": user["email"],
        "is_librarian": user.get("is_librarian", False)
    }

    session["user"] = user_info

    return {"message": "Login successful", "user": user_info}, 200

@users_bp.route("/pending", methods=["GET"])
def get_pending_users():
    db = current_app.mongo.db
    users = list(db.user_requests.find({"status": "pending"}))
    for user in users:
        user["_id"] = str(user["_id"])
    return jsonify(users)

@users_bp.route("/approve/<user_id>", methods=["POST"])
def approve_user(user_id):
    db = current_app.mongo.db
    request_doc = db.user_requests.find_one({"_id": ObjectId(user_id)})
    if not request_doc:
        return {"error": "Request not found"}, 404

    request_doc.pop("_id")
    db.users.insert_one(request_doc)
    db.user_requests.delete_one({"_id": ObjectId(user_id)})

    return {"message": "User approved and account created"}, 200

@users_bp.route("/refuse/<user_id>", methods=["POST"])
def refuse_user(user_id):
    db = current_app.mongo.db
    db.user_requests.delete_one({"_id": ObjectId(user_id)})
    return {"message": "User request refused and removed"}, 200
