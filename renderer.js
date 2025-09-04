const { ipcRenderer } = require('electron');

const form = document.getElementById('reminder-form');
const reminderText = document.getElementById('reminder-text');
const reminderTime = document.getElementById('reminder-time');
const reminderList = document.getElementById('reminder-list');

form.addEventListener('submit', (e) => {
    e.preventDefault(); // stop page refresh

    const text = reminderText.value.trim();
    const time = new Date(reminderTime.value).getTime();

    if (!text || isNaN(time)) return;

    const reminder = { text, time };

    ipcRenderer.send('schedule-reminder', reminder);

    // clear form
    reminderText.value = '';
    reminderTime.value = '';
});

// Receive reminders from main process
ipcRenderer.on('reminders', (event, reminders) => {
    renderReminders(reminders);
});

function renderReminders(reminders) {
    reminderList.innerHTML = '';
    reminders.forEach((reminder, index) => {
        const li = document.createElement('li');
        li.classList.add('glass');
        li.innerHTML = `
            <span>${reminder.text} - ${new Date(reminder.time).toLocaleString()}</span>
            <div class="delete-btn" data-index="${index}"></div>
        `;
        reminderList.appendChild(li);
    });

    // attach delete events
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = btn.getAttribute('data-index');
            ipcRenderer.send('delete-reminder', parseInt(index));
        });
    });
}