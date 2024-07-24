document.addEventListener('DOMContentLoaded', function() {
    
    const mainContent = document.querySelector('.main-content');
    const facultyId = mainContent.getAttribute('data-faculty-id');

    function formatCurrency(amount) {
        return amount.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Function to fetch and display faculty details
    function viewFacultyDetails(facultyId) {
        fetch(`/api/v1/faculty/getFaculty/${facultyId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    const faculty = data.faculty;
                    document.getElementById('name').value = faculty.name;
                    document.getElementById('email').value = faculty.email;
                    document.getElementById('aadhaarNo').value = faculty.aadhaarNo;
                    document.getElementById('address').value = faculty.address;
                    document.getElementById('phone').value = faculty.phone;

                    // Fetch and display batches
                    fetchBatches(faculty.batchIds);
                } else {
                    console.error('Error fetching faculty details:', data.error);
                }
            })
            .catch(error => console.error('Error fetching faculty details:', error));
    }


    function saveFacultyDetails(facultyId) {
        const updatedDetails = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            aadhaarNo: document.getElementById('aadhaarNo').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
        };

        fetch(`/api/v1/faculty/edit-faculty/${facultyId}`, {
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
                // Redirect to /faculty route
                window.location.href = '/faculty';
            } else {
                console.error('Error updating details:', data.error);
            }
        })
        .catch(error => console.error('Error updating details:', error));
    }

    function populateBatchTable(batches) {
        const batchTableBody = document.querySelector('#batchCourseTable tbody');
        batchTableBody.innerHTML = '';

        batches.forEach(batch => {
            
            const row = document.createElement('tr');
            const formattedDate = new Date(batch.startingDate).toLocaleDateString('en-IN');
            const batchFees = formatCurrency(batch.fees);
            const totalFeesAmount = batch.fees * batch.studentIds.length;
            const batchFeesWithGST = formatCurrency(batch.fees + (batch.fees * (batch.GST / 100)));
            const totalFeesWithGSTAmount = totalFeesAmount + (batch.studentIds.length * (batch.fees * (batch.GST / 100)));
            const totalFees = formatCurrency(totalFeesAmount);
            const totalFeesWithGST = `${formatCurrency(totalFeesWithGSTAmount)} (${batch.GST}%)`;
            const totalFeesPaid = formatCurrency(batch.totalFeesPaid);
            const totalFeesDue = formatCurrency(((batch.fees + (batch.fees * (batch.GST / 100))) * batch.studentIds.length) - batch.totalFeesPaid);

            row.innerHTML = `
                <td>${batch.courseName}</td>
                <td>${batch.title}</td>
                <td>${batch.timing}</td>
                <td>${formattedDate}</td>
                <td>${batch.studentIds.length}</td>
                <td>${batchFees}</td>
                <td>${batchFeesWithGST}</td>
                <td>${totalFees}</td> 
                <td>${totalFeesWithGST}</td> 
                <td>${totalFeesPaid}</td>
                <td>${totalFeesDue}</td>
                <td>${batch.active}</td>
            `;
            batchTableBody.appendChild(row);
        });
    }

    function fetchBatches(batchIds) {
        fetch('/api/v1/batch/getBatchDetails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ batchIds })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                populateBatchTable(data.data.batchDetails);
            } else {
                console.error('Error fetching batch details:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching batch details:', error);
        });
    }
    

    const saveButton = document.getElementById('saveDetailsButton');
    saveButton.addEventListener('click', function() {
        saveFacultyDetails(facultyId);
    });

    // Call the function to fetch and display faculty details
    if (facultyId) {
        viewFacultyDetails(facultyId);
    }
});