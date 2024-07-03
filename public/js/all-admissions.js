document.addEventListener('DOMContentLoaded', function() {
    const admissionTable = document.getElementById('admissionTable');
    const searchInput = document.getElementById('searchInput');
    const searchCategory = document.getElementById('searchCategory');
    const filterIcon = document.getElementById('filterIcon');
    const searchDropdown = document.getElementById('searchDropdown');

    // Function to populate table rows with admission data
    function populateAdmissionTable(admissions) {
        const tbody = admissionTable.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows

        admissions.forEach(admission => {
            const row = document.createElement('tr');
            row.dataset.admissionId = admission._id; // Assuming _id is your admission's unique identifier

            row.innerHTML = `
                <td>${admission.studentName}</td>
                <td>${admission.courseName}</td>
                <td>${admission.batchTitle}</td>
                <td>${admission.DateOfAdmission}</td>
                <td>${admission.formNo}</td>
            `;

            tbody.appendChild(row);
        });
    }

    // Fetch all admissions when page loads
    fetch('/api/v1/admission/get-all-admissions')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                populateAdmissionTable(data.admissions); // Populate table with fetched admissions
            } else {
                console.error('Error fetching admissions:', data.error);
            }
        })
        .catch(error => console.error('Error fetching admissions:', error));

    // Handle search functionality
    searchInput.addEventListener('input', function() {
        let filter = this.value.toLowerCase();
        let category = searchCategory.value;

        if (filter.length > 0) {
            fetch(`/api/v1/admission/search?searchText=${filter}&category=${category}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        populateAdmissionTable(data.admissions); // Populate table with search results
                    } else {
                        console.error('Error searching admissions:', data.error);
                    }
                })
                .catch(error => console.error('Error searching admissions:', error));
        } else {
            // If the search input is cleared, fetch all admissions again
            fetch('/api/v1/admission/get-all-admissions')
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        populateAdmissionTable(data.admissions); // Populate table with all admissions
                    } else {
                        console.error('Error fetching admissions:', data.error);
                    }
                })
                .catch(error => console.error('Error fetching admissions:', error));
        }
    });

    // Toggle the search category dropdown
    filterIcon.addEventListener('click', function(event) {
        searchDropdown.classList.toggle('active');
    });

    searchCategory.addEventListener('change', function() {
        searchInput.dispatchEvent(new Event('input')); // Trigger the search when the category changes
    });
});
