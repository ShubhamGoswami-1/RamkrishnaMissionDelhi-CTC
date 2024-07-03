document.addEventListener('DOMContentLoaded', () => {
    const studentsTable = document.getElementById('studentsTable');

    const steps = document.querySelectorAll('.step');
    const stepSymbols = document.querySelectorAll('.step-symbol');
    let currentStep = 0;
    let selectedCourseId = null;

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.style.display = index === stepIndex ? 'block' : 'none';
            stepSymbols[index].style.backgroundColor = index === stepIndex ? '#004de6' : '#e65c00';
        });
    }

    function initStepNavigation() {
        document.getElementById('toStep2').addEventListener('click', () => {
            currentStep = 1;
            showStep(currentStep);
        });

        document.getElementById('backToStep1').addEventListener('click', () => {
            currentStep = 0;
            showStep(currentStep);
        });

        document.getElementById('toStep3').addEventListener('click', () => {
            const selectedCourse = document.querySelector('input[name="selectedCourse"]:checked');
            if (selectedCourse) {
                selectedCourseId = selectedCourse.value;
                fetchBatches(selectedCourseId);
                currentStep = 2;
                showStep(currentStep);
            } else {
                alert('Please select a course');
            }
        });

        document.getElementById('backToStep2').addEventListener('click', () => {
            currentStep = 1;
            showStep(currentStep);
        });

        document.getElementById('completeAdmission').addEventListener('click', () => {

            fetch('/api/v1/admission/add-new-admission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    // Include any necessary data for the admission process here
                    studentId: selectedStudentId,
                    courseId: selectedCourseId,
                    batchId: selectedBatchId
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Admission process completed!');
                    window.location.href = '/all-admission'; // Redirect to the all-admissions page
                } else {
                    alert('Error completing the admission process: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error completing the admission process');
            });
            // alert('Admission process completed!');
        });
    }

    showStep(currentStep);
    initStepNavigation();

    // Handle search dropdown toggle
    function initSearchDropdown(dropdownId, searchCategoryId) {
        const filterIcon = document.getElementById(dropdownId);
        const searchDropdown = document.getElementById(searchCategoryId);

        filterIcon.addEventListener('click', () => {
            searchDropdown.classList.toggle('active');
        });
    }

    initSearchDropdown('filterStudentIcon', 'searchStudentDropdown');
    initSearchDropdown('filterBatchIcon', 'searchBatchDropdown');

    function populateStudentsTable(students) {
        const tbody = studentsTable.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows

        students.forEach(student => {
            const row = document.createElement('tr');
            row.dataset.studentId = student._id; // Assuming _id is your student's unique identifier

            // Example: Populate table cells with student data
            row.innerHTML = `
                <td><input type="checkbox" name="selectedStudent" value="${student._id}" onclick="handleSingleSelect(this, 'selectedStudent')"></td>
                <td>${student.name}</td>
                <td>${student.fathersName}</td>
                <td>${student.aadhaarNo}</td>
                <td>${student.phone}</td>
                <td>${student.address}</td>
            `;

            tbody.appendChild(row);
        });
    }

    // Fetch and populate student table
    function fetchStudents() {
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
    }

    // Fetch and populate course table
    function fetchCourses() {
        fetch('/api/v1/course/get-all-courses')
            .then(response => response.json())
            .then(data => {
                const coursesTableBody = document.querySelector('#coursesTable tbody');
                coursesTableBody.innerHTML = data.courses.map(course => `
                    <tr>
                        <td><input type="checkbox" name="selectedCourse" value="${course._id}" onclick="handleSingleSelect(this, 'selectedCourse')"></td>
                        <td>${course.name}</td>
                    </tr>
                `).join('');
            });
    }

    function fetchBatches(courseId) {
        fetch(`/api/v1/batch/get-all-batches?courseId=${courseId}`)
            .then(response => response.json())
            .then(data => {
                const batchesTableBody = document.querySelector('#batchesTable tbody');
                console.log("Batches", data.batches);
                batchesTableBody.innerHTML = data.batches.map(batch => `
                    <tr>
                        <td><input type="checkbox" name="selectedBatch" value="${batch._id}" onclick="handleSingleSelect(this, 'selectedBatch')"></td>
                        <td>${batch.title}</td>
                        <td>${batch.facultyName}</td>
                        <td>${batch.timing}</td>
                        <td>${batch.startDate}</td>
                    </tr>
                `).join('');
            });
    }

    fetchStudents();
    fetchCourses();

    // Ensure only one checkbox can be selected at a time for a given name
    function handleSingleSelect(checkbox, name) {
        const checkboxes = document.getElementsByName(name);
        checkboxes.forEach(cb => {
            if (cb !== checkbox) cb.checked = false;
        });
    }

    // Function to fetch and filter students based on the search input and category
    function filterStudents() {
        const filter = document.getElementById('searchStudentInput').value.toLowerCase();
        const category = document.getElementById('searchStudentCategory').value;

        fetch(`/api/v1/student/search?searchText=${filter}&category=${category}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const studentsTableBody = document.querySelector('#studentsTable tbody');
                    studentsTableBody.innerHTML = data.students.map(student => `
                        <tr>
                            <td><input type="checkbox" name="selectedStudent" value="${student._id}" onclick="handleSingleSelect(this, 'selectedStudent')"></td>
                            <td>${student.name}</td>
                            <td>${student.fathersName}</td>
                            <td>${student.aadhaarNo}</td>
                            <td>${student.phone}</td>
                            <td>${student.address}</td>
                        </tr>
                    `).join('');
                } else {
                    console.error('Error fetching students:', data.error);
                }
            })
            .catch(error => console.error('Error fetching students:', error));
    }

    // Event listener for the search input in the student section
    document.getElementById('searchStudentInput').addEventListener('input', filterStudents);

    // Function to fetch and filter batches based on the search input and category
    function filterBatches() {
        const filter = document.getElementById('searchBatchInput').value.toLowerCase();
        const category = document.getElementById('searchBatchCategory').value;

        fetch(`/api/v1/batch/search?searchText=${filter}&category=${category}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const batchesTableBody = document.querySelector('#batchesTable tbody');
                    batchesTableBody.innerHTML = data.batches.map(batch => `
                        <tr>
                            <td><input type="checkbox" name="selectedBatch" value="${batch._id}" onclick="handleSingleSelect(this, 'selectedBatch')"></td>
                            <td>${batch.title}</td>
                            <td>${batch.facultyName}</td>
                            <td>${batch.timing}</td>
                            <td>${batch.startDate}</td>
                        </tr>
                    `).join('');
                } else {
                    console.error('Error fetching batches:', data.error);
                }
            })
            .catch(error => console.error('Error fetching batches:', error));
    }

    // Event listener for the search input in the batch section
    document.getElementById('searchBatchInput').addEventListener('input', filterBatches);

    // Function to fetch and filter courses based on the search input (course name)
    function filterCourses() {
        const filter = document.getElementById('searchCourseInput').value.toLowerCase();

        fetch(`/api/v1/course/search?searchText=${filter}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const coursesTableBody = document.querySelector('#coursesTable tbody');
                    coursesTableBody.innerHTML = data.courses.map(course => `
                        <tr>
                            <td><input type="checkbox" name="selectedCourse" value="${course._id}" onclick="handleSingleSelect(this, 'selectedCourse')"></td>
                            <td>${course.name}</td>
                        </tr>
                    `).join('');
                } else {
                    console.error('Error fetching courses:', data.error);
                }
            })
            .catch(error => console.error('Error fetching courses:', error));
    }

    // Event listener for the search input in the course section
    document.getElementById('searchCourseInput').addEventListener('input', filterCourses);
});
