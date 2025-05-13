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

    required_fields = {"first_name", "last_name", "email", "password", "confirm_password"}
    if not required_fields.issubset(data):
        return {"error": "Missing required fields"}, 400

    if data["password"] != data["confirm_password"]:
        return {"error": "Passwords do not match"}, 400

    if db.users.find_one({"email": data["email"]}):
        return {"error": "Email already exists"}, 409

    user_data = {
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "email": data["email"],
        "password": data["password"],  # You should hash this in production
        "is_librarian": data.get("is_librarian", False)
    }

    db.users.insert_one(user_data)
    return {"message": "User registered successfully"}, 201
