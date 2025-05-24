const { createApp } = Vue;

createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      user: JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null"),
      pendingUsers: [],
      bookRequests: [],
    };
  },
  methods: {
    async loadRequests() {
      const usersRes = await fetch("/users/pending");
      const booksRes = await fetch("/books/requests");
      this.pendingUsers = await usersRes.json();
      this.bookRequests = await booksRes.json();
    },
    async approveUser(u) {
      await fetch(`/users/approve/${u._id}`, { method: "POST" });
      this.loadRequests();
    },
    async refuseUser(u) {
      await fetch(`/users/refuse/${u._id}`, { method: "POST" });
      this.loadRequests();
    },
    async approveRequest(r) {
      await fetch(`/books/requests/${r._id}/approve`, { method: "POST" });
      this.loadRequests();
    },
    async refuseRequest(r) {
      await fetch(`/books/requests/${r._id}/refuse`, { method: "POST" });
      this.loadRequests();
    },
    logout() {
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  },
  mounted() {
    if (!this.user) return (window.location.href = "/");
    this.loadRequests();
  }
}).mount("#app");
