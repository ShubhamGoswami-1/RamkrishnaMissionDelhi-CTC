document.addEventListener('DOMContentLoaded', function() {
    
    const mainContent = document.querySelector('.main-content');
    const facultyId = mainContent.getAttribute('data-faculty-id');

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
            row.innerHTML = `
                <td>${batch.courseName}</td>
                <td>${batch.title}</td>
                <td>${batch.timing}</td>
                <td>${batch.startingDate}</td>
                <td>${batch.studentIds.length}</td>
                <td>${batch.fees}</td>
                <td>${undefined}</td> 
                <td>${undefined}</td>
                <td>${undefined}</td>
                <td>${batch.active}</td>
            `;
            batchTableBody.appendChild(row);
        });
    }

    function fetchBatches(batchIds) {
        const batchPromises = batchIds.map(batchId =>
            fetch(`/api/v1/batch/getBatch/${batchId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        return data.batch;
                    } else {
                        console.error('Error fetching batch details:', data.error);
                        return null;
                    }
                })
                .catch(error => {
                    console.error('Error fetching batch details:', error);
                    return null;
                })
        );

        Promise.all(batchPromises).then(batches => {
            // Filter out any null values in case of errors
            const validBatches = batches.filter(batch => batch !== null);
            populateBatchTable(validBatches);
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