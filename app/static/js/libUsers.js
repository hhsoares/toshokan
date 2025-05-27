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
      // Edit modal data
      showEditModal: false,
      editUser: {
        _id: "",
        first_name: "",
        last_name: "",
        email: "",
        is_librarian: false
      },
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
    },
    // -------- EDIT USER MODAL -------
    openEditModal(user) {
      this.editUser = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        is_librarian: !!user.is_librarian
      };
      this.showEditModal = true;
    },
    closeEditModal() {
      this.showEditModal = false;
    },
    async submitEditUser() {
      // PATCH to /users/<id>
      const payload = {
        first_name: this.editUser.first_name,
        last_name: this.editUser.last_name,
        email: this.editUser.email,
        is_librarian: this.editUser.is_librarian
      };
      const res = await fetch(`/users/${this.editUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        this.closeEditModal();
        this.loadUsers();
      } else {
        alert("Failed to update user.");
      }
    },
  },
  mounted() {
    if (!this.user) return (window.location.href = "/");
    this.loadUsers();
  }
}).mount("#app");
