document.addEventListener("DOMContentLoaded", function() {
    fetchCourses();
});

async function fetchCourses() {
    

        /* 
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
        */
        const courseContainer = document.getElementById('courseContainer');
        fetch('/api/v1/course/get-all-courses')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    data.courses.forEach(course => {
                        const courseCard = document.createElement('div');
                        courseCard.classList.add('course-card');
                        courseCard.innerHTML = `
                            <h3>${course.name}</h3>
                            <h1>${'KESHAV'}</h1>
                        `;
                        courseContainer.appendChild(courseCard);
                    });                } else {
                    console.error('Error searching faculties:', data.error);
                }
            })
            .catch(error => console.error('Error searching courses:', error));}

const modal = document.getElementById('courseFormModal');
const addCourseButton = document.getElementById('addCourseButton');
const span = document.getElementsByClassName('close')[0];

addCourseButton.onclick = function() {
    modal.style.display = 'block';
}

span.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}