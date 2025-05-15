console.log("Loading userDashboard.js");

window.addEventListener("storage", (event) => {
  console.log("Storage event:", event);
});

const { createApp } = Vue;

createApp({
  data() {
    return {
      user: null
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("user");
      window.location.href = "../home/loginScreen.html";
    }
  },
  mounted() {
    const storedUser = localStorage.getItem("user");
    console.log("storedUser:", storedUser);

    if (!storedUser) {
      window.location.href = "../home/loginScreen.html";
    } else {
      this.user = JSON.parse(storedUser);
    }
  }
}).mount("#app");
