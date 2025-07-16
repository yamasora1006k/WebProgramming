import { TaskManager } from './task.js';
import { TimerManager } from './timer.js';
import { StorageManager } from './storage.js';
import { UIManager } from './ui.js';
import { StatsManager } from './stats.js';
import { ThemeManager } from './theme.js';


console.log("app.js loaded");




class EnglishLearningTodo {
    constructor() {
        this.storage = new StorageManager();
        this.tasks = this.storage.loadTasks();
        this.ui = new UIManager(this);
        this.taskManager = new TaskManager(this.tasks, this.ui, this.storage);
        this.timer = new TimerManager(this.taskManager);
        this.stats = new StatsManager(this.tasks, this.ui);
        this.theme = new ThemeManager();

        this.bindGlobalEvents();
        this.ui.renderTasks(this.tasks);
    }

    bindGlobalEvents() {
        // タスク関連
        this.ui.onAddTask(() => this.taskManager.openTaskModal());
        this.ui.onTaskSubmit((taskData, editingId) => {
            if (editingId) {
                this.taskManager.updateTask(editingId, taskData);
            } else {
                this.taskManager.createTask(taskData);
            }
        });

        // 検索・フィルター
        this.ui.onFilterChange(() => {
            const filtered = this.taskManager.getFilteredTasks(this.ui.getFilters());
            this.ui.renderTasks(filtered);
        });

        // 統計表示
        this.ui.onShowStats(() => {
            this.ui.hideTimeModal();
            this.stats.updateStats(this.taskManager.getAllTasks());
            this.ui.showStatsModal();
        });

        // タイマー操作
        this.ui.onStartTimer(() => {
            const firstTask = this.taskManager.getAllTasks()[0];
            if (firstTask) {
                console.log("Start Timer for:", firstTask.title);  // ← デバッグ出力
                this.timer.setCurrentTask(firstTask.id, firstTask.title);
            } else {
                alert('タスクがありません。先にタスクを追加してください。');
            }
        });
        
        this.ui.onPauseTimer(() => this.timer.pause());
        this.ui.onStopTimer(() => this.timer.stop());
        this.ui.onAddManualTime((minutes) => this.timer.addManualTime(minutes));

        // テーマ切替
        this.ui.onToggleTheme(() => this.theme.toggle());
    }
}

// window.app = new EnglishLearningTodo();

document.addEventListener('DOMContentLoaded', () => {
    window.app = new EnglishLearningTodo();
});

