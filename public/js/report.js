document.addEventListener('DOMContentLoaded', function () {
    const generateReportButton = document.getElementById('addFacultyButton');
    const downloadReportButton = document.getElementById('downloadExcelButton');
    const reportModal = document.getElementById('facultyFormModal');
    const closeButton = document.querySelector('.close');
    const reportForm = document.getElementById('facultyForm');

    // Hide the modal by default
    reportModal.style.display = 'none';

    // Show the "Generate Report" modal when button is clicked
    generateReportButton.onclick = function () {
        reportModal.style.display = 'flex';
    };

    // Close modal logic when close button is clicked
    closeButton.onclick = function () {
        reportModal.style.display = 'none';
    };

    // Close modal if user clicks outside the modal content
    window.onclick = function (event) {
        if (event.target === reportModal) {
            reportModal.style.display = 'none';
        }
    };

    // Handle form submission
    reportForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const filters = {
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            batchId: document.getElementById('batchId').value,
            paymentType: document.getElementById('paymentType').value,
        };

        // Logic to fetch filtered transactions
        console.log('Filters:', filters);

        // Close the modal
        reportModal.style.display = 'none';
    });

    // Function to populate table rows with faculty data
    function populateFacultyTable(transactions) {
        const tbody = facultyTable.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows

        transactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.dataset.transactionId = transaction._id;

            row.innerHTML = `
                <td>${transaction.studentId?.name}</td>
                <td>${transaction.studentId?.email || 'N/A'}</td>
                <td>${transaction.studentId?.aadhaarNo || 'N/A'}</td>
                <td>${transaction.studentId?.phone || 'N/A'}</td>
                <td>${transaction.batchId?.courseName || 'N/A'}</td>
                <td>${transaction.batchId?.title }</td>
                <td>${transaction.newPayment}</td>
                <td>${transaction.dueAmt}</td>
                <td>${new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>${transaction.paymentType}</td>
                <td>${transaction.receiptNo}</td>
                <td><button class="view-receipt-btn" data-receipt="${transaction.receiptBase64}">
                        View Receipt
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Attach event listeners to buttons dynamically
        document.querySelectorAll('.view-receipt-btn').forEach(button => {
            button.addEventListener('click', function () {
                const receiptBase64 = this.getAttribute('data-receipt');
                viewReceipt(receiptBase64);
            });
        });
    }

    // Fetch all transactions when page loads
    fetch('/api/v1/payment/getAllTransactions')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                populateFacultyTable(data.transactions);
            } else {
                console.error('Error fetching transactions:', data.error);
            }
        })
        .catch(error => console.error('Error fetching transactions:', error));

    // Handle receipt viewing
    function viewReceipt(receiptBase64, studentName, receiptNo) {
        if (!receiptBase64) {
            alert('No receipt available for this transaction.');
            return;
        }

        try {
            const byteCharacters = atob(receiptBase64);
            const byteArray = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
            }

            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);
            const receiptFilename = `${studentName}-${receiptNo}.pdf`;

            const newTab = window.open(blobUrl, '_blank');
            if (!newTab) {
                alert('Pop-up blocked! Please allow pop-ups for this site.');
            }

            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } catch (error) {
            console.error('Error displaying receipt:', error);
        }
    }

    // Handle "Download Report" button
    downloadReportButton.onclick = function () {
        console.log('Download report clicked');
        // Logic for downloading the report here
    };
});
