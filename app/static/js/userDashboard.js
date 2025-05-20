console.log("Loading userDashboard.js");

window.addEventListener("storage", (event) => {
  console.log("Storage event:", event);
});

const { createApp } = Vue;

createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      user: null,
      searchQuery: ""
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("user");
      window.location.href = "/";
    },
    goToSearch() {
      if (this.searchQuery.trim()) {
        window.location.href = `/search?q=${encodeURIComponent(this.searchQuery.trim())}`;
      }
    }
  },
  mounted() {
    let storedUser = localStorage.getItem("user");
    if (!storedUser) {
      storedUser = sessionStorage.getItem("user");
    }
    console.log("storedUser:", storedUser);

    if (!storedUser) {
      window.location.href = "/";
    } else {
      this.user = JSON.parse(storedUser);
    }
  }
}).mount("#app");
