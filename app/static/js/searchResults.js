console.log("Loading searchResults.js");

const { createApp } = Vue;

createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      user: window.initialUser || { first_name: "Guest" },
      searchQuery: window.initialQuery || "",
      books: [],
      currentPage: 1,
      pageSize: 12,
      sortOrder: "featured",
      showModal: false,
      selectedBook: null,
    };
  },
  computed: {
    totalResults() {
      return this.books.length;
    },
    totalPages() {
      return Math.ceil(this.books.length / this.pageSize);
    },
    startResult() {
      return (this.currentPage - 1) * this.pageSize + 1;
    },
    endResult() {
      return Math.min(this.currentPage * this.pageSize, this.books.length);
    },
    paginatedBooks() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.books.slice(start, start + this.pageSize);
    },
    pageNumbers() {
      let pages = [];
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    async searchBooks() {
      try {
        console.log("Searching books for query:", this.searchQuery);
        const response = await fetch(`/books?q=${encodeURIComponent(this.searchQuery)}`);
        if (!response.ok) throw new Error("Failed to fetch books");
        const data = await response.json();
        this.books = data;
        this.currentPage = 1;
      } catch (error) {
        alert("Error searching books: " + error.message);
        console.error(error);
      }
    },
    toggleSort() {
      this.sortOrder = this.sortOrder === "featured" ? "newest" : "featured";
      // Implement sorting logic here if needed
    },
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
    },
    openModal(book) {
      this.selectedBook = book;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedBook = null;
    },
    reserveBook(book) {
      alert(`Reserving: ${book.name}`);
      // Implement reservation logic here
      this.closeModal();
    },
    logout() {
      localStorage.removeItem("user");
      window.location.href = "/";
    },
  },
  mounted() {
    if (this.searchQuery) {
      this.searchBooks();
    }
  },
}).mount("#app");
