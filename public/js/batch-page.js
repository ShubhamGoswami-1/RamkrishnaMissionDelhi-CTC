document.addEventListener('DOMContentLoaded', function () {
    const mainContent = document.querySelector('.main-content');
    const courseId = mainContent.getAttribute('data-course-id');
    const addBatchButton = document.getElementById('addBatchButton');
    const batchFormModal = document.getElementById('batchFormModal');
    const closeButtons = document.querySelectorAll('.close');
    const batchTable = document.getElementById('batchTable');
    const searchInput = document.getElementById('searchInput');
    const searchCategory = document.getElementById('searchCategory');
    const filterIcon = document.getElementById('filterIcon');
    const searchDropdown = document.getElementById('searchDropdown');
    const batchForm = document.getElementById('batchForm');
    const facultySelect = document.getElementById('facultyId');
    const feesInput = document.getElementById('fees');
    const GSTInput = document.getElementById('GST'); // Add this line to select the GST input

    function formatCurrency(amount) {
        return amount.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Function to populate table rows with batch data
    function populateBatchTable(batches) {
        const tbody = batchTable.querySelector('tbody');
        tbody.innerHTML = ''; // Clear existing rows
        batches = batches.sort((a, b) => new Date(b.startingDate) - new Date(a.startingDate));

        batches.forEach(batch => {
            const row = document.createElement('tr');
            row.dataset.batchId = batch._id; // Assuming _id is your batch's unique identifier
            const formattedDate = new Date(batch.startingDate).toLocaleDateString('en-IN');
            const totalFeesAmount = batch.fees * batch.studentIds.length;
            const batchFees = formatCurrency(batch.fees);
            const batchFeesWithGST = formatCurrency(batch.fees + (batch.fees * (batch.GST / 100)));
            const totalFeesWithGSTAmount = totalFeesAmount + (batch.studentIds.length * (batch.fees * (batch.GST / 100)));
            const totalFees = formatCurrency(totalFeesAmount);
            const totalFeesWithGST = `${formatCurrency(totalFeesWithGSTAmount)} (${batch.GST}%)`;
            const totalFeesPaid = formatCurrency(batch.totalFeesPaid);
            const totalFeesDue = formatCurrency(((batch.fees + (batch.fees * (batch.GST / 100))) * batch.studentIds.length) - batch.totalFeesPaid);

            // Example: Populate table cells with batch data
            row.innerHTML = `
                <td>${batch.title}</td>
                <td>${batch.facultyName}</td>
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

            // Example: Populate table cells with batch data

            tbody.appendChild(row);
        });
    }

    // Function to populate the faculty dropdown
    function populateFacultyDropdown(faculties) {
        facultySelect.innerHTML = ''; // Clear existing options

        faculties.forEach(faculty => {
            const option = document.createElement('option');
            option.value = faculty._id;
            option.textContent = faculty.name;
            facultySelect.appendChild(option);
        });
    }

    // Fetch all batches when page loads
    fetch(`/api/v1/batch/get-batches-by-course/${courseId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                populateBatchTable(data.data.batchDetails); // Populate table with fetched batches
            } else {
                console.error('Error fetching batches:', data.error);
            }
        })
        .catch(error => console.error('Error fetching batches:', error));

    // Show the form modal when 'Add Batch' button is clicked
    addBatchButton.onclick = function () {
        batchFormModal.style.display = "flex";

        // Fetch course fees to set the default value in the fees input
        fetch(`/api/v1/course/get-course-fees/${courseId}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    feesInput.value = data.fees; // Set the fetched fees as the default value
                } else {
                    console.error('Error fetching course fees:', data.error);
                }
            })
            .catch(error => console.error('Error fetching course fees:', error));

        // Fetch all faculties to populate the dropdown
        fetch('/api/v1/faculty/get-all-faculties')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log("Faculties", data.faculties)
                    populateFacultyDropdown(data.faculties); // Populate dropdown with fetched faculties
                } else {
                    console.error('Error fetching faculties:', data.error);
                }
            })
            .catch(error => console.error('Error fetching faculties:', error));
    };

    // Close the modal when the 'x' button is clicked
    closeButtons.forEach(button => {
        button.onclick = function () {
            batchFormModal.style.display = "none";
        }
    });

    // Close the modal when clicking outside the form content
    window.onclick = function (event) {
        if (event.target == batchFormModal) {
            batchFormModal.style.display = "none";
        }
    };

    // Handle search functionality
    searchInput.addEventListener('input', function () {
        let filter = this.value.toLowerCase();
        let category = searchCategory.value;

        if (filter.length > 0) {
            fetch(`/api/v1/batch/search?searchText=${filter}&category=${category}&courseId=${courseId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        populateBatchTable(data.batches); // Populate table with search results
                    } else {
                        console.error('Error searching batches:', data.error);
                    }
                })
                .catch(error => console.error('Error searching batches:', error));
        } else {
            // If the search input is cleared, fetch all batches again
            fetch(`/api/v1/batch/get-batches-by-course/${courseId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        populateBatchTable(data.batches); // Populate table with all batches
                    } else {
                        console.error('Error fetching batches:', data.error);
                    }
                })
                .catch(error => console.error('Error fetching batches:', error));
        }
    });

    // Toggle the search category dropdown
    filterIcon.addEventListener('click', function (event) {
        searchDropdown.classList.toggle('active');
    });

    searchCategory.addEventListener('change', function () {
        searchInput.dispatchEvent(new Event('input')); // Trigger the search when the category changes
    });
});