export class UIManager {
    constructor(app) {
        this.app = app;
        this.elements = this.getElements();
        this.setupEventHandlers();
    }

    getElements() {
        return {
            taskList: document.getElementById('taskList'),
            emptyState: document.getElementById('emptyState'),
            addTaskBtn: document.getElementById('addTaskBtn'),
            searchInput: document.getElementById('searchInput'),
            categoryFilter: document.getElementById('categoryFilter'),
            priorityFilter: document.getElementById('priorityFilter'),
            statusFilter: document.getElementById('statusFilter'),
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
            statsBtn: document.getElementById('statsBtn'),
            statsModal: document.getElementById('statsModal'),
            closeStatsModal: document.getElementById('closeStatsModal'),
            timeModal: document.getElementById('timeModal'),
            closeTimeModal: document.getElementById('closeTimeModal'),
            timerDisplay: document.getElementById('timerDisplay'),
            currentTaskTitle: document.getElementById('currentTaskTitle'),
            startTimer: document.getElementById('startTimer'),
            pauseTimer: document.getElementById('pauseTimer'),
            stopTimer: document.getElementById('stopTimer'),
            manualTime: document.getElementById('manualTime'),
            addManualTime: document.getElementById('addManualTime'),
            themeToggle: document.getElementById('themeToggle'),
        };
    }

