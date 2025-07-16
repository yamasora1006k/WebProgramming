class EnglishLearningTodo {
    constructor() {
        this.tasks = [];
        this.filteredTasks = [];
        this.currentTaskId = null;
        this.editingTaskId = null;
        this.timerInterval = null;
        this.timerSeconds = 0;
        this.isTimerRunning = false;
        
        this.initializeStorage();
        this.initializeElements();
        this.bindEvents();
        this.applyFilters();
    }

    initializeStorage() {
        // ローカルストレージからタスクを読み込む
        const savedTasks = localStorage.getItem('tasks');
        this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
    }

    initializeElements() {
        this.elements = {
            // Main elements
            taskList: document.getElementById('taskList'),
            emptyState: document.getElementById('emptyState'),
            
            // Controls
            addTaskBtn: document.getElementById('addTaskBtn'),
            searchInput: document.getElementById('searchInput'),
            categoryFilter: document.getElementById('categoryFilter'),
            priorityFilter: document.getElementById('priorityFilter'),
            statusFilter: document.getElementById('statusFilter'),
            
            // Task Modal
            taskModal: document.getElementById('taskModal'),
            closeModal: document.getElementById('closeModal'),
            cancelBtn: document.getElementById('cancelBtn'),
            modalTitle: document.getElementById('modalTitle'),
            taskForm: document.getElementById('taskForm'),
            taskTitle: document.getElementById('taskTitle'),
            taskDescription: document.getElementById('taskDescription'),
            taskCategory: document.getElementById('taskCategory'),
            taskPriority: document.getElementById('taskPriority'),
            taskDueDate: document.getElementById('taskDueDate'),
            taskEstimatedTime: document.getElementById('taskEstimatedTime'),
            
            // Stats Modal
            statsBtn: document.getElementById('statsBtn'),
            statsModal: document.getElementById('statsModal'),
            closeStatsModal: document.getElementById('closeStatsModal'),
            
            // Time Modal
            timeModal: document.getElementById('timeModal'),
            closeTimeModal: document.getElementById('closeTimeModal'),
            timerDisplay: document.getElementById('timerDisplay'),
            currentTaskTitle: document.getElementById('currentTaskTitle'),
            startTimer: document.getElementById('startTimer'),
            pauseTimer: document.getElementById('pauseTimer'),
            stopTimer: document.getElementById('stopTimer'),
            manualTime: document.getElementById('manualTime'),
            addManualTime: document.getElementById('addManualTime'),
            
            // Theme
            themeToggle: document.getElementById('themeToggle')
        };
    }

    bindEvents() {
        // Task management
        this.elements.addTaskBtn.addEventListener('click', () => this.openTaskModal());
        this.elements.closeModal.addEventListener('click', () => this.closeTaskModal());
        this.elements.cancelBtn.addEventListener('click', () => this.closeTaskModal());
        this.elements.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        
        // Filters and search
        this.elements.searchInput.addEventListener('input', () => this.applyFilters());
        this.elements.categoryFilter.addEventListener('change', () => this.applyFilters());
        this.elements.priorityFilter.addEventListener('change', () => this.applyFilters());
        this.elements.statusFilter.addEventListener('change', () => this.applyFilters());
        
        // Stats
        this.elements.statsBtn.addEventListener('click', () => this.openStatsModal());
        this.elements.closeStatsModal.addEventListener('click', () => this.closeStatsModal());
        
        // Time tracking
        this.elements.closeTimeModal.addEventListener('click', () => this.closeTimeModal());
        this.elements.startTimer.addEventListener('click', () => this.startTimer());
        this.elements.pauseTimer.addEventListener('click', () => this.pauseTimer());
        this.elements.stopTimer.addEventListener('click', () => this.stopTimer());
        this.elements.addManualTime.addEventListener('click', () => this.addManualTime());


        // Theme
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Close modals on outside click
        [this.elements.taskModal, this.elements.statsModal, this.elements.timeModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }


    toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
    }

    loadTasks() {
        // ローカルストレージからタスクを読み込む
        const savedTasks = localStorage.getItem('tasks');
        this.tasks = savedTasks ? JSON.parse(savedTasks) : [];
        this.applyFilters();
    }

    saveTasks() {
        // ローカルストレージにタスクを保存
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    openTaskModal(taskId = null) {
        this.editingTaskId = taskId;
        const task = taskId ? this.tasks.find(t => t.id === taskId) : null;
        
        if (task) {
            this.elements.modalTitle.textContent = 'タスクを編集';
            this.elements.taskTitle.value = task.title;
            this.elements.taskDescription.value = task.description || '';
            this.elements.taskCategory.value = task.category;
            this.elements.taskPriority.value = task.priority;
            this.elements.taskDueDate.value = task.dueDate || '';
            this.elements.taskEstimatedTime.value = task.estimatedTime || '';
        } else {
            this.elements.modalTitle.textContent = '新しいタスク';
            this.elements.taskForm.reset();
        }
        
        this.elements.taskModal.classList.remove('hidden');
    }

    closeTaskModal() {
        this.elements.taskModal.classList.add('hidden');
        this.editingTaskId = null;
    }

    async handleTaskSubmit(e) {
        e.preventDefault();
        
        const taskData = {
            title: this.elements.taskTitle.value.trim(),
            description: this.elements.taskDescription.value.trim(),
            category: this.elements.taskCategory.value,
            priority: this.elements.taskPriority.value,
            dueDate: this.elements.taskDueDate.value,
            estimatedTime: parseInt(this.elements.taskEstimatedTime.value) || 0
        };
        
        if (this.editingTaskId) {
            await this.updateTask(this.editingTaskId, taskData);
        } else {
            await this.createTask(taskData);
        }
        
        this.closeTaskModal();
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
        this.saveTasks();
        this.applyFilters();
    }

    updateTask(taskId, taskData) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...taskData };
            this.saveTasks();
            this.applyFilters();
        }
    }

    async toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            // Schedule review if completing
            if (task.completed) {
                const reviewDates = [
                    new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
                    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 month
                ];
                task.reviewDates = reviewDates.map(date => date.toISOString());
            }
            
            this.saveTasks();
            this.renderTasks();
        }
    }

    applyFilters() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        const categoryFilter = this.elements.categoryFilter.value;
        const priorityFilter = this.elements.priorityFilter.value;
        const statusFilter = this.elements.statusFilter.value;
        
        this.filteredTasks = this.tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                                (task.description && task.description.toLowerCase().includes(searchTerm));
            const matchesCategory = !categoryFilter || task.category === categoryFilter;
            const matchesPriority = !priorityFilter || task.priority === priorityFilter;
            const matchesStatus = !statusFilter || 
                                (statusFilter === 'completed' && task.completed) ||
                                (statusFilter === 'pending' && !task.completed);
            
            return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
        });
        
        this.renderTasks();
    }

    renderTasks() {
        if (this.filteredTasks.length === 0) {
            this.elements.taskList.innerHTML = '';
            this.elements.emptyState.classList.remove('hidden');
            return;
        }
        
        this.elements.emptyState.classList.add('hidden');
        
        const sortedTasks = this.filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        
        this.elements.taskList.innerHTML = sortedTasks.map(task => this.renderTask(task)).join('');
    }

    renderTask(task) {
        const categoryLabels = {
            vocabulary: '語彙',
            grammar: '文法',
            listening: 'リスニング',
            speaking: 'スピーキング',
            reading: 'リーディング',
            writing: 'ライティング'
        };
        
        const priorityLabels = {
            high: '高',
            medium: '中',
            low: '低'
        };
        
        const priorityColors = {
            high: 'text-red-600 dark:text-red-400',
            medium: 'text-yellow-600 dark:text-yellow-400',
            low: 'text-green-600 dark:text-green-400'
        };
        
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && !task.completed;
        
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 priority-${task.priority} fade-in ${task.completed ? 'opacity-75' : ''}">
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3 flex-1">
                        <button onclick="app.toggleTaskCompletion('${task.id}')" class="mt-1 text-lg ${task.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}">
                            <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                        </button>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white ${task.completed ? 'line-through' : ''}">${task.title}</h3>
                            ${task.description ? `<p class="text-gray-600 dark:text-gray-400 mt-1 ${task.completed ? 'line-through' : ''}">${task.description}</p>` : ''}
                            <div class="flex flex-wrap items-center gap-2 mt-2">
                                <span class="px-2 py-1 text-xs rounded-full category-${task.category}">${categoryLabels[task.category]}</span>
                                <span class="text-xs ${priorityColors[task.priority]}">
                                    <i class="fas fa-flag mr-1"></i>${priorityLabels[task.priority]}
                                </span>
                                ${task.studyTime > 0 ? `<span class="text-xs text-blue-600 dark:text-blue-400"><i class="fas fa-clock mr-1"></i>${task.studyTime}分</span>` : ''}
                                ${task.dueDate ? `<span class="text-xs ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}"><i class="fas fa-calendar mr-1"></i>${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 ml-4">
                        ${!task.completed ? `
                            <button onclick="app.openTimeModal('${task.id}')" class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded" title="学習時間記録">
                                <i class="fas fa-play"></i>
                            </button>
                        ` : ''}
                        <button onclick="app.openTaskModal('${task.id}')" class="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded" title="編集">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="app.deleteTask('${task.id}')" class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded" title="削除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    openTimeModal(taskId) {
        this.currentTaskId = taskId;
        const task = this.tasks.find(t => t.id === taskId);
        this.elements.currentTaskTitle.textContent = task.title;
        this.elements.timeModal.classList.remove('hidden');
        this.timerSeconds = 0;
        this.updateTimerDisplay();
    }

    closeTimeModal() {
        this.stopTimer();
        this.elements.timeModal.classList.add('hidden');
        this.currentTaskId = null;
    }

    startTimer() {
        if (!this.isTimerRunning) {
            this.isTimerRunning = true;
            this.elements.startTimer.classList.add('hidden');
            this.elements.pauseTimer.classList.remove('hidden');
            
            this.timerInterval = setInterval(() => {
                this.timerSeconds++;
                this.updateTimerDisplay();
            }, 1000);
        }
    }

    pauseTimer() {
        if (this.isTimerRunning) {
            this.isTimerRunning = false;
            clearInterval(this.timerInterval);
            this.elements.startTimer.classList.remove('hidden');
            this.elements.pauseTimer.classList.add('hidden');
        }
    }

    async stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.isTimerRunning = false;
            this.elements.startTimer.classList.remove('hidden');
            this.elements.pauseTimer.classList.add('hidden');
            
            if (this.timerSeconds > 0 && this.currentTaskId) {
                const minutes = Math.ceil(this.timerSeconds / 60);
                await this.addStudyTime(this.currentTaskId, minutes);
            }
            
            this.timerSeconds = 0;
            this.updateTimerDisplay();
        }
    }

    updateTimerDisplay() {
        const hours = Math.floor(this.timerSeconds / 3600);
        const minutes = Math.floor((this.timerSeconds % 3600) / 60);
        const seconds = this.timerSeconds % 60;
        
        this.elements.timerDisplay.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    addManualTime() {
        const minutes = parseInt(this.elements.manualTime.value);
        if (minutes > 0 && this.currentTaskId) {
            this.addStudyTime(this.currentTaskId, minutes);
            this.elements.manualTime.value = '';
        }
    }

    addStudyTime(taskId, minutes) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].studyTime += minutes;
            this.saveTasks();
            this.updateStats();
        }
    }

    openStatsModal() {
        this.updateStats();
        this.elements.statsModal.classList.remove('hidden');
    }

    closeStatsModal() {
        this.elements.statsModal.classList.add('hidden');
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(t => t.completed).length;
        const totalStudyTime = this.tasks.reduce((sum, task) => sum + (task.studyTime || 0), 0);
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('totalStudyTime').textContent = `${totalStudyTime}分`;
        document.getElementById('completionRate').textContent = `${completionRate}%`;
        
        this.renderCharts();
    }

    deleteTask(taskId) {
        // タスクを削除
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        
        // フィルターされたタスクも更新
        this.filteredTasks = this.filteredTasks.filter(task => task.id !== taskId);
        
        // ストレージを更新
        this.saveTasks();
        
        // タスクを再描画
        this.renderTasks();
    }

    renderCharts() {
        // Category chart
        const categoryData = {};
        const categoryLabels = {
            vocabulary: '語彙',
            grammar: '文法',
            listening: 'リスニング',
            speaking: 'スピーキング',
            reading: 'リーディング',
            writing: 'ライティング'
        };
        
        this.tasks.forEach(task => {
            categoryData[task.category] = (categoryData[task.category] || 0) + 1;
        });
        
        const categoryChart = document.getElementById('categoryChart');
        const categoryCtx = categoryChart.getContext('2d');
        
        // Destroy existing chart if it exists
        if (categoryChart.chart) {
            categoryChart.chart.destroy();
        }
        
        categoryChart.chart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData).map(key => categoryLabels[key]),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#8B5CF6',
                        '#3B82F6',
                        '#10B981',
                        '#F59E0B',
                        '#EF4444',
                        '#6366F1'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Priority chart
        const priorityData = {};
        const priorityLabels = { high: '高', medium: '中', low: '低' };
        
        this.tasks.forEach(task => {
            priorityData[task.priority] = (priorityData[task.priority] || 0) + 1;
        });
        
        const priorityChart = document.getElementById('priorityChart');
        const priorityCtx = priorityChart.getContext('2d');
        
        // Destroy existing chart if it exists
        if (priorityChart.chart) {
            priorityChart.chart.destroy();
        }
        
        priorityChart.chart = new Chart(priorityCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(priorityData).map(key => priorityLabels[key]),
                datasets: [{
                    data: Object.values(priorityData),
                    backgroundColor: ['#EF4444', '#F59E0B', '#10B981']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
}

// Initialize the app
const app = new EnglishLearningTodo();
