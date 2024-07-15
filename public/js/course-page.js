document.addEventListener("DOMContentLoaded", function () {
    fetchCourses();
});

async function fetchCourses() {
    const courseContainer = document.getElementById('courseContainer');
    fetch('/api/v1/course/get-all-courses')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                data.courses.forEach((course, index) => {
                    const courseCard = document.createElement('div');
                    const colorClass = getColorClass(index);
                    courseCard.classList.add('course-card', colorClass);
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
        })
        .catch(error => console.error('Error fetching courses:', error));
}

function getColorClass(index) {
    const colors = ['first-color', 'second-color', 'third-color', 'fourth-color'];
    return colors[index % colors.length];
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
