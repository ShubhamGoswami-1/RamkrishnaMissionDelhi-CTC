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
    let courseName;
    let courseId;
    function fetchBatchDetails(batchId) {
        fetch(`/api/v1/batch/getBatch/${batchId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                courseId = data.batch.courseId;
                courseName = data.batch.courseName;
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
                    document.getElementById('timing').value = batch.timing;
                    document.getElementById('fees').value = batch.fees;
                    document.getElementById('gst').value = batch.GST;
                    // document.getElementById('phone').value = batch.phone;
                    document.getElementById('active').value = batch.active;

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
    
        const title = document.getElementById('name');
        const fees = document.getElementById('fees');
        const timing = document.getElementById('timing');
        const gst = document.getElementById('gst');
        const active = document.getElementById('active');
    
        // Title validation
        if (title.value.trim() === '') {
            document.getElementById('nameError').textContent = 'Title cannot be empty.';
            document.getElementById('nameError').style.display = 'block';
            isValid = false;
        }
    
        // Fees validation
        if (fees.value.trim() === '') {
            document.getElementById('feesError').textContent = 'Fees cannot be empty.';
            document.getElementById('feesError').style.display = 'block';
            isValid = false;
        } else if (isNaN(fees.value) || parseFloat(fees.value) <= 0) {
            document.getElementById('feesError').textContent = 'Fees must be a positive number.';
            document.getElementById('feesError').style.display = 'block';
            isValid = false;
        }
    
        // Timing validation
        if (timing.value.trim() === '') {
            document.getElementById('timingError').textContent = 'Timing cannot be empty.';
            document.getElementById('timingError').style.display = 'block';
            isValid = false;
        }
    
        // GST validation
        if (gst.value.trim() === '') {
            document.getElementById('gstError').textContent = 'GST cannot be empty.';
            document.getElementById('gstError').style.display = 'block';
            isValid = false;
        } else if (isNaN(gst.value) || parseFloat(gst.value) < 0) {
            document.getElementById('gstError').textContent = 'GST must be a non-negative number.';
            document.getElementById('gstError').style.display = 'block';
            isValid = false;
        }
    
        // If all validations pass, proceed with the API call
        if (isValid) {
            const updatedDetails = {
                title: title.value,
                fees: fees.value,
                timing: timing.value,
                gst: gst.value,
                active: active.value,
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
                    window.location.href = `/batch?courseId=${courseId}&courseName=${courseName}`;
                } else {
                    console.error('Error updating details:', data.error);
                }
            })
            .catch(error => console.error('Error updating details:', error));
        }
    }
    
    document.getElementById('saveDetailsButton').addEventListener('click', function() {
        const batchId = document.querySelector('.main-content').getAttribute('data-batch-id');
        saveBatchDetails(batchId);
    });
    

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


    // const saveButton = document.getElementById('saveDetailsButton');
    // saveButton.addEventListener('click', function() {
    //     saveBatchDetails(batchId);
    // });

    if(batchId){
        viewBatchDetails(batchId)
    }

});