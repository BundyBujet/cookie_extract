const { BrowserWindow } = require("electron");
const path = require("path");

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    title: "Cookie Extract",
    backgroundColor: "#aaa",
    nodeIntegration: true,
    contextIsolation: false,
    enableRemoteModule: false, // Remove remote module (deprecated and insecure)
    sandbox: true,
    resizable: false,
    hasShadow: true,
    devTools: false,
    show: false,
    icon: path.join(__dirname, "../../assets/icon.ico"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile("public/login-page.html");
  mainWindow.removeMenu();
  // mainWindow.webContents.openDevTools();
  // Disable keyboard shortcuts for DevTools
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === "i") {
      event.preventDefault();
    }
  });

  // Prevent context menu
  mainWindow.webContents.on("context-menu", (event) => {
    event.preventDefault();
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
}

module.exports = createMainWindow;
