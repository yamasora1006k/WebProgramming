// task.js

export class TaskManager {
    constructor(tasks, ui, storage) {
        this.tasks = tasks || [];
        this.ui = ui;
        this.storage = storage;
        this.editingTaskId = null;

        this.ui.onToggleComplete((taskId) => this.toggleTaskCompletion(taskId));
        this.ui.onEditTask((taskId) => this.openTaskModal(taskId));
        this.ui.onDeleteTask((taskId) => this.deleteTask(taskId));
    }

    createTask(taskData) {
        const task = {
            id: this.generateId(),
            title: taskData.title,
            description: taskData.description || '',
            category: taskData.category,
            priority: taskData.priority,
            dueDate: taskData.dueDate || '',
            estimatedTime: parseInt(taskData.estimatedTime) || 0,
            completed: false,
            createdAt: new Date().toISOString(),
            studyTime: 0
        };

        this.tasks.push(task);
        this.storage.saveTasks(this.tasks);
        this.ui.renderTasks(this.getFilteredTasks(this.ui.getFilters()));
    }

    updateTask(taskId, taskData) {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...taskData };
            this.storage.saveTasks(this.tasks);
            this.ui.renderTasks(this.getFilteredTasks(this.ui.getFilters()));
        }
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.storage.saveTasks(this.tasks);
        this.ui.renderTasks(this.getFilteredTasks(this.ui.getFilters()));
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;

            if (task.completed) {
                const futureDates = [1, 3, 7, 30].map(d => new Date(Date.now() + d * 86400000).toISOString());
                task.reviewDates = futureDates;
            }

            this.storage.saveTasks(this.tasks);
            this.ui.renderTasks(this.getFilteredTasks(this.ui.getFilters()));
        }
    }

    getFilteredTasks({ search, category, priority, status }) {
        return this.tasks.filter(task => {
            const matchSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(search.toLowerCase()));

            const matchCategory = !category || task.category === category;
            const matchPriority = !priority || task.priority === priority;
            const matchStatus = !status ||
                (status === 'completed' && task.completed) ||
                (status === 'pending' && !task.completed);

            return matchSearch && matchCategory && matchPriority && matchStatus;
        }).sort((a, b) => {
            const priorityMap = { high: 3, medium: 2, low: 1 };
            return (a.completed - b.completed) || (priorityMap[b.priority] - priorityMap[a.priority]);
        });
    }

    getAllTasks() {
        return this.tasks;
    }

    openTaskModal(taskId = null) {
        const task = taskId ? this.tasks.find(t => t.id === taskId) : null;
        this.editingTaskId = taskId;
        this.ui.showTaskModal(task, taskId);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }

    addStudyTime(taskId, minutes) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.studyTime += minutes;
            this.storage.saveTasks(this.tasks);
        }
    }
}
