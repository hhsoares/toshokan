from flask import Blueprint, request, jsonify, current_app
from bson import ObjectId
from datetime import datetime, timedelta

books_bp = Blueprint("books", __name__)

@books_bp.route("/", methods=["GET"])
def get_books():
    db = current_app.mongo.db
    search_query = request.args.get("q", "")

    if search_query:
        regex_query = {"$regex": search_query, "$options": "i"}
        books = list(db.books.find({
            "$or": [
                {"name": regex_query},
                {"author": regex_query},
                {"isbn13": regex_query}
            ]
        }))
    else:
        books = list(db.books.find())

    for book in books:
        book["_id"] = str(book["_id"])
    return jsonify(books)

@books_bp.route("/", methods=["POST"])
def add_book():
    db = current_app.mongo.db
    data = request.get_json()

    required_fields = {"name", "author", "image", "isbn13", "quantity"}
    if not required_fields.issubset(data):
        return {"error": "Missing fields"}, 400

    db.books.insert_one(data)
    return {"message": "Book added"}, 201

@books_bp.route("/request", methods=["POST"])
def create_book_request():
    db = current_app.mongo.db
    data = request.get_json()

    required = {"user_email", "book_title"}
    if not required.issubset(data):
        return {"error": "Missing data"}, 400

    db.book_requests.insert_one({
        "user_email": data["user_email"],
        "book_title": data["book_title"],
        "status": "pending"
    })

    return {"message": "Request submitted"}, 201

@books_bp.route("/requests", methods=["GET"])
def get_book_requests():
    db = current_app.mongo.db
    requests = list(db.book_requests.find({"status": "pending"}))
    for r in requests:
        r["_id"] = str(r["_id"])
    return jsonify(requests)

@books_bp.route("/requests/<request_id>/approve", methods=["POST"])
def approve_book_request(request_id):
    db = current_app.mongo.db
    req = db.book_requests.find_one({"_id": ObjectId(request_id)})

    if not req:
        return {"error": "Request not found"}, 404

    book = db.books.find_one({"name": req["book_title"]})
    if not book or book.get("quantity", 0) <= 0:
        return {"error": "Book not available"}, 400

    user = db.users.find_one({"email": req["user_email"]})
    if not user:
        return {"error": "User not found"}, 404

    # Decrease book quantity
    db.books.update_one({"_id": book["_id"]}, {"$inc": {"quantity": -1}})

    # Add full book info to user's active_books
    due_date = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")
    db.users.update_one(
        {"_id": user["_id"]},
        {"$push": {
            "active_books": {
                "name": book["name"],
                "isbn13": book.get("isbn13", ""),
                "image": book.get("image", ""),
                "due": due_date
            }
        }}
    )

    # Mark request as approved
    db.book_requests.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "approved"}}
    )

    return {"message": "Request approved and book assigned"}, 200

@books_bp.route("/requests/<request_id>/refuse", methods=["POST"])
def refuse_book_request(request_id):
    db = current_app.mongo.db
    db.book_requests.delete_one({"_id": ObjectId(request_id)})
    return {"message": "Request refused and deleted"}, 200

@books_bp.route("/user/<user_id>/book/remove", methods=["POST"])
def remove_user_book(user_id):
    db = current_app.mongo.db
    data = request.get_json()
    book_name = data.get("book_name")
    if not book_name:
        return {"error": "Missing book name"}, 400

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return {"error": "User not found"}, 404

    updated_books = [b for b in user.get("active_books", []) if b["name"] != book_name]
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"active_books": updated_books}}
    )

    # Optional: increase book quantity again
    db.books.update_one({"name": book_name}, {"$inc": {"quantity": 1}})

    return {"message": "Book removed from user"}, 200


@books_bp.route("/user/<user_id>/book/extend", methods=["POST"])
def extend_due_date(user_id):
    db = current_app.mongo.db
    data = request.get_json()
    book_name = data.get("book_name")
    if not book_name:
        return {"error": "Missing book name"}, 400

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return {"error": "User not found"}, 404

    books = user.get("active_books", [])
    for b in books:
        if b["name"] == book_name:
            due_date = datetime.strptime(b["due"], "%Y-%m-%d")
            new_due = (due_date + timedelta(days=7)).strftime("%Y-%m-%d")
            b["due"] = new_due
            break
    else:
        return {"error": "Book not found in user's list"}, 404

    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"active_books": books}}
    )

    return {"message": "Due date extended by 1 week"}, 200
