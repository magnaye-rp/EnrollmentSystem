document.getElementById("receipt").addEventListener("change", function (e) {
  const fileName = e.target.files[0]
    ? e.target.files[0].name
    : "No file chosen";
  document.querySelector(".file-name").textContent = fileName;
});

// Menu toggle functionality
document.querySelector(".menu-toggle").addEventListener("click", function () {
  document.body.classList.toggle("sidebar-collapsed");
});

// Function to get the student ID from the URL
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

const studentId = getCookie("studentId");
const studentName = getCookie("studentName");

loadEnrollmentStats(studentId);
loadEnrolledCourses(studentId);

document.addEventListener("DOMContentLoaded", () => {
  const welcomeText = document.querySelector(".welcome-content h2");
  if (studentName && welcomeText) {
    welcomeText.textContent = `Welcome back, ${studentName}!`;
  }
});

// Update profile name
const profileNameSpan = document.querySelector(".user-profile span");
if (profileNameSpan) {
  profileNameSpan.textContent = studentName;
}

// Update profile image using the name (so it shows correct avatar)
const profileImg = document.querySelector(".user-profile img");
if (profileImg) {
  profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    studentName
  )}&background=random`;
  profileImg.alt = studentName;
}

fetch("http://localhost:5000/available_courses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ student_id: studentId }),
})
  .then((response) => response.json())
  .then((data) => {
    if (data.data) {
      const courseContainer = document.querySelector(".course-listing");
      courseContainer.innerHTML = ""; // Clear existing courses

      data.data.forEach((course) => {
        // Use data.data to iterate through courses
        const courseCard = document.createElement("div");
        courseCard.classList.add("course-card");

        // Dynamic HTML based on your backend's course fields
        courseCard.innerHTML = `
              <div class="course-image" style="background-color: #e1f5fe">
                <i class="fas fa-laptop-code" style="color: #0288d1"></i>
              </div>
              <div class="course-content">
                <h3>${course.course_name}</h3>
                <div class="course-meta">
                  <span><i class="fas fa-clock"></i> ${
                    course.schedule_day
                  }, ${formatTime(course.schedule_time)}</span>
                </div>
                <div class="course-footer">
                  <div class="slots-info">
                    <span class="slots-left">${
                      course.capacity
                    }</span> slots remaining
                  </div>
                  <button class="btn btn-primary enroll-button" data-course-id="${
                    course.course_id
                  }">
                    <i class="fas fa-plus"></i> Enroll
                  </button>
                </div>
              </div>
            `;

        courseContainer.appendChild(courseCard);
      });

      // Add event listeners to each "Enroll" button after courses are rendered
      const enrollButtons = document.querySelectorAll(".enroll-button");
      enrollButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const courseId = button.getAttribute("data-course-id");

          // Enroll the student in the selected course
          enrollInCourse(studentId, courseId);

          // Update the UI without refreshing the page
          button.disabled = true; // Disable the enroll button to prevent multiple clicks
          button.innerText = "Enrolled"; // Change text to show enrollment status
        });
      });
    }
  })
  .catch((error) => {
    console.error("Error fetching courses:", error);
  });

function enrollInCourse(studentId, courseId) {
  fetch("http://localhost:5000/enroll_courses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      student_id: studentId,
      course_ids: [courseId],
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message === "All courses enrolled successfully!") {
        alert("You have successfully enrolled in the course!");
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error("Error enrolling in course:", error);
      alert("An error occurred while enrolling in the course.");
    });
}

// Fetch unpaid courses and populate the select dropdown
fetch("http://localhost:5000/to_pay", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ student_id: studentId }),
})
  .then((response) => response.json())
  .then((data) => {
    if (data.status === "success") {
      const unpaidSelect = document.getElementById("unpaid");
      unpaidSelect.innerHTML = "<option value=''>-- Select Course --</option>"; // Reset the dropdown

      data.unpaid_courses.forEach((course) => {
        const option = document.createElement("option");
        option.value = course.enrollment_id; // Set the enrollment ID as the value
        option.textContent = `${course.course_name} - ${formatDate(
          course.enrollment_date
        )}`;
        unpaidSelect.appendChild(option);
      });
    }
  })
  .catch((error) => {
    console.error("Error fetching unpaid courses:", error);
  });

// When a course is selected, show the static price
document.getElementById("unpaid").addEventListener("change", function (e) {
  const selectedEnrollmentId = e.target.value;
  if (selectedEnrollmentId) {
    // Static price for all courses (for cosmetic purposes)
    document.getElementById("coursePriceValue").textContent = "$100"; // Static price
    document.getElementById("coursePrice").style.display = "block"; // Show the price section
  } else {
    document.getElementById("coursePrice").style.display = "none"; // Hide if no course is selected
  }
});

document
  .getElementById("submitPaymentBtn")
  .addEventListener("click", function () {
    const unpaidSelect = document.getElementById("unpaid");
    const selectedEnrollmentId = unpaidSelect.value;

    // Check if a course has been selected
    if (!selectedEnrollmentId) {
      alert("Please select a course.");
      return;
    }
    // Static price for all courses (for cosmetic purposes)
    const paymentAmount = 100.0;

    const formData = new FormData();
    formData.append("enrollment_id", selectedEnrollmentId);
    formData.append("amount", paymentAmount);

    // Send the payment details to the backend
    fetch("http://localhost:5000/submit_payment", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          alert("Payment successful!");
          // Optionally, update UI or navigate to another page
          location.reload(); // Reload the page to refresh the data
        } else {
          alert("Payment failed: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error processing payment:", error);
        alert("An error occurred while processing your payment.");
      });
  });

function loadEnrolledCourses(studentId) {
  fetch("http://localhost:5000/course_list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ student_id: studentId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.data) {
        const enrollmentContainer =
          document.querySelector(".course-enrollment");
        enrollmentContainer.innerHTML = ""; // Clear existing cards

        data.data.forEach((course) => {
          const courseCard = document.createElement("div");
          courseCard.classList.add("course-card");

          courseCard.innerHTML = `
              <div class="course-content">
                <h3>${course.course_name}</h3>
                <div class="course-meta">

                </div>
                <div class="course-footer">
                  <div class="slots-info">
                    Enrollment Date:
                    <span class="slots-left">${formatDate(
                      course.enrollment_date
                    )}</span>
                  </div>
                </div>
              </div>
            `;

          enrollmentContainer.appendChild(courseCard);
        });
      } else {
        alert("No enrollments found!");
      }
    })
    .catch((error) => {
      console.error("Error fetching enrolled courses:", error);
    });
}

function loadEnrollmentStats(studentId) {
  fetch("http://localhost:5000/enrollment_summary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ student_id: studentId }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (
        data.total_enrolled !== undefined &&
        data.unpaid_courses !== undefined
      ) {
        document.querySelectorAll(
          ".welcome-content p"
        )[0].textContent = `You have ${data.total_enrolled} active enrollments this semester`;

        // Update the first stat (Courses Enrolled)
        document.querySelectorAll(
          ".welcome-stats .stat-item h3"
        )[0].textContent = data.total_enrolled;

        // Update the second stat (Unpaid Courses)
        document.querySelectorAll(
          ".welcome-stats .stat-item h3"
        )[1].textContent = data.unpaid_courses;
      } else {
        console.error("Invalid data from API", data);
      }
    })
    .catch((error) => {
      console.error("Error fetching stats:", error);
    });
}

// Helper to format time (e.g., "10:00:00" ➔ "10:00 AM")
function formatTime(timeStr) {
  const [hours, minutes, seconds] = timeStr.split(":");
  let hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // 0 becomes 12
  return `${hour}:${minutes} ${ampm}`;
}

// Helper to format date (e.g., "2024-05-06" ➔ "May 6, 2024")
function formatDate(dateStr) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}
