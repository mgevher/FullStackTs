import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' })); // Enable CORS for React frontend

// Initialize SQLite database
const initDb = async () => {
    const db = await open({
        filename: './database.db',
        driver: sqlite3.Database,
    });
    return db;
};

// GET /tasks - Fetch all tasks
app.get('/tasks', async (req, res) => {
    try {
        const db = await initDb();
        const tasks = await db.all('SELECT * FROM tasks');
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});

// GET /tasks/:id - Fetch a task by ID
app.get('/tasks/:id', async (req, res) => {
    try {
        const db = await initDb();
        const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
        if (task) {
            res.json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ message: 'Failed to fetch task' });
    }
});

// POST /tasks - Add a new task
app.post('/tasks', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            res.status(400).json({ message: 'Title is required' });
        }

        const db = await initDb();
        const result = await db.run('INSERT INTO tasks (title) VALUES (?)', [title]);
        const newTask = { id: result.lastID, title };
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Failed to create task' });
    }
});

// PUT /tasks/:id - Update a task by ID
app.put('/tasks/:id', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            res.status(400).json({ message: 'Title is required' });
        }

        const db = await initDb();
        const result = await db.run('UPDATE tasks SET title = ? WHERE id = ?', [title, req.params.id]);

        if (result?.changes ?? 0 > 0) {
            res.json({ id: req.params.id, title });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Failed to update task' });
    }
});

// DELETE /tasks/:id - Delete a task by ID
app.delete('/tasks/:id', async (req, res) => {
    try {
        const db = await initDb();
        const result = await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);

        if (result?.changes ?? 0 > 0) {
            res.json({ message: 'Task deleted successfully' });
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Failed to delete task' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
