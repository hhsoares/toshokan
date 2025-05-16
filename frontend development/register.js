// register.js
const { createApp } = Vue;

createApp({
  data() {
    return {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
      is_librarian: false,
    };
  },
  methods: {
    async registerUser() {
      console.log("registerUser() called");

      // Optional password match check (client-side)
      if (this.password !== this.confirm_password) {
        alert("Passwords do not match.");
        return;
      }

      const payload = {
        first_name: this.first_name,
        last_name: this.last_name,
        email: this.email,
        password: this.password,
        confirm_password: this.confirm_password,
        is_librarian: this.is_librarian,
      };

      try {
        const response = await fetch('http://127.0.0.1:5000/users/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("Response:", data);

        if (!response.ok) {
          alert(`Error: ${data.error || "Unknown error"}`);
        } else {
          alert(data.message || "User registered successfully!");
          window.location.href = 'loginScreen.html';
        }
      } catch (err) {
        alert('Server error. Please try again later.');
        console.error('Fetch error:', err);
      }
    },
  },
  mounted() {
    console.log("Vue app mounted.");
  }
}).mount('#app');
