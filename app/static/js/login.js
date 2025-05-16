// login.js
const { createApp } = Vue;

createApp({
  data() {
    return {
      email: '',
      password: '',
      remember: false
    };
  },
  methods: {
    async loginUser() {
      const payload = {
        email: this.email,
        password: this.password
      };

      try {
        const response = await fetch("http://127.0.0.1:5000/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          alert(`Error: ${data.error}`);
        } else {
          localStorage.setItem("user", JSON.stringify(data.user));
          setTimeout(() => {
            if (data.user.is_librarian) {
              window.location.href = "/librarian-dashboard";
            } else {
              window.location.href = "/dashboard";
            }
          }, 100);
        }
      } catch (err) {
        alert("Server error. Please try again later.");
        console.error(err);
      }
    }
  }
}).mount("#app");
