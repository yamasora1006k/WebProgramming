// theme.js

export class ThemeManager {
    constructor() {
        this.themeKey = 'preferred-theme';
        this.applySavedTheme();
        this.setupToggleButton();
    }

    applySavedTheme() {
        const savedTheme = localStorage.getItem(this.themeKey);
        const body = document.body;

        if (savedTheme === 'dark') {
            body.classList.add('dark');
        } else if (savedTheme === 'light') {
            body.classList.remove('dark');
        } else {
            // 初回は OS の設定に従う
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                body.classList.add('dark');
                localStorage.setItem(this.themeKey, 'dark');
            } else {
                body.classList.remove('dark');
                localStorage.setItem(this.themeKey, 'light');
            }
        }
    }

    toggle() {
        const body = document.body;
        const isDark = body.classList.contains('dark');

        if (isDark) {
            body.classList.remove('dark');
            localStorage.setItem(this.themeKey, 'light');
        } else {
            body.classList.add('dark');
            localStorage.setItem(this.themeKey, 'dark');
        }
    }

    setupToggleButton() {
        document.addEventListener('DOMContentLoaded', () => {
            const btn = document.getElementById('themeToggle');
            if (btn) {
                btn.addEventListener('click', () => this.toggleTheme());
            }
        });
    }
}
