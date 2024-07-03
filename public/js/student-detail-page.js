document.addEventListener('DOMContentLoaded', function() {

    // Function to fetch and log details of a single student
    function viewStudentDetails(studentId) {
        fetch(`/api/v1/student/get-student/${studentId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log(data.student); // Log the student details to the console
                } else {
                    console.error('Error fetching student details:', data.error);
                }
            })
            .catch(error => console.error('Error fetching student details:', error));
    }

    // Get the student ID from the data attribute in the main-content div
    const mainContent = document.querySelector('.main-content');
    const studentId = mainContent.getAttribute('data-student-id');

    // Call the function to fetch and log student details
    if (studentId) {
        viewStudentDetails(studentId);
    }
});