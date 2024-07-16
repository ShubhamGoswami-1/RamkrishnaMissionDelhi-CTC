document.addEventListener("DOMContentLoaded", function () {
    fetchCourses();
});

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
                courseCard.addEventListener('click', function() {
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


const modal = document.getElementById('courseFormModal');
const addCourseButton = document.getElementById('addCourseButton');
const span = document.getElementsByClassName('close')[0];

addCourseButton.onclick = function () {
    modal.style.display = 'block';
}

span.onclick = function () {
    modal.style.display = 'none';
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}