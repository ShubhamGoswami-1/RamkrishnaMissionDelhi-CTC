document.addEventListener('DOMContentLoaded', function() {

    // Function to fetch and display student details
    function viewStudentDetails(studentId) {
        fetch(`/api/v1/student/get-student/${studentId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const student = data.student;
                    document.getElementById('name').value = student.name;
                    document.getElementById('fathersName').value = student.fathersName;
                    document.getElementById('email').value = student.email;
                    document.getElementById('aadhaarNo').value = student.aadhaarNo;
                    document.getElementById('phone').value = student.phone;
                    document.getElementById('address').value = student.address;

                    // Fetch and display batches
                    fetchBatches(student.batchIds);
                } else {
                    console.error('Error fetching student details:', data.error);
                }
            })
            .catch(error => console.error('Error fetching student details:', error));
    }

    // Function to fetch and display batches
    function fetchBatches(batchIds) {
        batchIds.forEach(batchId => {
            fetch(`/api/v1/batch/get-batch/${batchId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        const batch = data.batch;
                        const tableBody = document.querySelector('#batchCourseTable tbody');
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${batch._id}</td>
                            <td>${batch.title}</td>
                        `;
                        tableBody.appendChild(row);
                    } else {
                        console.error('Error fetching batch details:', data.error);
                    }
                })
                .catch(error => console.error('Error fetching batch details:', error));
        });
    }

    // Function to save edited personal details
    function savePersonalDetails(studentId) {
        const updatedDetails = {
            name: document.getElementById('name').value,
            fathersName: document.getElementById('fathersName').value,
            email: document.getElementById('email').value,
            aadhaarNo: document.getElementById('aadhaarNo').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
        };

        fetch(`/api/v1/student/update-student/${studentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedDetails),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Details updated successfully');
            } else {
                console.error('Error updating details:', data.error);
            }
        })
        .catch(error => console.error('Error updating details:', error));
    }

    // Get the student ID from the data attribute in the main-content div
    const mainContent = document.querySelector('.main-content');
    const studentId = mainContent.getAttribute('data-student-id');

    // Call the function to fetch and display student details
    if (studentId) {
        viewStudentDetails(studentId);
    }

    // Add event listener to save details button
    document.getElementById('saveDetailsButton').addEventListener('click', function() {
        savePersonalDetails(studentId);
    });
});
