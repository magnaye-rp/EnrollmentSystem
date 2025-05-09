document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:5000/stats")
    .then((response) => response.json())
    .then((data) => {
      document.querySelector(
        ".stat-card:nth-child(1) .stat-info h3"
      ).textContent = data.totalStudents.toLocaleString();
      document.querySelector(
        ".stat-card:nth-child(2) .stat-info h3"
      ).textContent = data.coursesOffered.toLocaleString();
      document.querySelector(
        ".stat-card:nth-child(3) .stat-info h3"
      ).textContent = data.activeEnrollments.toLocaleString();
    })
    .catch((error) => {
      console.error("Error fetching stats:", error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#userManagement table tbody");
  const paginationControls = document.querySelector(
    "#userManagement .table-footer .pagination-controls"
  );
  const paginationInfo = document.querySelector(
    "#userManagement .table-footer .pagination-info"
  );
  const usersPerPage = 3; // Define the number of users to display per page
  let currentPage = 1;
  let totalPages = 1; // Initialize totalPages

  function loadUsers(page) {
    fetch(
      `http://localhost:5000/student_list?page=${page}&limit=${usersPerPage}`
    )
      .then((response) => response.json())
      .then((data) => {
        const users = data.users;
        totalPages = data.total_pages;
        currentPage = data.current_page;

        tableBody.innerHTML = ""; // Clear existing rows
        users.forEach((user) => {
          const row = tableBody.insertRow();
          // ... (rest of your code to create table cells for each user) ...
          const avatarCell = row.insertCell();
          avatarCell.innerHTML = `
            <div class="user-avatar">
              <img
                src="https://ui-avatars.com/api/?name=${user.name}&background=random"
                alt="${user.name}"
              />
              ${user.name}
            </div>
          `;

          const emailCell = row.insertCell();
          emailCell.textContent = user.email;

          const roleCell = row.insertCell();
          let badgeClass = "";
          if (user.role.toLowerCase() === "student") {
            badgeClass = "badge-student";
          } else if (user.role.toLowerCase() === "faculty") {
            badgeClass = "badge-faculty";
          } else if (user.role.toLowerCase() === "admin") {
            badgeClass = "badge-admin";
          }
          roleCell.innerHTML = `<span class="badge ${badgeClass}">${user.role}</span>`;

          const actionsCell = row.insertCell();
          actionsCell.innerHTML = `
            <button class="btn-icon btn-danger delete-btn" data-user-id="${user.id}">
              <i class="fas fa-trash"></i>
            </button>
          `;
        });

        updatePaginationControls();
        updatePaginationInfo(data.users.length, totalPages, currentPage);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }

  function updatePaginationInfo(currentCount, totalPages, currentPage) {
    if (paginationInfo) {
      const start = (currentPage - 1) * usersPerPage + 1;
      const end = Math.min(start + currentCount - 1, totalPages * usersPerPage);
      const totalEntries = totalPages * usersPerPage; // Assuming each page is full for simplicity in display
      paginationInfo.textContent = `Showing ${start} to ${end} of ${totalEntries} entries`;
    }
  }

  function updatePaginationControls() {
    if (paginationControls) {
      paginationControls.innerHTML = ""; // Clear existing buttons

      // Previous button
      const prevButton = document.createElement("button");
      prevButton.classList.add("btn-icon");
      prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
      prevButton.disabled = currentPage === 1;
      prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          loadUsers(currentPage);
        }
      });
      paginationControls.appendChild(prevButton);

      // Page number buttons (display a limited range around the current page)
      const maxVisiblePages = 5;
      let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (totalPages > maxVisiblePages && endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("button");
        pageButton.classList.add("btn-icon");
        pageButton.textContent = i;
        if (i === currentPage) {
          pageButton.classList.add("active");
        }
        pageButton.addEventListener("click", () => {
          currentPage = i;
          loadUsers(currentPage);
        });
        paginationControls.appendChild(pageButton);
      }

      // Next button
      const nextButton = document.createElement("button");
      nextButton.classList.add("btn-icon");
      nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
      nextButton.disabled = currentPage === totalPages || totalPages === 0;
      nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          loadUsers(currentPage);
        }
      });
      paginationControls.appendChild(nextButton);
    }
  }

  // Initial load
  loadUsers(currentPage);

  // Add new student button (remains the same for now)
  const addStudentButton = document.querySelector(
    "#userManagement .section-header .btn-primary"
  );
  if (addStudentButton) {
    addStudentButton.addEventListener("click", showAddStudentModal);
  }

  // Event delegation for edit and delete buttons (remains the same)
  tableBody.addEventListener("click", function (event) {
    // ... (your edit and delete button logic) ...
    if (
      event.target.classList.contains("edit-btn") ||
      event.target.closest(".edit-btn")
    ) {
      const userId =
        event.target.dataset.userId ||
        event.target.closest(".edit-btn").dataset.userId;
      alert(`Edit user with ID: ${userId}`);
    } else if (
      event.target.classList.contains("delete-btn") ||
      event.target.closest(".delete-btn")
    ) {
      const userId =
        event.target.dataset.userId ||
        event.target.closest(".delete-btn").dataset.userId;
      if (confirm(`Are you sure you want to delete user with ID: ${userId}?`)) {
        fetch(`/api/users/${userId}/delete`, { method: "DELETE" })
          .then((response) => {
            if (response.ok) {
              loadUsers(currentPage); // Reload current page after deletion
            } else {
              console.error("Error deleting user");
            }
          })
          .catch((error) => console.error("Error deleting user:", error));
      }
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#courseManagement table tbody");
  const paginationControls = document.querySelector(
    "#courseManagement .table-footer .pagination-controls"
  );
  const paginationInfo = document.querySelector(
    "#courseManagement .table-footer .pagination-info"
  );
  const coursesPerPage = 3;
  let currentPage = 1;
  let totalPages = 1;

  function loadCourses(page) {
    fetch(
      `http://localhost:5000/courses_list?page=${page}&limit=${coursesPerPage}`
    )
      .then((response) => response.json())
      .then((data) => {
        const courses = data.courses;
        totalPages = data.total_pages;
        currentPage = data.current_page;

        tableBody.innerHTML = "";
        courses.forEach((course) => {
          const row = tableBody.insertRow();

          // Hidden data attribute to store the courseId
          row.dataset.courseId = course.courseId;

          const nameCell = row.insertCell();
          nameCell.textContent = course.courseName;

          const timeCell = row.insertCell();
          timeCell.textContent = course.courseTime;

          const dayCell = row.insertCell();
          dayCell.textContent = course.courseDay;

          const capacityCell = row.insertCell();
          capacityCell.textContent = course.capacity;

          const actionsCell = row.insertCell();
          actionsCell.innerHTML = `
                        <button class="btn-icon edit-btn" data-course-id="${course.courseId}">
                            <i class="fas fa-edit"></i>
                        </button>
                    `;
        });

        updatePaginationControls();
        updatePaginationInfo(courses.length, totalPages, currentPage);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  }

  function updatePaginationInfo(currentCount, totalPages, currentPage) {
    if (paginationInfo) {
      const start = (currentPage - 1) * coursesPerPage + 1;
      const end = Math.min(
        start + currentCount - 1,
        totalPages * coursesPerPage
      );
      const totalEntries = totalPages * coursesPerPage;
      paginationInfo.textContent = `Showing ${start} to ${end} of ${totalEntries} entries`;
    }
  }

  function updatePaginationControls() {
    if (paginationControls) {
      paginationControls.innerHTML = "";

      const prevButton = document.createElement("button");
      prevButton.classList.add("btn-icon");
      prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
      prevButton.disabled = currentPage === 1;
      prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          loadCourses(currentPage);
        }
      });
      paginationControls.appendChild(prevButton);

      const maxVisiblePages = 5;
      let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (totalPages > maxVisiblePages && endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement("button");
        pageButton.classList.add("btn-icon");
        pageButton.textContent = i;
        if (i === currentPage) {
          pageButton.classList.add("active");
        }
        pageButton.addEventListener("click", () => {
          currentPage = i;
          loadCourses(currentPage);
        });
        paginationControls.appendChild(pageButton);
      }

      const nextButton = document.createElement("button");
      nextButton.classList.add("btn-icon");
      nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
      nextButton.disabled = currentPage === totalPages || totalPages === 0;
      nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          loadCourses(currentPage);
        }
      });
      paginationControls.appendChild(nextButton);
    }
  }

  loadCourses(currentPage); // Initial load

  const addCourseButton = document.querySelector(
    "#courseManagement .section-header .btn-primary"
  );
  if (addCourseButton) {
    addCourseButton.addEventListener("click", showAddCourseModal);
  }

  tableBody.addEventListener("click", function (event) {
    if (
      event.target.classList.contains("edit-btn") ||
      event.target.closest(".edit-btn")
    ) {
      // Access the courseId from the data attribute of the table row
      const row = event.target.closest("tr");
      const courseId = row.dataset.courseId;
      alert(`Edit course with ID: ${courseId}`);
      // Implement your edit functionality here, using the courseId
    }
  });
});

