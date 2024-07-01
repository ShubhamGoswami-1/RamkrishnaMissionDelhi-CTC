document.addEventListener('DOMContentLoaded', function() {
    const addStudentButton = document.getElementById('addStudentButton');
    const studentFormModal = document.getElementById('studentFormModal');
    const closeButtons = document.querySelectorAll('.close');
    const studentsTable = document.getElementById('studentsTable');
    const searchInput = document.getElementById('searchInput');
    const searchCategory = document.getElementById('searchCategory');
    const filterIcon = document.getElementById('filterIcon');
    const searchDropdown = document.getElementById('searchDropdown');

    // Function to filter students based on search category
    function filterStudents() {
        let filter = searchInput.value.toLowerCase();
        let category = searchCategory.value;
        let rows = studentsTable.querySelectorAll('tbody tr');

        rows.forEach(row => {
            let cell = row.querySelector(`td:nth-child(${category === 'name' ? 1 : category === 'fathersName' ? 2 : category === 'aadhaarNo' ? 3 : 4})`);
            if (cell.innerText.toLowerCase().includes(filter)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Function to open the add student form modal
    function openForm() {
        studentFormModal.style.display = "block";
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
        window.location.href = `/student-details/${studentId}`;
    }

    // Bind event handlers
    addStudentButton.addEventListener('click', openForm);
    closeButtons.forEach(button => {
        button.addEventListener('click', closeForm);
    });

    // Handle dynamic table row clicks
    studentsTable.querySelectorAll('tbody tr').forEach(row => {
        row.addEventListener('click', function() {
            viewStudentDetails(row.dataset.studentId);
        });
    });

    filterIcon.addEventListener('click', function(event) {
        searchDropdown.classList.toggle('active');
    });

    searchCategory.addEventListener('change', function() {
        searchInput.dispatchEvent(new Event('input')); // Trigger the search when the category changes
    });

    
    // Handle search functionality
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

});
