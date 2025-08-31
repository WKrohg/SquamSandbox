const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { projects: [], tasks: [] };
  }
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db = loadData();

// Projects endpoints
app.get('/api/projects', (req, res) => {
  res.json(db.projects);
});

app.post('/api/projects', (req, res) => {
  const { name } = req.body;
  const project = { id: uuidv4(), name };
  db.projects.push(project);
  saveData(db);
  res.json(project);
});

// Tasks endpoints
app.get('/api/tasks', (req, res) => {
  const { projectId } = req.query;
  let tasks = db.tasks;
  if (projectId) {
    tasks = tasks.filter(t => t.projectId === projectId);
  }
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { projectId, title, start, end } = req.body;
  const task = { id: uuidv4(), projectId, title, start, end };
  db.tasks.push(task);
  saveData(db);
  res.json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { start, end } = req.body;
  const task = db.tasks.find(t => t.id === id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  if (start !== undefined) task.start = start;
  if (end !== undefined) task.end = end;
  saveData(db);
  res.json(task);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
