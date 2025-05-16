console.log("Loading userDashboard.js");

window.addEventListener("storage", (event) => {
  console.log("Storage event:", event);
});

const { createApp } = Vue;

createApp({
  delimiters: ["[[", "]]"],
  data() {
    return {
      user: null
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  },
  mounted() {
    const storedUser = localStorage.getItem("user");
    console.log("storedUser:", storedUser);

    if (!storedUser) {
      window.location.href = "/";
    } else {
      this.user = JSON.parse(storedUser);
    }
  }
}).mount("#app");
