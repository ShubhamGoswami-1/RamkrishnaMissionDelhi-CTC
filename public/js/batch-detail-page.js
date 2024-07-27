document.addEventListener('DOMContentLoaded', function () {
    const transactionModal = document.getElementById('transactionModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeTransactionModalButton = transactionModal.querySelector('.close');
    const closeConfirmationModalButton = confirmationModal.querySelector('.close');
    const makeTransactionButton = document.getElementById('makeTransactionButton');
    const submitTransactionButton = document.getElementById('submitTransactionButton');
    const confirmPaymentButton = document.getElementById('confirmPaymentButton');
    const cancelPaymentButton = document.getElementById('cancelPaymentButton');
    const urlParams = new URLSearchParams(window.location.search);
    const batchId = urlParams.get('batchId') || document.querySelector('.main-content').getAttribute('data-batch-id');
    let currentlySelectedStudentId = null;

    if (batchId) {
        fetchStudents(batchId);
        fetchBatchDetails(batchId);
    }

    makeTransactionButton.addEventListener('click', function () {
        transactionModal.style.display = 'block';
    });

    closeTransactionModalButton.addEventListener('click', function () {
        transactionModal.style.display = 'none';
    });

    closeConfirmationModalButton.addEventListener('click', function () {
        confirmationModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === transactionModal) {
            transactionModal.style.display = 'none';
        } else if (event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
    });

    let batchTitle;
    function fetchBatchDetails(batchId) {
        fetch(`/api/v1/batch/getBatch/${batchId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Store data.title in batchTitle
                batchTitle = data.batch.title;
            })
            .catch(error => {
                console.error('Error fetching batch details:', error);
            });
    }    

    document.querySelector('#batchCourseTable').addEventListener('click', function (event) {
        const row = event.target.closest('tr');
        if (row) {
            const studentId = row.getAttribute('data-student-id');
            const studentName = row.querySelector('td:nth-child(1)').textContent; // Assuming name is in the first column

            if (currentlySelectedStudentId === studentId) {
                // If the same student is clicked again
                document.querySelector('.transactions').style.display = 'none';
                row.style.width = 'auto'; // Reset width of batch table row
                currentlySelectedStudentId = null; // Clear selection
            } else {
                // If a different student is clicked
                fetchTransactions(studentId, batchId);

                // Set hidden fields in the modal
                document.getElementById('modalStudentId').value = studentId;
                document.getElementById('modalBatchId').value = batchId;
                document.getElementById('studentName').value = studentName;

                // You may need to fetch and set the batch title if it's not included in the student data
                document.getElementById('batchTitle').value = batchTitle; // Replace with actual batch title fetch

                // Show transactions and expand table
                document.querySelector('.transactions').style.display = 'block';
                row.style.width = '100%'; // Set width of batch table row to full width
                currentlySelectedStudentId = studentId; // Set currently selected batch ID
            }
        }
    });

    submitTransactionButton.addEventListener('click', function () {
        confirmationModal.style.display = 'block';
    });

    confirmPaymentButton.addEventListener('click', function () {
        const studentId = document.getElementById('modalStudentId').value;
        const batchId = document.getElementById('modalBatchId').value;
        const newPayment = document.getElementById('newPayment').value;
        const paymentType = document.getElementById('paymentType').value;

        if (newPayment) {
            fetch(`/api/v1/payment/newPayment/studentId/${studentId}/batchId/${batchId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPayment, paymentType }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        alert('Transaction successfully created!');
                        transactionModal.style.display = 'none';
                        confirmationModal.style.display = 'none';
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

    cancelPaymentButton.addEventListener('click', function () {
        confirmationModal.style.display = 'none';
    });
    function fetchStudents(batchId) {
        fetch(`/api/v1/batch/get-all-students-Of-Batch/${batchId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    let students = data.data.students;
                    const tableBody = document.querySelector('#batchCourseTable tbody');
                    tableBody.innerHTML = ''; // Clear existing rows

                    students.forEach(student => {
                        const row = document.createElement('tr');
                        row.setAttribute('data-student-id', student._id);
                        const formattedAdmissionDate = new Date(student.DateOfAdmission).toLocaleDateString('en-IN');
                        row.innerHTML = `
                            <td>${student.name}</td>
                            <td>${student.phone}</td>
                            <td>${student.aadhaarNo}</td>
                            <td>${student.address}</td>
                            <td>${formattedAdmissionDate}</td>
                        `;
                        tableBody.appendChild(row);
                    });
                } else {
                    console.error('Error fetching batch details:', data.error);
                }
            })
            .catch(error => console.error('Error fetching batch details:', error));
    }

    function viewBatchDetails(batchId) {
        fetch(`/api/v1/batch/getBatch/${batchId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const batch = data.batch;
                    document.getElementById('name').value = batch.title;
                    document.getElementById('fathersName').value = batch.timing;
                    document.getElementById('email').value = batch.fees;
                    document.getElementById('aadhaarNo').value = batch.GST;
                    // document.getElementById('phone').value = batch.phone;
                    document.getElementById('address').value = batch.active;

                    // Fetch and display students
                    fetchStudents(batch._id);
                } else {
                    console.error('Error fetching student details:', data.error);
                }
            })
            .catch(error => console.error('Error fetching student details:', error));
    }

    function saveBatchDetails(batchId) {
        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        let isValid = true;

        const name = document.getElementById('name');
        const email = document.getElementById('fathersName');
        const phoneNo = document.getElementById('email');
        const aadhaarNo = document.getElementById('aadhaarNo');
        const address = document.getElementById('address');

        // Name validation
        // if (name.value.trim() === '') {
        //     document.getElementById('nameError').textContent = 'Name cannot be empty.';
        //     isValid = false;
        // }

        // // Email validation
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        // if (!emailRegex.test(email.value.trim())) {
        //     document.getElementById('emailError').textContent = 'Please enter a valid email address.';
        //     isValid = false;
        // }

        // // Phone Number validation
        // const phoneNoValue = phoneNo.value.trim();
        // const phoneNoRegex = /^\d{10}$/;
        // if (phoneNoValue === '') {
        //     document.getElementById('phoneError').textContent = 'Phone number cannot be empty.';
        //     isValid = false;
        // } else if (!phoneNoRegex.test(phoneNoValue)) {
        //     document.getElementById('phoneError').textContent = 'Phone number must be exactly 10 digits.';
        //     isValid = false;
        // }

        // // Aadhaar Number validation
        // const aadhaarNoValue = aadhaarNo.value.trim();
        // const aadhaarNoRegex = /^\d{12}$/;
        // if (aadhaarNoValue === '') {
        //     document.getElementById('aadhaarNoError').textContent = 'Aadhaar number cannot be empty.';
        //     isValid = false;
        // } else if (!aadhaarNoRegex.test(aadhaarNoValue)) {
        //     document.getElementById('aadhaarNoError').textContent = 'Aadhaar number must be exactly 12 digits.';
        //     isValid = false;
        // }

        // // Address validation
        // if (address.value.trim() === '') {
        //     document.getElementById('addressError').textContent = 'Address cannot be empty.';
        //     isValid = false;
        // }

        if (isValid) {
            const updatedDetails = {
                name: name.value,
                email: email.value,
                aadhaarNo: aadhaarNo.value,
                phone: phoneNo.value,
                address: address.value,
            };

            fetch(`/api/v1/batch/edit-batch/${batchId}`, {
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
                    window.location.href = '/batch';
                } else {
                    console.error('Error updating details:', data.error);
                }
            })
            .catch(error => console.error('Error updating details:', error));
        }
    }

    function fetchTransactions(studentId, batchId) {
        fetch(`/api/v1/payment/getAllTransactions/studentId/${studentId}/batchId/${batchId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    let transactions = data.transactions;

                    transactions = transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
                            <td>${transaction.paymentType}</td>
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


    const saveButton = document.getElementById('saveDetailsButton');
    saveButton.addEventListener('click', function() {
        saveBatchDetails(batchId);
    });

    if(batchId){
        viewBatchDetails(batchId)
    }

});