let enrollmentChartInstance = null;
// This script is for the admin dashboard of the LMS.
// It includes functions to load top courses, recent enrollments, and monthly enrollment trends.
// It also includes functions to generate reports and export data in different formats.
// The script uses the Chart.js library to create a bar chart for the monthly enrollment trend.
document.addEventListener("DOMContentLoaded", function () {
  let enrollmentChartInstance = null;
  loadTopCourses();
  loadRecentEnrollments(1);
  loadMonthlyEnrollmentTrend();
});

async function loadTopCourses() {
  try {
    const response = await fetch(
      "http://localhost:5000/analytics?type=course_ranking"
    );
    const data = await response.json();
    const topCoursesList = document.getElementById("topCoursesList");
    topCoursesList.innerHTML = "";

    data.slice(0, 3).forEach((course) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${course.course_name} (${course.total_enrollments} students)`;
      topCoursesList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching top courses:", error);
    const topCoursesList = document.getElementById("topCoursesList");
    topCoursesList.innerHTML = "<li>Error loading top courses.</li>";
  }
}

let currentPageRecentEnrollments = 1;
const recentEnrollmentsLimit = 3;

async function loadRecentEnrollments(page) {
  currentPageRecentEnrollments = page;
  try {
    const response = await fetch(
      `http://localhost:5000/analytics?type=recent_enrollments&page=${page}&limit=${recentEnrollmentsLimit}`
    );
    const data = await response.json();
    const recentEnrollmentsList = document.getElementById(
      "recentEnrollmentsList"
    );
    recentEnrollmentsList.innerHTML = "";
    const paginationContainer = document.getElementById(
      "recentEnrollmentsPagination"
    );
    paginationContainer.innerHTML = "";

    if (data && data.length > 0) {
      data.forEach((enrollment) => {
        const listItem = document.createElement("li");
        const enrollmentDate = new Date(
          enrollment.enrollment_date
        ).toLocaleDateString();
        listItem.textContent = `${enrollment.student_name} - ${enrollment.course_name} (${enrollmentDate})`;
        recentEnrollmentsList.appendChild(listItem);
      });

      const prevButton = document.createElement("button");
      prevButton.textContent = "Previous";
      prevButton.disabled = currentPageRecentEnrollments === 1;
      prevButton.onclick = () =>
        loadRecentEnrollments(currentPageRecentEnrollments - 1);
      paginationContainer.appendChild(prevButton);

      const nextButton = document.createElement("button");
      nextButton.textContent = "Next";
      nextButton.onclick = () =>
        loadRecentEnrollments(currentPageRecentEnrollments + 1);
      paginationContainer.appendChild(nextButton);
    } else {
      recentEnrollmentsList.innerHTML = "<li>No recent enrollments found.</li>";
    }
  } catch (error) {
    console.error("Error fetching recent enrollments:", error);
    const recentEnrollmentsList = document.getElementById(
      "recentEnrollmentsList"
    );
    recentEnrollmentsList.innerHTML =
      "<li>Error loading recent enrollments.</li>";
  }
}

