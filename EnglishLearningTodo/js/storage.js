// storage.js

export class StorageManager {
    constructor() {
        this.storageKey = 'tasks';
    }

    loadTasks() {
        const saved = localStorage.getItem(this.storageKey);
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('タスクの読み込みに失敗しました:', e);
            return [];
        }
    }

    saveTasks(tasks) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(tasks));
        } catch (e) {
            console.error('タスクの保存に失敗しました:', e);
        }
    }
}
