const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getSystemInfo: () => ipcRenderer.invoke("system-info"),
  showNotification: (title, body) => ipcRenderer.invoke("show-notification", { title, body }),
  onJarvisCommand: (callback) => {
    ipcRenderer.on("jarvis-command", (event, command) => callback(command));
  },
});
