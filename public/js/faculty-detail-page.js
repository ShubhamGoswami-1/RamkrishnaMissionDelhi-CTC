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

                    fetchBatches(faculty.batchIds);
                } else {
                    console.error('Error fetching faculty details:', data.error);
                }
            })
            .catch(error => console.error('Error fetching faculty details:', error));
    }

    function saveFacultyDetails(facultyId) {
        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        let isValid = true;

        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const phoneNo = document.getElementById('phone');
        const aadhaarNo = document.getElementById('aadhaarNo');
        const address = document.getElementById('address');

        // Name validation
        if (name.value.trim() === '') {
            document.getElementById('nameError').textContent = 'Name cannot be empty.';
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email.value.trim())) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address.';
            isValid = false;
        }

        // Phone Number validation
        const phoneNoValue = phoneNo.value.trim();
        const phoneNoRegex = /^\d{10}$/;
        if (phoneNoValue === '') {
            document.getElementById('phoneError').textContent = 'Phone number cannot be empty.';
            isValid = false;
        } else if (!phoneNoRegex.test(phoneNoValue)) {
            document.getElementById('phoneError').textContent = 'Phone number must be exactly 10 digits.';
            isValid = false;
        }

        // Aadhaar Number validation
        const aadhaarNoValue = aadhaarNo.value.trim();
        const aadhaarNoRegex = /^\d{12}$/;
        if (aadhaarNoValue === '') {
            document.getElementById('aadhaarNoError').textContent = 'Aadhaar number cannot be empty.';
            isValid = false;
        } else if (!aadhaarNoRegex.test(aadhaarNoValue)) {
            document.getElementById('aadhaarNoError').textContent = 'Aadhaar number must be exactly 12 digits.';
            isValid = false;
        }

        // Address validation
        if (address.value.trim() === '') {
            document.getElementById('addressError').textContent = 'Address cannot be empty.';
            isValid = false;
        }

        if (isValid) {
            const updatedDetails = {
                name: name.value,
                email: email.value,
                aadhaarNo: aadhaarNo.value,
                phone: phoneNo.value,
                address: address.value,
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
                    window.location.href = '/faculty';
                } else {
                    console.error('Error updating details:', data.error);
                }
            })
            .catch(error => console.error('Error updating details:', error));
        }
    }

    function populateBatchTable(batches) {
        const batchTableBody = document.querySelector('#batchCourseTable tbody');
        batchTableBody.innerHTML = '';

        batches.forEach(batch => {
            const row = document.createElement('tr');
            const formattedDate = new Date(batch.startingDate).toLocaleDateString('en-IN');
            const batchFees = formatCurrency(batch.fees);
            const totalFeesPaid = formatCurrency(batch.totalFeesPaid);
            const totalFeesDue = formatCurrency(batch.expectedTotalFeesWithGST - batch.totalFeesPaid);

            row.innerHTML = `
                <td>${batch.courseName}</td>
                <td>${batch.title}</td>
                <td>${batch.timing}</td>
                <td>${formattedDate}</td>
                <td>${batch.studentIds.length}</td>
                <td>${batchFees}</td>
                <td>${batch.expectedTotalFeesWithGST}</td>
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

    if (facultyId) {
        viewFacultyDetails(facultyId);
    }
});