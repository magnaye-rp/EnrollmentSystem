document
  .getElementById("registrationForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent page reload

    // Get input values
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill out all fields.");
      return;
    }

    // Simple email format check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Confirmation password does not match.");
      return;
    }

    // Disable submit button
    const submitButton = this.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Registering...";

    const apiUrl = "http://localhost:5000/register";
    const requestBody = { fullName: name, email: email, pass: password };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);

      if (data.message === "Registration successful!") {
        window.location.href = "login.html";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = "Register";
    }
  });
