from flask import Blueprint, request, jsonify, current_app, session
from bson import ObjectId
from datetime import datetime, timedelta

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

    if user.get("suspended"):
        return {"error": "Account is suspended"}, 403

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

@users_bp.route("/suspend/<user_id>", methods=["POST"])
def suspend_user(user_id):
    db = current_app.mongo.db
    data = request.get_json()
    duration = data.get("duration")  # can be number of days or "permanent"

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return {"error": "User not found"}, 404

    if duration == "permanent":
        suspension_until = None
    else:
        try:
            days = int(duration)
            suspension_until = datetime.utcnow() + timedelta(days=days)
        except:
            return {"error": "Invalid duration"}, 400

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "suspended": True,
            "suspension_until": suspension_until.isoformat() if suspension_until else None
        }}
    )
    return {"message": "User suspended"}, 200


@users_bp.route("/unsuspend/<user_id>", methods=["POST"])
def unsuspend_user(user_id):
    db = current_app.mongo.db
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"suspended": False}, "$unset": {"suspension_until": ""}}
    )
    return {"message": "User unsuspended"}, 200

@users_bp.route("/<user_id>", methods=["PATCH"])
def update_user(user_id):
    db = current_app.mongo.db
    data = request.get_json()
    update = {}
    for field in ["first_name", "last_name", "email", "is_librarian"]:
        if field in data:
            update[field] = data[field]
    if not update:
        return {"error": "No data to update"}, 400
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update})
    return {"message": "User updated"}, 200
