const { createApp } = Vue;

createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      user: JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null"),
      books: [],
      searchQuery: "",
      sortKey: "index",
      sortAsc: true,
      showModal: false,
      showEditModal: false,   // EDIT MODAL
      newBook: {
        name: "",
        author: "",
        isbn13: "",
        image: "",
        quantity: 1
      },
      editBook: {
        _id: "",
        name: "",
        author: "",
        isbn13: "",
        image: "",
        quantity: 1
      }
    };
  },
  computed: {
    filteredBooks() {
      let list = this.books.filter(b =>
        (`${b.name}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
         `${b.author}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
         `${b.isbn13}`.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
      const key = this.sortKey;
      list.sort((a, b) => {
        let va = key === "index" ? this.books.indexOf(a) : (a[key] || "").toString().toLowerCase();
        let vb = key === "index" ? this.books.indexOf(b) : (b[key] || "").toString().toLowerCase();
        return (va < vb ? -1 : va > vb ? 1 : 0) * (this.sortAsc ? 1 : -1);
      });
      return list;
    }
  },
  methods: {
    async loadBooks() {
      const res = await fetch("/books");
      this.books = await res.json();
    },
    async submitBook() {
      const payload = {
        name: this.newBook.name,
        author: this.newBook.author,
        isbn13: this.newBook.isbn13,
        image: this.newBook.image,
        quantity: Number(this.newBook.quantity) || 1
      };
      const res = await fetch("/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        this.showModal = false;
        this.newBook = { name: "", author: "", isbn13: "", image: "", quantity: 1 };
        this.loadBooks();
      } else {
        alert("Failed to add book.");
      }
    },
    toggleSort(key) {
      if (this.sortKey === key) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = key;
        this.sortAsc = true;
      }
    },
    arrow(key) {
      return this.sortKey === key ? (this.sortAsc ? "▲" : "▼") : "";
    },
    logout() {
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
      window.location.href = "/";
    },
    deleteBook(book) {
      const confirmDelete = confirm(`Delete book "${book.name}"?`);
      if (!confirmDelete) return;

      fetch(`/books/${book._id}`, {
        method: "DELETE"
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to delete book.");
        return res.json();
      })
      .then(() => {
        alert("Book deleted.");
        this.loadBooks();
      })
      .catch(err => alert("Error: " + err.message));
    },
    // ==== EDIT LOGIC BELOW ====
    openEditModal(book) {
      this.editBook = { ...book };  // Clone for editing
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editBook = { _id: "", name: "", author: "", isbn13: "", image: "", quantity: 1 };
    },
    async submitEditBook() {
      // Call backend to update
      const payload = {
        name: this.editBook.name,
        author: this.editBook.author,
        isbn13: this.editBook.isbn13,
        image: this.editBook.image,
        quantity: Number(this.editBook.quantity)
      };
      const res = await fetch(`/books/${this.editBook._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        this.showEditModal = false;
        this.loadBooks();
      } else {
        alert("Failed to update book.");
      }
    },
    openBulkEdit() {
      alert("This button is for future: bulk editing, not single-book edit. Single row edit is in the table.");
    }
  },
  mounted() {
    if (!this.user) return (window.location.href = "/");
    this.loadBooks();
  }
}).mount("#app");
