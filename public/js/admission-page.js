document.addEventListener('DOMContentLoaded', () => {
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
            alert('Admission process completed!');
            // Add your logic to handle the final submission
        });
    }

    showStep(currentStep);
    initStepNavigation();

    // Handle search dropdown toggle
    function initSearchDropdown(dropdownId, inputId) {
        const filterIcon = document.getElementById(dropdownId);
        const searchDropdown = document.getElementById(inputId);

        filterIcon.addEventListener('click', () => {
            searchDropdown.classList.toggle('active');
        });
    }

    initSearchDropdown('filterStudentIcon', 'searchStudentDropdown');
    initSearchDropdown('filterBatchIcon', 'searchBatchDropdown');

    // Fetch and populate student, course, and batch tables
    function fetchStudents() {
        fetch('/api/v1/student/get-all-students')
            .then(response => response.json())
            .then(data => {
                const studentsTableBody = document.querySelector('#studentsTable tbody');
                studentsTableBody.innerHTML = data.students.map(student => `
                    <tr>
                        <td><input type="checkbox" name="selectedStudent" value="${student.id}" onclick="handleSingleSelect(this, 'selectedStudent')"></td>
                        <td>${student.name}</td>
                        <td>${student.fathersName}</td>
                        <td>${student.aadhaarNo}</td>
                        <td>${student.phone}</td>
                        <td>${student.address}</td>
                    </tr>
                `).join('');
            });
    }

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
                        <td>${batch.name}</td>
                        <td>${batch.facultyName}</td>
                        <td>${batch.timing}</td>
                        <td>${batch.startDate}</td>
                    </tr>
                `).join('');
            });
    }

    fetchStudents();
    fetchCourses();

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
});

// Ensure only one checkbox can be selected at a time for a given name
function handleSingleSelect(checkbox, name) {
    const checkboxes = document.getElementsByName(name);
    checkboxes.forEach(cb => {
        if (cb !== checkbox) cb.checked = false;
    });
}
