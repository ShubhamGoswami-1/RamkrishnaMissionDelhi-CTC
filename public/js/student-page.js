document.addEventListener('DOMContentLoaded', function() {
    const addStudentButton = document.getElementById('addStudentButton');
    const studentFormModal = document.getElementById('studentFormModal');
    const closeButtons = document.querySelectorAll('.close');
    const studentsTable = document.getElementById('studentsTable');
    const searchInput = document.getElementById('searchInput');
    const searchCategory = document.getElementById('searchCategory');
    const filterIcon = document.getElementById('filterIcon');
    const searchDropdown = document.getElementById('searchDropdown');
    const aadhaarNoInput = document.getElementById('aadhaarNo');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    const aadhaarError = document.getElementById('aadhaarError');
    const phoneError = document.getElementById('phoneError');
    const studentForm = document.getElementById('studentForm');

    // Function to filter students based on search category
    function filterStudents() {
        let filter = searchInput.value.toLowerCase();
        let category = searchCategory.value;
        let rows = studentsTable.querySelectorAll('tbody tr');

        rows.forEach(row => {
            let cell = row.querySelector(`td:nth-child(${category === 'name' ? 1 : category === 'fathersName' ? 2 : category === 'aadhaarNo' ? 3 : category === 'phone' ? 4 : 5})`);
            if (cell.innerText.toLowerCase().includes(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Function to open the add student form modal
    function openForm() {
        studentFormModal.style.display = "flex";
    }

    // Function to close the add student form modal
    function closeForm() {
        studentFormModal.style.display = "none";
    }

    // Function to populate table rows with student data
    function populateStudentsTable(students) {
        const tbody = studentsTable.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows

        students.forEach(student => {
            const row = document.createElement('tr');
            row.dataset.studentId = student._id; // Assuming _id is your student's unique identifier

            // Example: Populate table cells with student data
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.fathersName}</td>
                <td>${student.aadhaarNo}</td>
                <td>${student.phone}</td>
                <td>${student.address}</td>
            `;

            row.addEventListener('click', function() {
                viewStudentDetails(student._id);
            });

            tbody.appendChild(row);
        });
    }

    // Fetch all students when page loads
    fetch('/api/v1/student/get-all-students')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                populateStudentsTable(data.students); // Populate table with fetched students
            } else {
                console.error('Error fetching students:', data.error);
            }
        })
        .catch(error => console.error('Error fetching students:', error));

    // Function to redirect to student details page
    function viewStudentDetails(studentId) {
        window.location.href = `/students/details/${studentId}`;
    }

    // Bind event handlers
    addStudentButton.addEventListener('click', openForm);
    closeButtons.forEach(button => {
        button.addEventListener('click', closeForm);
    });

    // Handle dynamic table row clicks
    filterIcon.addEventListener('click', function(event) {
        searchDropdown.classList.toggle('active');
    });

    searchCategory.addEventListener('change', function() {
        searchInput.dispatchEvent(new Event('input')); // Trigger the search when the category changes
    });

    searchInput.addEventListener('input', function() {
        let filter = this.value.toLowerCase();
        let category = searchCategory.value;

        if (filter.length > 0) {
            fetch(`/api/v1/student/search?searchText=${filter}&category=${category}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        populateStudentsTable(data.students); // Populate table with search results
                    } else {
                        console.error('Error searching students:', data.error);
                    }
                })
                .catch(error => console.error('Error searching students:', error));
        } else {
            // If the search input is cleared, fetch all students again
            fetch('/api/v1/student/get-all-students')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        populateStudentsTable(data.students); // Populate table with all students
                    } else {
                        console.error('Error fetching students:', data.error);
                    }
                })
                .catch(error => console.error('Error fetching students:', error));
        }
    });

    // Ensure only digits are allowed in Aadhaar Number and Phone fields
    function restrictToDigits(event) {
        event.target.value = event.target.value.replace(/\D/g, '');
    }

    aadhaarNoInput.addEventListener('input', restrictToDigits);
    phoneInput.addEventListener('input', restrictToDigits);

    // Validate email format
    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailPattern.test(email);
    }    

    // Validate Aadhaar number length
    function validateAadhaar(aadhaarNo) {
        return aadhaarNo.length === 12;
    }

    // Validate phone number length
    function validatePhone(phone) {
        return phone.length === 10;
    }

    // Handle form submission
    studentForm.addEventListener('submit', function(event) {
        let isValid = true;

        if (!validateEmail(emailInput.value)) {
            isValid = false;
            emailError.style.display = 'block';
        } else {
            emailError.style.display = 'none';
        }

        if (!validateAadhaar(aadhaarNoInput.value)) {
            isValid = false;
            aadhaarError.style.display = 'block';
        } else {
            aadhaarError.style.display = 'none';
        }

        if (!validatePhone(phoneInput.value)) {
            isValid = false;
            phoneError.style.display = 'block';
        } else {
            phoneError.style.display = 'none';
        }

        if (!isValid) {
            event.preventDefault();
        }
    });

    function downloadExcelFile() {
        window.location.href = '/api/v1/student/download-students';
    }

    // Add event listener to download button
    const downloadButton = document.getElementById('downloadExcelButton');
    downloadButton.addEventListener('click', downloadExcelFile);
});