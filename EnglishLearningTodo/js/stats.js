// stats.js

export class StatsManager {
    constructor(tasks, ui) {
        this.tasks = tasks;
        this.ui = ui;

        this.categoryChart = null;
        this.priorityChart = null;
    }

    updateStats(tasks) {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const totalTime = tasks.reduce((sum, t) => sum + (t.studyTime || 0), 0);
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('totalStudyTime').textContent = `${totalTime}分`;
        document.getElementById('completionRate').textContent = `${rate}%`;

        this.renderCategoryChart(tasks);
        this.renderPriorityChart(tasks);
    }

    renderCategoryChart(tasks) {
        const data = {};
        const labelsMap = {
            vocabulary: '語彙',
            grammar: '文法',
            listening: 'リスニング',
            speaking: 'スピーキング',
            reading: 'リーディング',
            writing: 'ライティング'
        };

        tasks.forEach(t => {
            if (!data[t.category]) data[t.category] = 0;
            data[t.category]++;
        });

        const ctx = document.getElementById('categoryChart').getContext('2d');
        if (this.categoryChart) this.categoryChart.destroy();

        this.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data).map(key => labelsMap[key] || key),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        '#8B5CF6', '#3B82F6', '#10B981',
                        '#F59E0B', '#EF4444', '#6366F1'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    renderPriorityChart(tasks) {
        const data = {};
        const labelsMap = { high: '高', medium: '中', low: '低' };

        tasks.forEach(t => {
            if (!data[t.priority]) data[t.priority] = 0;
            data[t.priority]++;
        });

        const ctx = document.getElementById('priorityChart').getContext('2d');
        if (this.priorityChart) this.priorityChart.destroy();

        this.priorityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data).map(key => labelsMap[key] || key),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: ['#EF4444', '#F59E0B', '#10B981']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 }
                    }
                }
            }
        });
    }
}
