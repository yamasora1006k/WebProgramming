export class TimerManager {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.currentTaskId = null;
        this.seconds = 0;
        this.interval = null;
        this.isRunning = false;
        this.displayElement = document.getElementById('timerDisplay');
        this.taskTitleElement = document.getElementById('currentTaskTitle');
    }

    start() {
        if (!this.isRunning && this.currentTaskId) {
            this.isRunning = true;
            document.getElementById('startTimer').classList.add('hidden');
            document.getElementById('pauseTimer').classList.remove('hidden');

            this.interval = setInterval(() => {
                this.seconds++;
                this.updateDisplay();
            }, 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            clearInterval(this.interval);
            this.isRunning = false;
            document.getElementById('startTimer').classList.remove('hidden');
            document.getElementById('pauseTimer').classList.add('hidden');
        }
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.isRunning = false;
            document.getElementById('startTimer').classList.remove('hidden');
            document.getElementById('pauseTimer').classList.add('hidden');

            const minutes = Math.ceil(this.seconds / 60);
            if (minutes > 0 && this.currentTaskId) {
                this.taskManager.addStudyTime(this.currentTaskId, minutes);
            }

            this.seconds = 0;
            this.updateDisplay();
            this.currentTaskId = null;

            document.getElementById('timeModal').classList.add('hidden');
        }
    }

    updateDisplay() {
        const h = String(Math.floor(this.seconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((this.seconds % 3600) / 60)).padStart(2, '0');
        const s = String(this.seconds % 60).padStart(2, '0');
        this.displayElement.textContent = `${h}:${m}:${s}`;
    }

    addManualTime(minutes) {
        if (this.currentTaskId && minutes > 0) {
            this.taskManager.addStudyTime(this.currentTaskId, minutes);
            document.getElementById('manualTime').value = '';
        }
    }

    setCurrentTask(taskId, title) {
        this.currentTaskId = taskId;
        this.taskTitleElement.textContent = title;
        this.seconds = 0;
        this.updateDisplay();
        document.getElementById('timeModal').classList.remove('hidden');  
    }
}
