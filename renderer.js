const { ipcRenderer } = require('electron');

const reminderInput = document.getElementById('reminderInput');
const timeInput = document.getElementById('timeInput');
const saveBtn = document.getElementById('saveBtn');
const reminderList = document.getElementById('reminderList');

saveBtn.addEventListener('click', () => {
    if (!reminderInput.value || !timeInput.value) return;

    const reminder = {
        text: reminderInput.value,
        time: new Date(timeInput.value).getTime()
    };

    ipcRenderer.send('schedule-reminder', reminder);

    const li = document.createElement('li');
    li.textContent = `${reminder.text} at ${new Date(reminder.time).toLocaleString()}`;
    reminderList.appendChild(li);

    reminderInput.value = '';
    timeInput.value = '';
});