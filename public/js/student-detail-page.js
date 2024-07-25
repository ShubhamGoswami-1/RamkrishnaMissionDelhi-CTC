document.addEventListener('DOMContentLoaded', function () {
    const mainContent = document.querySelector('.main-content');
    const transactionModal = document.getElementById('transactionModal');
    const closeModalButton = transactionModal.querySelector('.close');
    const makeTransactionButton = document.getElementById('makeTransactionButton');
    const submitTransactionButton = document.getElementById('submitTransactionButton');
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('studentId') || mainContent.getAttribute('data-student-id');
    let currentlySelectedBatchId = null;

    if (studentId) {
        fetchBatches(studentId);
    }

    makeTransactionButton.addEventListener('click', function () {
        transactionModal.style.display = 'block';
    });

    closeModalButton.addEventListener('click', function () {
        transactionModal.style.display = 'none';
    });

    // Function to hide the modal
    function hideModal() {
        transactionModal.style.display = 'none';
    }

    // Add event listener for the 'Esc' key
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            hideModal();
        }
    });

    window.addEventListener('click', function (event) {
        if (event.target === transactionModal) {
            transactionModal.style.display = 'none';
        }
    });

    document.querySelector('#batchCourseTable').addEventListener('click', function (event) {
        const row = event.target.closest('tr');
        if (row) {
            const batchId = row.getAttribute('data-batch-id');

            if (currentlySelectedBatchId === batchId) {
                // If the same batch is clicked again
                document.querySelector('.transactions').style.display = 'none';
                row.style.width = 'auto'; // Reset width of batch table row
                currentlySelectedBatchId = null; // Clear selection
            } else {
                // If a different batch is clicked
                fetchTransactions(studentId, batchId);

                // Set hidden fields in the modal
                document.getElementById('modalStudentId').value = studentId;
                document.getElementById('modalBatchId').value = batchId;

                // Show transactions and expand table
                document.querySelector('.transactions').style.display = 'block';
                row.style.width = '100%'; // Set width of batch table row to full width
                currentlySelectedBatchId = batchId; // Set currently selected batch ID
            }
        }
    });


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

    function fetchBatches(studentId) {
        fetch(`/api/v1/batch/get-all-batches-Of-Student/${studentId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    let batches = data.batches;
                    batches = batches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    const tableBody = document.querySelector('#batchCourseTable tbody');
                    tableBody.innerHTML = ''; // Clear existing rows

                    batches.forEach(batch => {
                        const formattedDate = new Date(batch.createdAt).toLocaleDateString('en-IN');
                        const row = document.createElement('tr');
                        row.setAttribute('data-batch-id', batch._id);
                        row.innerHTML = `
                            <td>${batch.courseName}</td>
                            <td>${batch.title}</td>
                            <td>${batch.facultyName}</td>
                            <td>${batch.timing}</td>
                            <td>${formattedDate}</td>
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

    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        return emailPattern.test(email);
    }

    function validateAadhaar(aadhaarNo) {
        return aadhaarNo.length === 12;
    }

    function validatePhone(phone) {
        return phone.length === 10;
    }

    function validateFields() {
        let isValid = true;

        // Check if required fields are empty
        if (document.getElementById('name').value.trim() === '') {
            isValid = false;
            document.getElementById('nameError').style.display = 'block';
        } else {
            document.getElementById('nameError').style.display = 'none';
        }

        if (document.getElementById('fathersName').value.trim() === '') {
            isValid = false;
            document.getElementById('fathersNameError').style.display = 'block';
        } else {
            document.getElementById('fathersNameError').style.display = 'none';
        }

        if (document.getElementById('address').value.trim() === '') {
            isValid = false;
            document.getElementById('addressError').style.display = 'block';
        } else {
            document.getElementById('addressError').style.display = 'none';
        }

        // Check email, Aadhaar, and phone validations
        const email = document.getElementById('email').value;
        if (!validateEmail(email)) {
            isValid = false;
            document.getElementById('emailError').style.display = 'block';
        } else {
            document.getElementById('emailError').style.display = 'none';
        }

        const aadhaarNo = document.getElementById('aadhaarNo').value;
        if (!validateAadhaar(aadhaarNo)) {
            isValid = false;
            document.getElementById('aadhaarError').style.display = 'block';
        } else {
            document.getElementById('aadhaarError').style.display = 'none';
        }

        const phone = document.getElementById('phone').value;
        if (!validatePhone(phone)) {
            isValid = false;
            document.getElementById('phoneError').style.display = 'block';
        } else {
            document.getElementById('phoneError').style.display = 'none';
        }

        return isValid;
    }

    function fetchStudentFeesDue(studentId) {
        return fetch(`/api/v1/student/get-student/${studentId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    return data.student.batchIds.find(batch => batch.batchId === currentlySelectedBatchId).feesDue;
                } else {
                    console.error('Error fetching student details:', data.error);
                    return null;
                }
            })
            .catch(error => {
                console.error('Error fetching student details:', error);
                return null;
            });
    }

    // Submit transaction button event listener
    submitTransactionButton.addEventListener('click', async function () {
        const studentId = document.getElementById('modalStudentId').value;
        const batchId = document.getElementById('modalBatchId').value;
        const newPayment = parseFloat(document.getElementById('newPayment').value);

        if (isNaN(newPayment) || newPayment <= 0) {
            alert('Please enter a valid payment amount.');
            return;
        }

        const feesDue = await fetchStudentFeesDue(studentId);
        if (feesDue === null) {
            alert('Error fetching fees due. Please try again later.');
            return;
        }

        if (newPayment > feesDue) {
            alert('Payment amount exceeds the fees due.');
            return;
        }

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
                        fetchBatches(studentId); // Refresh the batches list
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

    function savePersonalDetails(studentId) {
        if (validateFields()) {
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
                        window.location.href = '/students';
                    } else {
                        console.error('Error updating details:', data.error);
                    }
                })
                .catch(error => console.error('Error updating details:', error));
        } else {
            alert('Please correct the errors in the form.');
        }
    }

    const saveButton = document.getElementById('saveDetailsButton');
    saveButton.addEventListener('click', function () {
        savePersonalDetails(studentId);
    });

    if (studentId) {
        viewStudentDetails(studentId);
    }
});