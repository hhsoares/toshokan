from flask import Blueprint, request, jsonify, current_app

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
def get_users():
    db = current_app.mongo.db
    users = list(db.users.find())
    for user in users:
        user["_id"] = str(user["_id"])  # Convert ObjectId to string
    return jsonify(users)

@users_bp.route("/", methods=["POST"])
def add_user():
    db = current_app.mongo.db
    data = request.get_json()

    required_fields = {"name", "email"}
    if not required_fields.issubset(data):
        return {"error": "Missing name or email"}, 400

    if db.users.find_one({"email": data["email"]}):
        return {"error": "Email already exists"}, 409

    db.users.insert_one(data)
    return {"message": "User added"}, 201
