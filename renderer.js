const { ipcRenderer } = require('electron');

const reminderInput = document.getElementById('reminderInput');
const timeInput = document.getElementById('timeInput');
const saveBtn = document.getElementById('saveBtn');
const reminderList = document.getElementById('reminderList');

function renderReminders(reminders) {
    reminderList.innerHTML = '';
    reminders.forEach((rem, idx) => {
        const li = document.createElement('li');
        li.textContent = `${rem.text} at ${new Date(rem.time).toLocaleString()}`;

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.style.marginLeft = '10px';
        delBtn.onclick = () => {
            ipcRenderer.send('delete-reminder', idx);
        };

        li.appendChild(delBtn);
        reminderList.appendChild(li);
    });
}

saveBtn.addEventListener('click', () => {
    if (!reminderInput.value || !timeInput.value) return;

    const reminder = {
        text: reminderInput.value,
        time: new Date(timeInput.value).getTime()
    };

    ipcRenderer.send('schedule-reminder', reminder);
    reminderInput.value = '';
    timeInput.value = '';
});

ipcRenderer.on('reminders', (event, reminders) => {
    renderReminders(reminders);
});