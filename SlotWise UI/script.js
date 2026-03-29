tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#9FDF20",
                "primary-hover": "#8cc61f",
                "background-light": "#FAFAF9",
                "background-dark": "#111518",
                "surface-light": "#FFFFFF",
                "surface-dark": "#1E2329",
                "text-main": "#111827",
                "text-secondary": "#6B7280",
                "accent-lime": "#bef264",
                "accent-lime-dark": "#3f6212",
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"],
                "body": ["Manrope", "sans-serif"]
            },
            boxShadow: {
                "soft": "0 10px 40px -10px rgba(0,0,0,0.05)",
            },
            borderRadius: { "DEFAULT": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px" },
        },
    },
};

// Toggle Password Visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const icon = document.getElementById('password-toggle-icon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.innerText = 'visibility_off';
    } else {
        passwordInput.type = 'password';
        icon.innerText = 'visibility';
    }
}

// Navigation Helper
document.addEventListener('DOMContentLoaded', () => {
    // Highlight active link functionality can be added here if needed

    // Login form handler
    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulate login
            const button = loginForm.querySelector('button[type="submit"]');
            const originalContent = button.innerHTML;
            button.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Signing In...';
            button.disabled = true;

            setTimeout(() => {
                window.location.href = 'dash.html';
            }, 800);
        });
    }

    // Schedule Event Button (Simulate Conflict)
    const scheduleBtn = document.getElementById('schedule-event-btn');
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', () => {
            // Simulate processing
            const originalText = scheduleBtn.innerHTML;
            scheduleBtn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[18px] mr-2">progress_activity</span> Checking...';
            scheduleBtn.disabled = true;

            setTimeout(() => {
                window.location.href = 'schedule_conflict.html';
            }, 1000);
        });
    }
});
