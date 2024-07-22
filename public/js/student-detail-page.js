document.addEventListener('DOMContentLoaded', function () {
    const mainContent = document.querySelector('.main-content');
    const studentId = mainContent.getAttribute('data-student-id');
    if (studentId) {
        fetchBatches(studentId);
    }

    document.querySelector('#batchCourseTable').addEventListener('click', function (event) {
        const row = event.target.closest('tr');
        if (row) {
            const batchId = row.getAttribute('data-batch-id');
            fetchTransactions(studentId, batchId);
        }
    });

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
                    fetchBatches(student._id);
                } else {
                    console.error('Error fetching student details:', data.error);
                }
            })
            .catch(error => console.error('Error fetching student details:', error));
    }

    // Function to fetch and display batches
    function fetchBatches(studentId) {
        fetch(`/api/v1/batch/get-all-batches-Of-Student/${studentId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const batches = data.batches;
                    const tableBody = document.querySelector('#batchCourseTable tbody');
                    tableBody.innerHTML = ''; // Clear existing rows

                    // Loop through each batch and create a table row
                    batches.forEach(batch => {
                        const row = document.createElement('tr');
                        row.setAttribute('data-batch-id', batch._id);
                        row.innerHTML = `
                            <td>${batch.title}</td>
                            <td>${batch.courseName}</td>
                            <td>${batch.facultyName}</td>
                            <td>${batch.timing}</td>
                            <td>${batch.startingDate}</td>
                        `;
                        tableBody.appendChild(row);
                    });
                } else {
                    console.error('Error fetching batch details:', data.error);
                }
            })
            .catch(error => console.error('Error fetching batch details:', error));
    }

    function fetchTransactions(studentId, batchId) {
        fetch(`/api/v1/payment/getAllTransactions/studentId/${studentId}/batchId/${batchId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const transactions = data.transactions;
                    const tableBody = document.querySelector('#transactionTable tbody');
                    tableBody.innerHTML = ''; // Clear existing rows

                    // Loop through each transaction and create a table row
                    transactions.forEach(transaction => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${transaction._id}</td>
                            <td>${transaction.newPayment}</td>
                            <td>${transaction.feesPaid}</td>
                            <td>${transaction.dueAmt}</td>
                            <td>${transaction.createdAt}</td>
                        `;
                        tableBody.appendChild(row);
                    });
                } else {
                    console.error('Error fetching transaction details:', data.error);
                }
            })
            .catch(error => console.error('Error fetching transaction details:', error));
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

        fetch(`/api/v1/student/edit-student/${studentId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedDetails),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Details updated successfully');
                    // Redirect to /students route
                    window.location.href = '/students';
                } else {
                    console.error('Error updating details:', data.error);
                }
            })
            .catch(error => console.error('Error updating details:', error));
    }

    const saveButton = document.getElementById('saveDetailsButton');
    saveButton.addEventListener('click', function () {
        savePersonalDetails(studentId);
    });

    // Call the function to fetch and display student details
    if (studentId) {
        viewStudentDetails(studentId);
    }
});