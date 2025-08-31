let currentProjectId = null;
const hourHeight = 40;

async function fetchProjects() {
  const res = await fetch('/api/projects');
  const projects = await res.json();
  const select = document.getElementById('project-select');
  select.innerHTML = '';
  projects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    select.appendChild(opt);
  });
  if (projects.length > 0) {
    if (!currentProjectId) currentProjectId = projects[0].id;
    select.value = currentProjectId;
    loadTasks();
  }
}

document.getElementById('create-project').onclick = async () => {
  const name = document.getElementById('project-name').value;
  if (!name) return;
  await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  document.getElementById('project-name').value = '';
  fetchProjects();
};

document.getElementById('project-select').onchange = (e) => {
  currentProjectId = e.target.value;
  loadTasks();
};

document.getElementById('create-task').onclick = async () => {
  const title = document.getElementById('task-title').value;
  const start = parseInt(document.getElementById('task-start').value, 10);
  const end = parseInt(document.getElementById('task-end').value, 10);
  if (!title || isNaN(start) || isNaN(end) || !currentProjectId) return;
  await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId: currentProjectId, title, start, end })
  });
  document.getElementById('task-title').value = '';
  loadTasks();
};

async function loadTasks() {
  const res = await fetch('/api/tasks?projectId=' + currentProjectId);
  const tasks = await res.json();
  const timeline = document.getElementById('timeline');
  timeline.innerHTML = '';
  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'task';
    div.draggable = true;
    div.textContent = task.title;
    div.style.top = (task.start * hourHeight) + 'px';
    div.style.height = ((task.end - task.start) * hourHeight - 2) + 'px';
    div.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text', task.id);
    });
    timeline.appendChild(div);
  });
}

const timeline = document.getElementById('timeline');
timeline.addEventListener('dragover', e => e.preventDefault());
timeline.addEventListener('drop', async e => {
  e.preventDefault();
  const id = e.dataTransfer.getData('text');
  const rect = timeline.getBoundingClientRect();
  const y = e.clientY - rect.top;
  let start = Math.round(y / hourHeight);
  if (start < 0) start = 0;
  if (start > 23) start = 23;
  const res = await fetch('/api/tasks?projectId=' + currentProjectId);
  const tasks = await res.json();
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const duration = task.end - task.start;
  let end = start + duration;
  if (end > 24) { end = 24; start = end - duration; }
  await fetch('/api/tasks/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ start, end })
  });
  loadTasks();
});

fetchProjects();
