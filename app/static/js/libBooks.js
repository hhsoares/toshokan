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
        if (va < vb) return this.sortAsc ? -1 : 1;
        if (va > vb) return this.sortAsc ? 1 : -1;
        return 0;
      });
      return list;
    }
  },
  methods: {
    async loadBooks() {
      const res = await fetch("/books");
      this.books = await res.json();
      this.books.forEach(b => {
        b.status = b.status || "active";  // default fallback
      });
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
      alert(`Delete book: ${book.name}`);
    }
  },
  mounted() {
    if (!this.user) return (window.location.href = "/");
    this.loadBooks();
  }
}).mount("#app");
