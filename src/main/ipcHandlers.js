const fs = require("fs");
const { ipcMain, dialog } = require("electron");
const { isChromeInstalled } = require("../../utils/checkRequirements");
const BrowserInit = require("../../services/Browser.service");
const readCSVFile = require("../../utils/readCSVFile");

// Handle file selection dialog
ipcMain.on("open-file-dialog", (event) => {
  dialog
    .showOpenDialog({
      filters: [{ name: "CSV Files", extensions: ["csv"] }],
      properties: ["openFile"],
    })
    .then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        // console.log(result.filePaths[0]);
        const fileName = result.filePaths[0].split("\\");
        event.reply("file-selected", {
          fileName: fileName[fileName.length - 1],
          path: result.filePaths[0],
        });
      } else {
        event.reply("file-selected", null);
      }
    });
});

// Handle login credentials
ipcMain.on("send-credentials", async (event, credentials) => {
  const { email, password } = credentials;
  try {
    const response = await fetch(
      "https://www.reachrapid.net/api/auth/app_login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (!response.ok) {
      const errorMessage = await response.json();

      return event.reply("login-result", {
        success: false,
        message: errorMessage,
      });
    }

    const data = await response.json();

    if (data?.data) {
      return event.reply("login-result", { success: true });
    }
  } catch (error) {
    console.log(error);
    event.reply("login-result", { success: false, message: error.message });
  }
});

// Handle process info
ipcMain.on("send-processInfo", async (event, processInfo) => {
  const { filePath, process } = processInfo;
  const users = await readCSVFile(filePath);
  const url = "https://www.facebook.com/login";
  const options = {
    headless: "new",
    args: [
      "--no-sandbox",
      "--incognito",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-notifications",
    ],
    instances: process,
    cleanCache: true,
  };
  if (isChromeInstalled()) {
    try {
      const browserInit = new BrowserInit(options);
      await browserInit.initBrowsers();
      await browserInit.processUsers(url, users);
    } catch (error) {
      console.log(error);
    }
  }
  return event.reply("process-info-result", { success: true });
});

// Handle requirements check
ipcMain.on("send-requirements-check", async (event) => {
  // console.log("Sending requirements check");
  if (isChromeInstalled()) {
    return event.reply("requirements-check-result", { success: true });
  }
  return event.reply("requirements-check-result", { success: false });
});
