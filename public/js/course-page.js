document.addEventListener("DOMContentLoaded", function () {
    fetchCourses();

    const modal = document.getElementById('courseFormModal');
    const addCourseButton = document.getElementById('addCourseButton');
    const closeModalButton = document.getElementsByClassName('close')[0];
    const courseForm = document.getElementById('courseForm');

    addCourseButton.onclick = function () {
        modal.style.display = 'block';
    }

    closeModalButton.onclick = function () {
        modal.style.display = 'none';
    }

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }

    courseForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(courseForm);
        const data = {
            name: formData.get('name'),
            fees: formData.get('fees'),
        };

        fetch('/api/v1/course/add-new-course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                localStorage.setItem('courseAdded', 'true');
                window.location.href = '/course';
            } else {
                alert('Error adding course: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error adding course.');
        });
    });

    // Check if course was added and show popup message
    if (localStorage.getItem('courseAdded') === 'true') {
        localStorage.removeItem('courseAdded');
        showPopupMessage('Course Added');
    }
});

function showPopupMessage(message) {
    const popup = document.createElement('div');
    popup.className = 'popup-message';
    popup.textContent = message;
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => document.body.removeChild(popup), 500);
    }, 3000);
}

async function fetchCourses() {
    const courseContainer = document.getElementById('courseContainer');
    const colors = ['#73b1c1', '#113f67', '#fbf2d5', '#fdc57b', '#f8b400'];

    try {
        const response = await fetch('/api/v1/course/get-all-courses');
        const data = await response.json();

        if (data.status === 'success') {
            data.courses.forEach((course, index) => {
                const colorIndex = index % colors.length;
                const courseCard = document.createElement('div');
                courseCard.classList.add('course-card');
                courseCard.style.backgroundColor = colors[colorIndex]; // Apply background color
                courseCard.innerHTML = `
                    <h2>${course.name}</h2>
                `;
                courseCard.addEventListener('click', function () {
                    window.location.href = `/batch?courseId=${course._id}&courseName=${encodeURIComponent(course.name)}`;
                });
                courseContainer.appendChild(courseCard);
            });
        } else {
            console.error('Error fetching courses:', data.error);
        }
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}