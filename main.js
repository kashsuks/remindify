const { app, BrowserWindow, globalShortcut, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
const remindersFile = path.join(app.getPath('userData'), 'reminders.json');

function createWindow() {
    win = new BrowserWindow({
        width: 400,
        height: 300,
        webPreferences: {
            preload: path.join(__dirname, 'renderer.js'),
            nodeIntegration: true,
            contextIsolation: false
        },
        alwaysOnTop: true,
        frame: true,
    });

    win.loadFile('index.html');
    win.hide();
}

function scheduleReminder(reminder) {
    const delay = reminder.time - Date.now();
    if (delay > 0) {
        setTimeout(() => {
            new Notification({ title: "Reminder", body: reminder.text }).show();
        }, delay);
    }
}

function loadSavedReminders() {
    if (fs.existsSync(remindersFile)) {
        const reminders = JSON.parse(fs.readFileSync(remindersFile));
        reminders.forEach(scheduleReminder);
    }
}

app.whenReady().then(() => {
    createWindow();
    loadSavedReminders();

    globalShortcut.register('CommandOrControl+Shift+R', () => {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
        }
    });

    ipcMain.on('schedule-reminder', (event, reminder) => {
        scheduleReminder(reminder);

        // persist to reminders.json
        let reminders = [];
        if (fs.existsSync(remindersFile)) {
            reminders = JSON.parse(fs.readFileSync(remindersFile));
        }
        reminders.push(reminder);
        fs.writeFileSync(remindersFile, JSON.stringify(reminders));
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});