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
                    // fetchBatches(faculty.batchIds);
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
            phone: document.getElementById('phone').value,
            department: document.getElementById('department').value,
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

    const saveButton = document.getElementById('saveDetailsButton');
    saveButton.addEventListener('click', function() {
        saveFacultyDetails(facultyId);
    });


    // Call the function to fetch and display faculty details
    if (facultyId) {
        viewFacultyDetails(facultyId);
    }
});