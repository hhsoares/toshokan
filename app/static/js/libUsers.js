const { createApp } = Vue;

createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      user: JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null"),
      users: [],
      searchQuery: "",
      sortKey: "index",
      sortAsc: true,
      showSuspendModal: false,
      selectedUser: null,
    };
  },
  computed: {
    filteredUsers() {
      let list = this.users.filter(u =>
        (`${u.first_name} ${u.last_name}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
         u.email.toLowerCase().includes(this.searchQuery.toLowerCase()))
      );
      const key = this.sortKey;
      list.sort((a, b) => {
        let va = key === "index" ? this.users.indexOf(a) : (a[key] || "").toString().toLowerCase();
        let vb = key === "index" ? this.users.indexOf(b) : (b[key] || "").toString().toLowerCase();
        if (va < vb) return this.sortAsc ? -1 : 1;
        if (va > vb) return this.sortAsc ? 1 : -1;
        return 0;
      });
      return list;
    }
  },
  methods: {
    async loadUsers() {
      const res = await fetch("/users");
      this.users = await res.json();
      this.users.forEach(u => {
        u.status = u.suspended ? "suspended" : "active";
        u.active_books = u.active_books || [];
      });
    },
    async removeBook(userId, bookName) {
      const confirmDelete = confirm(`Remove "${bookName}" from this user?`);
      if (!confirmDelete) return;

      await fetch(`/books/user/${userId}/book/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_name: bookName })
      });

      this.loadUsers();
    },
    async extendBook(userId, bookName) {
      await fetch(`/books/user/${userId}/book/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_name: bookName })
      });

      this.loadUsers();
    },
    openSuspendModal(user) {
      this.selectedUser = user;
      this.showSuspendModal = true;
    },
    closeSuspendModal() {
      this.showSuspendModal = false;
      this.selectedUser = null;
    },
    async suspendUser() {
      if (!this.selectedUser) return;

      const payload = {
        duration: "permanent"
      };

      await fetch(`/users/suspend/${this.selectedUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      this.closeSuspendModal();
      this.loadUsers();
    },
    async unsuspendUser(userId) {
      await fetch(`/users/unsuspend/${userId}`, {
        method: "POST"
      });
      this.loadUsers();
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
    deleteUser(u) {
      this.openSuspendModal(u);
    }
  },
  mounted() {
    if (!this.user) return (window.location.href = "/");
    this.loadUsers();
  }
}).mount("#app");