    setupEventHandlers() {
        this.elements.addTaskBtn.addEventListener('click', () => this.emitAddTask());
        this.elements.taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const taskData = this.getTaskFormData();
            this.emitTaskSubmit(taskData, this.editingId);
            this.hideTaskModal();
        });

        this.elements.closeModal.addEventListener('click', () => this.hideTaskModal());
        this.elements.cancelBtn.addEventListener('click', () => this.hideTaskModal());

        [this.elements.searchInput, this.elements.categoryFilter, this.elements.priorityFilter, this.elements.statusFilter]
            .forEach(el => el.addEventListener('input', () => this.emitFilterChange()));

        this.elements.statsBtn.addEventListener('click', () => this.emitShowStats());
        this.elements.closeStatsModal.addEventListener('click', () => this.hideStatsModal());

        this.elements.startTimer.addEventListener('click', () => this.emitStartTimer());
        this.elements.pauseTimer.addEventListener('click', () => this.emitPauseTimer());
        this.elements.stopTimer.addEventListener('click', () => this.emitStopTimer());
        this.elements.addManualTime.addEventListener('click', () => {
            const minutes = parseInt(this.elements.manualTime.value);
            if (!isNaN(minutes)) this.emitAddManualTime(minutes);
        });

        this.elements.closeTimeModal.addEventListener('click', () => this.elements.timeModal.classList.add('hidden'));
        this.elements.themeToggle.addEventListener('click', () => this.emitToggleTheme());
    }

    // ----------------- イベントハンドラーの登録 -----------------

    onAddTask(cb) { this.emitAddTask = cb; }
    onTaskSubmit(cb) { this.emitTaskSubmit = cb; }
    onToggleComplete(cb) { this.emitToggleComplete = cb; }
    onEditTask(cb) { this.emitEditTask = cb; }
    onDeleteTask(cb) { this.emitDeleteTask = cb; }
    onFilterChange(cb) { this.emitFilterChange = cb; }
    onShowStats(cb) { this.emitShowStats = cb; }
    onStartTimer(cb) { this.emitStartTimer = cb; }
    onPauseTimer(cb) { this.emitPauseTimer = cb; }
    onStopTimer(cb) { this.emitStopTimer = cb; }
    onAddManualTime(cb) { this.emitAddManualTime = cb; }
    onToggleTheme(cb) { this.emitToggleTheme = cb; }

    // ----------------- フォーム・モーダル操作 -----------------

    getTaskFormData() {
        return {
            title: this.elements.taskTitle.value.trim(),
            description: this.elements.taskDescription.value.trim(),
            category: this.elements.taskCategory.value,
            priority: this.elements.taskPriority.value,
            dueDate: this.elements.taskDueDate.value,
            estimatedTime: parseInt(this.elements.taskEstimatedTime.value) || 0
        };
    }

    showTaskModal(task = null, taskId = null) {
        this.editingId = taskId;

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

    hideTaskModal() {
        this.elements.taskModal.classList.add('hidden');
        this.editingId = null;
    }

    showStatsModal() {
        this.elements.timeModal.classList.add('hidden');
        this.elements.statsModal.classList.remove('hidden');
    }

    hideStatsModal() {
        this.elements.statsModal.classList.add('hidden');
    }

    getFilters() {
        return {
            search: this.elements.searchInput.value || '',
            category: this.elements.categoryFilter.value,
            priority: this.elements.priorityFilter.value,
            status: this.elements.statusFilter.value,
        };
    }

    renderTasks(tasks) {
        if (tasks.length === 0) {
            this.elements.taskList.innerHTML = '';
            this.elements.emptyState.classList.remove('hidden');
            return;
        }

        this.elements.emptyState.classList.add('hidden');

        const html = tasks.map(task => {
            const cat = {
                vocabulary: '語彙', grammar: '文法', listening: 'リスニング',
                speaking: 'スピーキング', reading: 'リーディング', writing: 'ライティング'
            }[task.category] || task.category;

            const priorityColors = {
                high: 'text-red-600 dark:text-red-400',
                medium: 'text-yellow-600 dark:text-yellow-400',
                low: 'text-green-600 dark:text-green-400'
            };

            const priorityLabels = {
                high: '高', medium: '中', low: '低'
            };

            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

            return `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${task.completed ? 'opacity-75' : ''}">
                    <div class="flex items-start justify-between">
                        <div class="flex items-start space-x-3 flex-1">
                            <button class="mt-1 text-lg ${task.completed ? 'text-green-600' : 'text-gray-400'}" data-toggle="${task.id}">
                                <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
                            </button>
                            <div class="flex-1 min-w-0">
                                <h3 class="text-lg font-medium ${task.completed ? 'line-through' : ''}">${task.title}</h3>
                                ${task.description ? `<p class="text-sm mt-1 ${task.completed ? 'line-through' : ''}">${task.description}</p>` : ''}
                                <div class="flex flex-wrap gap-2 mt-2 text-xs">
                                    <span class="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">${cat}</span>
                                    <span class="${priorityColors[task.priority]}"><i class="fas fa-flag mr-1"></i>${priorityLabels[task.priority]}</span>
                                    ${task.studyTime > 0 ? `<span class="text-blue-600"><i class="fas fa-clock mr-1"></i>${task.studyTime}分</span>` : ''}
                                    ${task.dueDate ? `<span class="${isOverdue ? 'text-red-600' : 'text-gray-400'}"><i class="fas fa-calendar mr-1"></i>${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            ${!task.completed ? `<button class="p-2 text-blue-500" data-timer="${task.id}" title="学習時間"><i class="fas fa-play"></i></button>` : ''}
                            <button class="p-2 text-gray-500" data-edit="${task.id}" title="編集"><i class="fas fa-edit"></i></button>
                            <button class="p-2 text-red-500" data-delete="${task.id}" title="削除"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                </div>`;
        }).join('');

        this.elements.taskList.innerHTML = html;

        // イベント再割り当て
        this.elements.taskList.querySelectorAll('[data-toggle]').forEach(btn => {
            btn.addEventListener('click', () => this.emitToggleComplete(btn.dataset.toggle));
        });

        this.elements.taskList.querySelectorAll('[data-edit]').forEach(btn => {
            btn.addEventListener('click', () => this.emitEditTask(btn.dataset.edit));
        });

        this.elements.taskList.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', () => this.emitDeleteTask(btn.dataset.delete));
        });

        this.elements.taskList.querySelectorAll('[data-timer]').forEach(btn => {
            btn.addEventListener('click', () => {
                const task = this.app.taskManager.getAllTasks().find(t => t.id === btn.dataset.timer);
                this.app.timer.setCurrentTask(task.id, task.title);
            });
        });
    }
}
