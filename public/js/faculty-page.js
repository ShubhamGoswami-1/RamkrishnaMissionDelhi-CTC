document.addEventListener('DOMContentLoaded', function() {
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
            row.dataset.facultyId = faculty._id; // Assuming _id is your faculty's unique identifier

            // Example: Populate table cells with faculty data
            row.innerHTML = `
                <td>${faculty.name}</td>
                <td>${faculty.email}</td>
                <td>${faculty.phone}</td>
                <td>${faculty.aadhaarNo}</td>
                <td>${faculty.address}</td>
            `;

            row.addEventListener('click', function(){
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
                populateFacultyTable(data.faculties); // Populate table with fetched faculties
            } else {
                console.error('Error fetching faculties:', data.error);
            }
        })
        .catch(error => console.error('Error fetching faculties:', error));

    function viewFacultyDetails(facultyId){
        window.location.href = `/faculty/details/${facultyId}`;
    }
        
    // Show the form modal when 'Add Faculty' button is clicked
    addFacultyButton.onclick = function() {
        facultyFormModal.style.display = "flex";
    };

    // Close the modal when the 'x' button is clicked
    closeButtons.forEach(button => {
        button.onclick = function() {
            facultyFormModal.style.display = "none";
        }
    });

    // Close the modal when clicking outside the form content
    window.onclick = function(event) {
        if (event.target == facultyFormModal) {
            facultyFormModal.style.display = "none";
        }
    };

    // Filter faculty on input change
    // searchInput.addEventListener('input', filterFaculty);

    // Toggle the search category dropdown
    filterIcon.addEventListener('click', function(event) {
        searchDropdown.classList.toggle('active');
    });

    searchCategory.addEventListener('change', function() {
        searchInput.dispatchEvent(new Event('input')); // Trigger the search when the category changes
    });

    // Handle search functionality
    searchInput.addEventListener('input', function() {
        let filter = this.value.toLowerCase();
        let category = searchCategory.value;

        if (filter.length > 0) {
            fetch(`/api/v1/faculty/search?searchText=${filter}&category=${category}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        populateFacultyTable(data.faculties); // Populate table with search results
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
                        populateFacultyTable(data.faculties); // Populate table with all faculties
                    } else {
                        console.error('Error fetching faculties:', data.error);
                    }
                })
                .catch(error => console.error('Error fetching faculties:', error));
        }
    });

});
