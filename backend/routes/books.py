from flask import Blueprint, request, jsonify, current_app

books_bp = Blueprint("books", __name__)

@books_bp.route("/", methods=["GET"])
def get_books():
    db = current_app.mongo.db
    books = list(db.books.find())
    for book in books:
        book["_id"] = str(book["_id"])
    return jsonify(books)

@books_bp.route("/", methods=["POST"])
def add_book():
    db = current_app.mongo.db
    data = request.get_json()

    required_fields = {"name", "author", "image", "isbn13"}
    if not required_fields.issubset(data):
        return {"error": "Missing fields"}, 400

    db.books.insert_one(data)
    return {"message": "Book added"}, 201

