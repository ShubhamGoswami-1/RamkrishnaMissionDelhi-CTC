document.addEventListener('DOMContentLoaded', function () {
    const addFacultyButton = document.getElementById('addFacultyButton');
    const facultyFormModal = document.getElementById('facultyFormModal');
    const closeButtons = document.querySelectorAll('.close');
    const facultyTable = document.getElementById('facultyTable');
    const searchInput = document.getElementById('searchInput');
    const searchCategory = document.getElementById('searchCategory');
    const filterIcon = document.getElementById('filterIcon');
    const searchDropdown = document.getElementById('searchDropdown');
    const facultyForm = document.getElementById('facultyForm');

    // Function to populate table rows with faculty data
    function populateFacultyTable(faculties) {
        const tbody = facultyTable.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows

        faculties.forEach(faculty => {
            const row = document.createElement('tr');
            row.dataset.facultyId = faculty._id;

            row.innerHTML = `
                <td>${faculty.name}</td>
                <td>${faculty.email}</td>
                <td>${faculty.phone}</td>
                <td>${faculty.aadhaarNo}</td>
                <td>${faculty.address}</td>
            `;

            row.addEventListener('click', function () {
                viewFacultyDetails(faculty._id);
            });

            tbody.appendChild(row);
        });
    }

    // Fetch all faculties when page loads
    fetch('/api/v1/faculty/get-all-faculties')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                populateFacultyTable(data.faculties);
            } else {
                console.error('Error fetching faculties:', data.error);
            }
        })
        .catch(error => console.error('Error fetching faculties:', error));

    function viewFacultyDetails(facultyId) {
        window.location.href = `/faculty/details/${facultyId}`;
    }

    // Show the form modal when 'Add Faculty' button is clicked
    addFacultyButton.onclick = function () {
        facultyFormModal.style.display = "flex";
    };

    // Close the modal when the 'x' button is clicked
    closeButtons.forEach(button => {
        button.onclick = function () {
            facultyFormModal.style.display = "none";
        }

        // Function to hide the modal
        function hideModal() {
            facultyFormModal.style.display = 'none';
        }

        // Add event listener for the 'Esc' key
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                hideModal();
            }
        });
    });

    // Close the modal when clicking outside the form content
    window.onclick = function (event) {
        if (event.target == facultyFormModal) {
            facultyFormModal.style.display = "none";
        }
    };

    // Toggle the search category dropdown
    filterIcon.addEventListener('click', function () {
        searchDropdown.classList.toggle('active');
    });

    searchCategory.addEventListener('change', function () {
        searchInput.dispatchEvent(new Event('input')); // Trigger the search when the category changes
    });

    // Handle search functionality
    searchInput.addEventListener('input', function () {
        let filter = this.value.toLowerCase();
        let category = searchCategory.value;

        if (filter.length > 0) {
            fetch(`/api/v1/faculty/search?searchText=${filter}&category=${category}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        populateFacultyTable(data.faculties);
                    } else {
                        console.error('Error searching faculties:', data.error);
                    }
                })
                .catch(error => console.error('Error searching faculties:', error));
        } else {
            // If the search input is cleared, fetch all faculties again
            fetch('/api/v1/faculty/get-all-faculties')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        populateFacultyTable(data.faculties);
                    } else {
                        console.error('Error fetching faculties:', data.error);
                    }
                })
                .catch(error => console.error('Error fetching faculties:', error));
        }
    });

    function downloadExcelFile() {
        window.location.href = '/api/v1/faculty/download-faculty';
    }

    // Add event listener to download button
    const downloadButton = document.getElementById('downloadExcelButton');
    downloadButton.addEventListener('click', downloadExcelFile);

    // Validation logic for the faculty form
    facultyForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent form from submitting initially

        // Clear previous error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        let isValid = true;

        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const phoneNo = document.getElementById('phoneNo');
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
        if (phoneNoValue !== '' && !phoneNoRegex.test(phoneNoValue)) {
            document.getElementById('phoneNoError').textContent = 'Phone number must be exactly 10 digits.';
            isValid = false;
        }
        if (phoneNoValue === '') {
            document.getElementById('phoneNoError').textContent = 'Phone number cannot be empty.';
            isValid = false;
        }

        // Aadhaar Number validation
        const aadhaarNoValue = aadhaarNo.value.trim();
        const aadhaarNoRegex = /^\d{12}$/;
        if (aadhaarNoValue !== '' && !aadhaarNoRegex.test(aadhaarNoValue)) {
            document.getElementById('aadhaarNoError').textContent = 'Aadhaar number must be exactly 12 digits.';
            isValid = false;
        }
        if (aadhaarNoValue === '') {
            document.getElementById('aadhaarNoError').textContent = 'Aadhaar number cannot be empty.';
            isValid = false;
        }

        // Address validation
        if (address.value.trim() === '') {
            document.getElementById('addressError').textContent = 'Address cannot be empty.';
            isValid = false;
        }

        if (isValid) {
            // Prepare form data for submission
            const formData = {
                name: name.value.trim(),
                email: email.value.trim(),
                phone: phoneNo.value.trim(),
                aadhaarNo: aadhaarNo.value.trim(),
                address: address.value.trim()
            };

            // Submit form data via fetch
            fetch('/api/v1/faculty/add-new-faculty', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        // Close modal and refresh page to show updated list
                        facultyFormModal.style.display = "none";
                        location.reload(); // Refresh the page to see the new faculty in the table
                    } else {
                        // Handle errors (e.g., validation errors)
                        if (data.message) {
                            alert(data.message);
                        }
                    }
                })
                .catch(error => console.error('Error adding faculty:', error));
        }
    });

    // Restrict input to digits only for phone number and Aadhaar number fields
    document.getElementById('phoneNo').addEventListener('input', function (event) {
        this.value = this.value.replace(/\D/g, ''); // Allow only digits
    });

    document.getElementById('aadhaarNo').addEventListener('input', function (event) {
        this.value = this.value.replace(/\D/g, ''); // Allow only digits
    });
});