async function loadMonthlyEnrollmentTrend() {
  try {
    const response = await fetch(
      "http://localhost:5000/analytics?type=monthly_trend"
    );
    const data = await response.json();
    console.log("Data from API:", data);
    const labels = data.map((item) => item.month);
    const enrollmentCounts = data.map((item) => item.total_enrollments);

    const chartCanvas = document.getElementById("enrollmentChart");
    const enrollmentChart = new Chart(chartCanvas, {
      type: "bar", // You can change the chart type (e.g., 'line', 'pie')
      data: {
        labels: labels,
        datasets: [
          {
            label: "Monthly Enrollments",
            data: enrollmentCounts,
            backgroundColor: "rgba(54, 162, 235, 0.7)", // Blue color
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Enrollments",
            },
          },
          x: {
            title: {
              display: true,
              text: "Month",
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching monthly enrollment trend:", error);
    const chartContainer = document.querySelector(".chart-container");
    chartContainer.innerHTML =
      "<p>Error loading monthly enrollment trend chart.</p>";
  }
}

function generateReport() {
  loadTopCourses();
  loadRecentEnrollments(1);
  loadMonthlyEnrollmentTrend();
  alert("Report generated!");
  location.reload();
  href = "#enrollmentReports";
}

function exportCSV() {
  exportCSV();
  alert("Exported CSV");
}

function exportPDF() {
  exportPDF();
  alert("Exported PDF");
}

function showAddStudentModal() {
  const modal = document.getElementById("addStudentModal");
  modal.style.display = "flex";

  setupModalCloseHandlers(modal);
  setupStudentFormSubmission(modal);
}

function setupModalCloseHandlers(modal) {
  const closeModal = () => (modal.style.display = "none");

  document.querySelectorAll(".close-modal").forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

function setupStudentFormSubmission(modal) {
  const form = document.getElementById("addStudentForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const studentData = {
      name: document.getElementById("studentName").value,
      email: document.getElementById("studentEmail").value,
      password: document.getElementById("studentPassword").value,
    };

    fetch("http://localhost:5000/add_student", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          //alert("Student added successfully!");
          showTimedAlert("Student added successfully!", 3000);
          modal.style.display = "none";
          form.reset();
          loadUsers(currentPage); // Refresh the table
        } else {
          alert("Error: " + (data.message || "Failed to add student"));
        }
      });
    if (!error.message.includes("200")) {
      alert("Error adding student. Please try again.");
    }
  });
}

function showTimedAlert(message, delay) {
  const alertBox = document.createElement("div");
  alertBox.textContent = message;
  alertBox.style.position = "fixed";
  alertBox.style.top = "20px";
  alertBox.style.left = "50%";
  alertBox.style.transform = "translateX(-50%)";
  alertBox.style.padding = "10px 20px";
  alertBox.style.background = "#1f2937";
  alertBox.style.color = "white";
  alertBox.style.borderRadius = "4px";
  alertBox.style.zIndex = "1000";
  alertBox.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";

  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.style.opacity = "0";
    setTimeout(() => alertBox.remove(), 300); // Fade-out animation
  }, delay);
}

