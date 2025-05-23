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
      // stub in an array of active_books on each user
      this.users.forEach(u => {
        u.status = u.is_librarian ? "active" : "active"; 
        u.active_books = u.active_books || [];
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
    deleteUser(u) {
      // call your API to suspend or delete
      alert(`suspend user ${u.email}`);
    }
  },
  mounted() {
    if (!this.user) return (window.location.href = "/");
    this.loadUsers();
  }
}).mount("#app");
