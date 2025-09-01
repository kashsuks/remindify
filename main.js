const { app, BrowserWindow, globalShortcut, ipcMain, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

let win;
const remindersFile = path.join(app.getPath('userData'), 'reminders.json');

function ensureFile() {
    if (!fs.existsSync(remindersFile)) {
        fs.writeFileSync(remindersFile, JSON.stringify([]));
    }
}

function loadReminders() {
    ensureFile();
    return JSON.parse(fs.readFileSync(remindersFile));
}

function saveReminders(reminders) {
    fs.writeFileSync(remindersFile, JSON.stringify(reminders));
}

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
    const MAX_DELAY = 2147483647;

    const now = Date.now();
    const delay = reminder.time - now;

    if (delay <= 0) {
        new Notification({ title: "Reminder", body: reminder.text }).show();
        return;
    }

    if (delay > MAX_DELAY) {
        setTimeout(() => scheduleReminder(reminder), MAX_DELAY);
    } else {
        setTimeout(() => {
            new Notification({ title: "Reminder", body: reminder.text }).show();
        }, delay);
    }
}

app.whenReady().then(() => {
    createWindow();
    loadReminders().forEach(scheduleReminder);

    globalShortcut.register('CommandOrControl+Shift+R', () => {
        if (win.isVisible()) {
            win.hide();
        } else {
            win.show();
            win.webContents.send('reminders', loadReminders());
        }
    });

    ipcMain.on('schedule-reminder', (event, reminder) => {
        const reminders = loadReminders();
        reminders.push(reminder);
        saveReminders(reminders);

        scheduleReminder(reminder);
        win.webContents.send('reminders', reminders);
    });

    ipcMain.on('delete-reminder', (event, index) => {
        let reminders = loadReminders();
        reminders.splice(index, 1);
        saveReminders(reminders);
        win.webContents.send('reminders', reminders);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});