function showAddCourseModal() {
  const modal = document.getElementById("addCourseModal");
  modal.style.display = "flex";

  setupModalCloseHandlers(modal);
  setupCourseFormSubmission(modal);
}

function setupCourseFormSubmission(modal) {
  const form = document.getElementById("addCourseForm");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const courseData = {
      course_name: document.getElementById("courseName").value,
      schedule_time: document.getElementById("courseTime").value,
      schedule_day: document.getElementById("courseDay").value,
      capacity: parseInt(document.getElementById("courseCapacity").value),
    };

    fetch("http://localhost:5000/add_course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(courseData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showTimedAlert("Course added successfully!", 3000);
          modal.style.display = "none";
          form.reset();
          loadCourses(currentPage);
        } else {
          alert("Error: " + (data.message || "Failed to add course"));
        }
      });
    if (!error.message.includes("200")) {
      alert("Error adding student. Please try again.");
    }
  });
}

async function exportCSV() {
  try {
    const response = await fetch(
      "http://localhost:5000/analytics/export?format=csv"
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "enrollment_report.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    alert("Failed to export CSV.");
  }
}
async function exportPDF() {
  try {
    const response = await fetch(
      "http://localhost:5000/analytics/export?format=pdf"
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "enrollment_report.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    alert("Failed to export PDF.");
  }
}
