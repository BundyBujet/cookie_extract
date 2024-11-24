const { app } = require("electron");
const createMainWindow = require("./src/main/mainWindow");
require("./src/main/ipcHandlers");

app.whenReady().then(() => {
  createMainWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
