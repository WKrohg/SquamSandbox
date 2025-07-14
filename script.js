document.getElementById('task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const taskInput = document.getElementById('task-input');
    const categorySelect = document.getElementById('task-category');
    const category = categorySelect.value;
    const taskText = taskInput.value.trim();
    if (taskText === '') return;

    const list = document.querySelector(`#${category} ul`);
    const item = document.createElement('li');
    item.textContent = taskText;
    list.appendChild(item);

    taskInput.value = '';
    categorySelect.selectedIndex = 0;
});
