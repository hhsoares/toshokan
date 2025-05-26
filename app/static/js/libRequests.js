// static/js/libRequests.js
const { createApp } = Vue;

createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      user: JSON.parse(
        sessionStorage.getItem("user") ||
        localStorage.getItem("user") ||
        "null"
      ),
      pendingUsers: [],
      bookRequests: [],
    };
  },
  methods: {
    async loadRequests() {
      try {
        const [usersRes, booksRes] = await Promise.all([
          fetch("/users/pending"),
          fetch("/books/requests")
        ]);
        this.pendingUsers = await usersRes.json();
        this.bookRequests  = await booksRes.json();
      } catch (err) {
        alert("Failed to load requests: " + err.message);
      }
    },

    async approveUser(u) {
      try {
        const res  = await fetch(`/users/approve/${u._id}`, { method: "POST" });
        const body = await res.json();
        if (res.ok) {
          alert(`✔️ ${body.message}`);
        } else {
          alert(`❌ ${body.error || body.message}`);
        }
      } catch (err) {
        alert("Server error: " + err.message);
      } finally {
        this.loadRequests();
      }
    },

    async refuseUser(u) {
      try {
        const res  = await fetch(`/users/refuse/${u._id}`, { method: "POST" });
        const body = await res.json();
        if (res.ok) {
          alert(`✔️ ${body.message}`);
        } else {
          alert(`❌ ${body.error || body.message}`);
        }
      } catch (err) {
        alert("Server error: " + err.message);
      } finally {
        this.loadRequests();
      }
    },

    async approveRequest(r) {
      try {
        const res  = await fetch(`/books/requests/${r._id}/approve`, { method: "POST" });
        const body = await res.json();
        if (res.ok) {
          alert(`✔️ ${body.message}`);
        } else {
          alert(`❌ ${body.error || body.message}`);
        }
      } catch (err) {
        alert("Server error: " + err.message);
      } finally {
        this.loadRequests();
      }
    },

    async refuseRequest(r) {
      try {
        const res  = await fetch(`/books/requests/${r._id}/refuse`, { method: "POST" });
        const body = await res.json();
        if (res.ok) {
          alert(`✔️ ${body.message}`);
        } else {
          alert(`❌ ${body.error || body.message}`);
        }
      } catch (err) {
        alert("Server error: " + err.message);
      } finally {
        this.loadRequests();
      }
    },

    logout() {
      sessionStorage.removeItem("user");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  },

  mounted() {
    if (!this.user) {
      window.location.href = "/";
      return;
    }
    this.loadRequests();
  }
}).mount("#app");
