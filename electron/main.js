const { app, BrowserWindow, ipcMain, Tray, Menu, Notification } = require("electron");
const path = require("path");

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#050308",
      symbolColor: "#ffffff",
      height: 35
    },
    backgroundColor: "#050308",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "icon.png"),
  });

  // Support local Next.js static export or local dev server
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, "tray-icon.png");
  // Simple check for icon fallback
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show VelocityOS",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    {
      label: "Quick Start Session",
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send("jarvis-command", "start focus");
          new Notification({
            title: "Focus Session Started",
            body: "VelocityOS has initiated a sprint.",
          }).show();
        }
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("VelocityOS AI Productivity Cockpit");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  // Safe mock icon/tray creation checks
  try {
    createTray();
  } catch (e) {
    console.log("System tray initialization skipped (icon missing or no display server).");
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Native Desktop Commands
ipcMain.handle("system-info", () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion(),
    uptime: process.uptime(),
  };
});

ipcMain.handle("show-notification", (event, { title, body }) => {
  new Notification({ title, body }).show();
  return true;
});
