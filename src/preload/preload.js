const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileDialog: () => ipcRenderer.send("open-file-dialog"),
  sendCredentials: (credentials) =>
    ipcRenderer.send("send-credentials", credentials),
  onCredentialsSent: (callback) => ipcRenderer.on("login-result", callback),
  fileSelected: (callback) => ipcRenderer.on("file-selected", callback),
  sendProcessInfo: (processInfo) =>
    ipcRenderer.send("send-processInfo", processInfo),
  sendRequirementsCheck: () => ipcRenderer.send("send-requirements-check"),
  onRequirementsCheckResult: (callback) =>
    ipcRenderer.on("requirements-check-result", callback),
});
