document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const taskDateTime = document.getElementById('taskDateTime');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const totalTasksSpan = document.getElementById('totalTasks');
    const completedTasksSpan = document.getElementById('completedTasks');
    
    // Tasks array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Initialize the app
    function init() {
        renderTasks();
        updateStats();
        
        // Set min datetime to current time
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - timezoneOffset)).toISOString().slice(0, 16);
        taskDateTime.min = localISOTime;
    }
    
    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        const taskTime = taskDateTime.value;
        
        if (taskText) {
            const newTask = {
                id: Date.now(),
                text: taskText,
                completed: false,
                datetime: taskTime,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            updateStats();
            
            // Clear inputs
            taskInput.value = '';
            taskDateTime.value = '';
        }
    }
    
    // Render tasks based on filter
    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (filter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="empty-state">No tasks found</li>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            taskItem.dataset.id = task.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            
            const taskText = document.createElement('span');
            taskText.className = `task-text ${task.completed ? 'completed' : ''}`;
            taskText.textContent = task.text;
            
            const taskDateTime = document.createElement('span');
            taskDateTime.className = 'task-datetime';
            if (task.datetime) {
                const date = new Date(task.datetime);
                taskDateTime.textContent = formatDateTime(date);
            }
            
            const taskActions = document.createElement('div');
            taskActions.className = 'task-actions';
            
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit task';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.title = 'Delete task';
            
            taskActions.appendChild(editBtn);
            taskActions.appendChild(deleteBtn);
            
            taskItem.appendChild(checkbox);
            taskItem.appendChild(taskText);
            taskItem.appendChild(taskDateTime);
            taskItem.appendChild(taskActions);
            
            taskList.appendChild(taskItem);
            
            // Add event listeners
            checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
            editBtn.addEventListener('click', () => editTask(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
        });
    }
    
    // Toggle task completion status
    function toggleTaskComplete(taskId) {
        tasks = tasks.map(task => {
            if (task.id === parseInt(taskId)) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
        updateStats();
    }
    
    // Edit a task
    function editTask(taskId) {
        const task = tasks.find(task => task.id === parseInt(taskId));
        if (!task) return;
        
        const newText = prompt('Edit your task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            
            const newDateTime = prompt('Edit date/time (YYYY-MM-DDTHH:MM):', task.datetime || '');
            if (newDateTime !== null) {
                task.datetime = newDateTime;
            }
            
            saveTasks();
            renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
        }
    }
    
    // Delete a task
    function deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== parseInt(taskId));
            saveTasks();
            renderTasks(document.querySelector('.filter-btn.active').dataset.filter);
            updateStats();
        }
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Update task statistics
    function updateStats() {
        totalTasksSpan.textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;
        const completedCount = tasks.filter(task => task.completed).length;
        completedTasksSpan.textContent = `${completedCount} completed`;
    }
    
    // Format date and time
    function formatDateTime(date) {
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    }
    
    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderTasks(this.dataset.filter);
        });
    });
    
    // Initialize the app
    init();
});