const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 450,          // Width thoda badhaya taaki content na kate
        height: 750,         // Height badhayi
        transparent: true,   // Aar-paar dikhne ke liye
        frame: false,        // Title bar hatane ke liye
        resizable: false,    // User size na badal sake
        alwaysOnTop: true,   // Bot hamesha upar rahega
        hasShadow: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('t2.html');

    // --- YE LINE ZARURI HAI (Click-Through Fix) ---
    // Jab mouse bot ke upar na ho, to click peeche jane do
    ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        win.setIgnoreMouseEvents(ignore, options);
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});