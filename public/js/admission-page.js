document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.step');
    const stepSymbols = document.querySelectorAll('.step-symbol');
    const searchStudentInput = document.getElementById('searchStudentInput');
    const searchStudentCategory = document.getElementById('searchStudentCategory');
    const filterStudentIcon = document.getElementById('filterStudentIcon');
    const searchStudentDropdown = document.getElementById('searchStudentDropdown');
    let currentStep = 0;
    let selectedCourseId = null;
    let selectedStudentId = null;
    let selectedBatchId = null;

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.style.display = index === stepIndex ? 'block' : 'none';
            stepSymbols[index].style.backgroundColor = index === stepIndex ? '#004de6' : '#e65c00';
        });
    }

    function initStepNavigation() {
        document.getElementById('toStep2').addEventListener('click', () => {
            if (!selectedStudentId) {
                alert('Please select a student');
                return;
            }
            currentStep = 1;
            showStep(currentStep);
        });

        document.getElementById('backToStep1').addEventListener('click', () => {
            currentStep = 0;
            showStep(currentStep);
        });

        document.getElementById('toStep3').addEventListener('click', () => {
            const formNo = document.getElementById('formNo').value;
            const courseDropdown = document.getElementById('courseSelect');
            selectedCourseId = courseDropdown.value;

            if (formNo && selectedCourseId) {
                fetchBatches(selectedCourseId);
                currentStep = 2;
                showStep(currentStep);
            } else {
                alert('Please fill out the form and select a course');
            }
        });

        document.getElementById('backToStep2').addEventListener('click', () => {
            currentStep = 1;
            showStep(currentStep);
        });

        document.getElementById('completeAdmission').addEventListener('click', () => {
            const selectedStudent = document.querySelector('input[name="selectedStudent"]:checked');
            const selectedBatch = document.querySelector('input[name="selectedBatch"]:checked');
            const formNo = document.getElementById('formNo').value;
            const discount = document.getElementById('discount').value;

            if (selectedStudent && selectedBatch && selectedCourseId && formNo && discount) {
                const studentId = selectedStudent.value;
                const batchId = selectedBatch.value;

                fetch('/api/v1/admission/add-new-admission', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        studentId: studentId,
                        courseId: selectedCourseId,
                        batchId: batchId,
                        formNo: formNo, // Include formNo in the request
                        discount: discount
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert('Admission process completed!');
                        window.location.href = '/all-admissions';
                    } else {
                        alert('Error completing the admission process: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error completing the admission process');
                });
            } else {
                alert('Please select a student, course, and batch to complete the admission process');
            }
        });
    }

    showStep(currentStep);
    initStepNavigation();

    function handleRowClick(event, checkbox, type) {
        if (event.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            handleSingleSelect(checkbox, type);
        }
    }

    function populateStudentsTable(students) {
        const tbody = document.getElementById('studentsTableBody');
        tbody.innerHTML = ''; // Clear existing rows

        students.forEach(student => {
            const row = document.createElement('tr');
            row.dataset.studentId = student._id; // Assuming _id is your student's unique identifier

            row.innerHTML = `
                <td><input type="radio" name="selectedStudent" value="${student._id}"></td>
                <td>${student.name}</td>
                <td>${student.fathersName}</td>
                <td>${student.aadhaarNo}</td>
                <td>${student.phone}</td>
                <td>${student.address}</td>
            `;

            row.addEventListener('click', (event) => handleRowClick(event, row.querySelector('input[name="selectedStudent"]'), 'student'));

            tbody.appendChild(row);
        });
    }

    function handleSingleSelect(checkbox, type) {
        if (checkbox.checked) {
            if (type === 'student') {
                selectedStudentId = checkbox.value;
            } else if (type === 'batch') {
                selectedBatchId = checkbox.value;
            }
        } else {
            if (type === 'student') {
                selectedStudentId = null;
            } else if (type === 'batch') {
                selectedBatchId = null;
            }
        }
    }

    function fetchBatches(courseId) {
        fetch(`/api/v1/batch/get-batches-by-course/${courseId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    populateBatchesTable(data.data.batchDetails);
                } else {
                    alert('Error fetching batches: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error fetching batches');
            });
    }

    function populateBatchesTable(batches) {
        const tbody = document.getElementById('batchesTableBody');
        tbody.innerHTML = ''; // Clear existing rows

        batches.forEach(batch => {
            const row = document.createElement('tr');
            row.dataset.batchId = batch._id; // Assuming _id is your batch's unique identifier

            row.innerHTML = `
                <td><input type="radio" name="selectedBatch" value="${batch._id}"></td>
                <td>${batch.title}</td>
                <td>${batch.facultyName}</td>
                <td>${batch.timing}</td>
                <td>${batch.startingDate}</td>
            `;

            row.addEventListener('click', (event) => handleRowClick(event, row.querySelector('input[name="selectedBatch"]'), 'batch'));

            tbody.appendChild(row);
        });
    }

    // Fetch courses and populate the dropdown
    fetch('/api/v1/course/get-all-courses')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const courses = data.courses;
                const courseDropdown = document.getElementById('courseSelect');

                // Clear any existing options
                courseDropdown.innerHTML = '';

                // Create and append option elements for each course
                courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course._id;
                    option.textContent = course.name;
                    courseDropdown.appendChild(option);
                });
            } else {
                alert('Error fetching courses: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching courses');
        });

    // Initial fetch of students to populate the table
    fetch('/api/v1/student/get-all-students')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                populateStudentsTable(data.students);
            } else {
                alert('Error fetching students: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching students');
        });

        searchStudentInput.addEventListener('input', function() {
            let filter = this.value.toLowerCase();
            let category = searchStudentCategory.value;
    
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
    
        // Toggle the search category dropdown
        filterStudentIcon.addEventListener('click', function(event) {
            searchStudentDropdown.classList.toggle('active');
        });
    
        searchStudentCategory.addEventListener('change', function() {
            searchStudentInput.dispatchEvent(new Event('input')); // Trigger the search when the category changes
        });
});