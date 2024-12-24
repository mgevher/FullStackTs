import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Task {
    id: number;
    title: string;
}

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTask, setNewTask] = useState<string>('');
    const [editTask, setEditTask] = useState<{ id: number; title: string } | null>(null);

    const API_URL = 'http://localhost:5000/tasks';

    // Fetch tasks from the server
    const fetchTasks = async () => {
        try {
            const response = await axios.get<Task[]>(API_URL);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // Add a new task
    const handleAddTask = async () => {
        if (!newTask.trim()) return;
        try {
            const response = await axios.post<Task>(API_URL, { title: newTask });
            setTasks([...tasks, response.data]);
            setNewTask('');
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    // Edit an existing task
    const handleEditTask = async () => {
        if (!editTask?.title.trim()) return;
        try {
            const response = await axios.put<Task>(`${API_URL}/${editTask.id}`, { title: editTask.title });
            setTasks(tasks.map(task => (task.id === response.data.id ? response.data : task)));
            setEditTask(null);
        } catch (error) {
            console.error('Error editing task:', error);
        }
    };

    // Delete a task
    const handleDeleteTask = async (id: number) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setTasks(tasks.filter(task => task.id !== id));
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>Task Manager</h1>
            <div>
                <input
                    type="text"
                    placeholder="Add a new task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                />
                <button onClick={handleAddTask}>Add Task</button>
            </div>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id} style={{ margin: '10px 0' }}>
                        {editTask?.id === task.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editTask.title}
                                    onChange={(e) =>
                                        setEditTask({ ...editTask, title: e.target.value })
                                    }
                                />
                                <button onClick={handleEditTask}>Save</button>
                                <button onClick={() => setEditTask(null)}>Cancel</button>
                            </>
                        ) : (
                            <>
                                {task.title}
                                <button
                                    style={{ marginLeft: '10px' }}
                                    onClick={() => setEditTask({ id: task.id, title: task.title })}
                                >
                                    Edit
                                </button>
                                <button
                                    style={{ marginLeft: '5px' }}
                                    onClick={() => handleDeleteTask(task.id)}
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;
