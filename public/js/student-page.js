document.addEventListener('DOMContentLoaded', function () {
    const addStudentButton = document.getElementById('addStudentButton');
    const studentFormModal = document.getElementById('studentFormModal');
    const closeButtons = document.querySelectorAll('.close');
    const studentsTable = document.getElementById('studentsTable');
    const searchInput = document.getElementById('searchInput');
    const searchCategory = document.getElementById('searchCategory');
    const filterIcon = document.getElementById('filterIcon');
    const searchDropdown = document.getElementById('searchDropdown');
    const studentForm = document.getElementById('studentForm');
    const nameInput = document.getElementById('name');
    const fathersNameInput = document.getElementById('fathersName');
    const emailInput = document.getElementById('email');
    const aadhaarNoInput = document.getElementById('aadhaarNo');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const nameError = document.getElementById('nameError');
    const fathersNameError = document.getElementById('fathersNameError');
    const emailError = document.getElementById('emailError');
    const aadhaarError = document.getElementById('aadhaarError');
    const phoneError = document.getElementById('phoneError');
    const addressError = document.getElementById('addressError');

    // Function to populate table rows with student data
    function populateStudentsTable(students) {
        const tbody = studentsTable.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows

        students.forEach(student => {
            const row = document.createElement('tr');
            row.dataset.studentId = student._id;

            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.fathersName}</td>
                <td>${student.aadhaarNo}</td>
                <td>${student.phone}</td>
                <td>${student.address}</td>
            `;

            row.addEventListener('click', function () {
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
                populateStudentsTable(data.students);
            } else {
                console.error('Error fetching students:', data.error);
            }
        })
        .catch(error => console.error('Error fetching students:', error));

    // Function to open the add student form modal
    function openForm() {
        studentFormModal.style.display = "flex";
    }

    // Function to close the add student form modal
    function closeForm() {
        studentFormModal.style.display = "none";
    }

    // Function to redirect to student details page
    function viewStudentDetails(studentId) {
        window.location.href = `/students/details/${studentId}`;
    }

    // Handle form submission
    studentForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        let isValid = true;

        if (nameInput.value.trim() === '') {
            isValid = false;
            nameError.textContent = 'Name is required';
        } else {
            nameError.textContent = '';
        }

        if (fathersNameInput.value.trim() === '') {
            isValid = false;
            fathersNameError.textContent = 'Father\'s name is required';
        } else {
            fathersNameError.textContent = '';
        }

        if (!validateEmail(emailInput.value)) {
            isValid = false;
            emailError.textContent = 'Invalid email address';
        } else {
            emailError.textContent = '';
        }

        if (!validateAadhaar(aadhaarNoInput.value)) {
            isValid = false;
            aadhaarError.textContent = 'Invalid Aadhaar number';
        } else {
            aadhaarError.textContent = '';
        }

        if (!validatePhone(phoneInput.value)) {
            isValid = false;
            phoneError.textContent = 'Invalid phone number';
        } else {
            phoneError.textContent = '';
        }

        if (addressInput.value.trim() === '') {
            isValid = false;
            addressError.textContent = 'Address is required';
        } else {
            addressError.textContent = '';
        }

        if (isValid) {
            const studentData = {
                name: nameInput.value,
                fathersName: fathersNameInput.value,
                email: emailInput.value,
                aadhaarNo: aadhaarNoInput.value,
                gender: document.getElementById('gender').value,
                phone: phoneInput.value,
                dob: document.getElementById('dob').value,
                address: addressInput.value,
                education: document.getElementById('education').value,
                reference: document.getElementById('reference').value
            };

            fetch('/api/v1/student/add-new-student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(studentData)
            })
            .then(response => {
                if (response.status === 201) {
                    window.location.href = 'http://localhost:3000/students';
                } else {
                    return response.json();
                }
            })
            .then(data => {
                if (data && data.message) {
                    alert(`Error: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error adding student:', error);
                alert('An error occurred while adding the student. Please try again.');
            });
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

    // Function to filter students based on search category
    // function filterStudents() {
    //     let filter = searchInput.value.toLowerCase();
    //     let category = searchCategory.value;
    //     let rows = studentsTable.querySelectorAll('tbody tr');

    //     rows.forEach(row => {
    //         let cell = row.querySelector(`td:nth-child(${category === 'name' ? 1 : category === 'fathersName' ? 2 : category === 'aadhaarNo' ? 3 : category === 'phone' ? 4 : 5})`);
    //         if (cell.innerText.toLowerCase().includes(filter)) {
    //             row.style.display = '';
    //         } else {
    //             row.style.display = 'none';
    //         }
    //     });
    // }

    // Handle search functionality
    // searchInput.addEventListener('input', filterStudents);
    // searchCategory.addEventListener('change', filterStudents);


    function searchStudents() {
        const filter = searchInput.value;
        const category = searchCategory.value;

        if (filter.length > 0) {
            fetch(`/api/v1/student/search?searchText=${encodeURIComponent(filter)}&category=${category}`)
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
    }

    // Handle search functionality
    searchInput.addEventListener('input', searchStudents);
    searchCategory.addEventListener('change', searchStudents);

    // Handle filter icon click
    filterIcon.addEventListener('click', function() {
        searchDropdown.classList.toggle('active');
    });


    // Handle filter icon click
    filterIcon.addEventListener('click', function () {
        searchDropdown.classList.toggle('active');
    });

    // Open and close the form modal
    addStudentButton.addEventListener('click', openForm);
    closeButtons.forEach(button => {
        button.addEventListener('click', closeForm);
    });

    function downloadExcelFile() {
        window.location.href = '/api/v1/student/download-students';
    }

    // Add event listener to download button
    const downloadButton = document.getElementById('downloadExcelButton');
    downloadButton.addEventListener('click', downloadExcelFile);
});