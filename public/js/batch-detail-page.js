document.addEventListener('DOMContentLoaded', function () {
    const mainContent = document.querySelector('.main-content');
    const transactionModal = document.getElementById('transactionModal');
    const closeModalButton = transactionModal.querySelector('.close');
    const makeTransactionButton = document.getElementById('makeTransactionButton');
    const submitTransactionButton = document.getElementById('submitTransactionButton');
    const urlParams = new URLSearchParams(window.location.search);
    const batchId = urlParams.get('batchId') || mainContent.getAttribute('data-batch-id');
    let currentlySelectedStudentId = null;

    if (batchId) {
        fetchStudents(batchId);
    }

    makeTransactionButton.addEventListener('click', function () {
        transactionModal.style.display = 'block';
    });

    closeModalButton.addEventListener('click', function () {
        transactionModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === transactionModal) {
            transactionModal.style.display = 'none';
        }
    });

    document.querySelector('#batchCourseTable').addEventListener('click', function (event) {
        const row = event.target.closest('tr');
        if (row) {
            const studentId = row.getAttribute('data-student-id');

            if (currentlySelectedStudentId === studentId) {
                console.log(" If the same student is clicked again")
                // If the same student is clicked again
                document.querySelector('.transactions').style.display = 'none';
                row.style.width = 'auto'; // Reset width of batch table row
                currentlySelectedStudentId = null; // Clear selection
            } else {
                // If a different batch is clicked
                fetchTransactions(studentId, batchId);

                // Set hidden fields in the modal
                document.getElementById('modalStudentId').value = studentId;
                document.getElementById('modalBatchId').value = batchId;

                // Show transactions and expand table
                document.querySelector('.transactions').style.display = 'block';
                row.style.width = '100%'; // Set width of batch table row to full width
                currentlySelectedStudentId = studentId; // Set currently selected batch ID
            }
        }
    });

    submitTransactionButton.addEventListener('click', function () {
        const studentId = document.getElementById('modalStudentId').value;
        const batchId = document.getElementById('modalBatchId').value;
        const newPayment = document.getElementById('newPayment').value;

        if (newPayment) {
            fetch(`/api/v1/payment/newPayment/studentId/${studentId}/batchId/${batchId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPayment }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert('Transaction successfully created!');
                        transactionModal.style.display = 'none';
                        fetchStudents(batchId); // Refresh the batches list
                        fetchTransactions(studentId, batchId); // Refresh the transactions list
                    } else {
                        console.error('Error creating transaction:', data.error);
                    }
                })
                .catch(error => console.error('Error creating transaction:', error));
        } else {
            alert('Please enter a payment amount.');
        }
    });

    function fetchStudents(batchId) {
        console.log("BatchId: ", batchId);
        fetch(`/api/v1/batch/get-all-students-Of-Batch/${batchId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    let students = data.data.students;
                    // students = students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    const tableBody = document.querySelector('#batchCourseTable tbody');
                    tableBody.innerHTML = ''; // Clear existing rows

                    students.forEach(student => {
                        // const formattedDate = new Date(student.createdAt).toLocaleDateString('en-IN');
                        const row = document.createElement('tr');
                        row.setAttribute('data-student-id', student._id);
                        row.innerHTML = `
                            <td>${student.name}</td>
                            <td>${student.phone}</td>
                            <td>${student.aadhaarNo}</td>
                            <td>${student.address}</td>
                            <td>${student.address}</td>
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
                    let transactions = data.transactions;

                    transactions = transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    console.log('Fetched transactions:', transactions); // Debugging line
                    const tableBody = document.querySelector('#transactionTable tbody');
                    tableBody.innerHTML = ''; // Clear existing rows

                    transactions.forEach(transaction => {
                        const formattedDate = new Date(transaction.createdAt).toLocaleDateString('en-IN');
                        const truncatedTransactionId = transaction._id.length > 7 ? '....' + transaction._id.slice(-7) : transaction._id;
                        const newPayment = `₹${parseFloat(transaction.newPayment).toFixed(2)}`;
                        const feesPaid = `₹${parseFloat(transaction.feesPaid).toFixed(2)}`;
                        const dueAmt = `₹${parseFloat(transaction.dueAmt).toFixed(2)}`;

                        const row = document.createElement('tr');
                        row.innerHTML = `
                        <td>${formattedDate}</td>
                        <td>${newPayment}</td>
                        <td>${feesPaid}</td>
                        <td>${dueAmt}</td>
                        <td>${truncatedTransactionId}</td>
                    `;
                        tableBody.appendChild(row);
                    });

                    document.querySelector('.transactions').style.display = 'block';
                } else {
                    console.error('Error fetching transaction details:', data.error);
                }
            })
            .catch(error => console.error('Error fetching transaction details:', error));
    }
});