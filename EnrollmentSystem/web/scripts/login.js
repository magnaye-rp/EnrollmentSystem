document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent page reload

  // Get selected role, username, and password
  const role = document.getElementById("role").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  let apiUrl = "";
  let requestBody = {};

  if (role === "admin") {
    apiUrl = "http://localhost:5000/admin_login";
    requestBody = { username: username, password: password };
  } else if (role === "student") {
    apiUrl = "http://localhost:5000/login";
    requestBody = { email: username, password: password };
  }

  // Call API
  if (apiUrl) {
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        if (data.message === "Login successful!") {
          // Optional: store email in localStorage/sessionStorage
          localStorage.setItem("email", data.email); // Renamed user_id to email

          // Redirect to dashboard based on role
          if (role === "admin") {
            window.location.href = "admindashboard.html";
          } else if (role === "student") {
            window.location.href = "studentdashboard.html"; // Assuming you have a student dashboard
          }
        } else {
          // Show error message
          alert(data.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  } else {
    alert("Please select a role.");
  }
});
