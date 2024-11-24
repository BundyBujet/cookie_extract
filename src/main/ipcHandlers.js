const fs = require("fs");
const { ipcMain, dialog } = require("electron");
const { isChromeInstalled } = require("../../utils/checkRequirements");
const BrowserInit = require("../../services/Browser.service");
const readCSVFile = require("../../utils/readCSVFile");
const { startBrowser } = require("../../utils/browserInit");

// Handle file selection dialog
ipcMain.on("open-file-dialog", (event) => {
  dialog
    .showOpenDialog({
      filters: [{ name: "CSV Files", extensions: ["csv"] }],
      properties: ["openFile"],
    })
    .then((result) => {
      if (!result.canceled && result.filePaths.length > 0) {
        console.log(result.filePaths[0]);
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
ipcMain.on("send-credentials", (event, credentials) => {
  // console.log(credentials);
  return event.reply("login-result", { success: true });
});

// Handle process info
ipcMain.on("send-processInfo", async (event, processInfo) => {
  const { filePath, process } = processInfo;
  const users = await readCSVFile(filePath);
  const url = "https://www.facebook.com/login";
  const options = {
    headless: false,
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
      const cookies = await browserInit.closeAndDisplayCookies();
      const failedUsers = await browserInit.closeAndDisplayFailedUsers();

      //formate the array of successful cookies to a string
      if (cookies.length !== 0) {
        const formattedUsers = cookies
          .map((entry) => {
            return `${entry.email},${entry.password},${entry.token},${entry.cookies}`;
          })
          .join("\n");

        //write successful cookies to a file with deno

        fs.writeFileSync("cookies.csv", formattedUsers);
      }

      if (failedUsers.length !== 0) {
        //formate the array of failed users to a string
        const formattedFailedUsers = failedUsers
          .map((entry) => {
            return `${entry.UserCredentials.email},${entry.UserCredentials.password},${entry.loginStatusCode}`;
          })
          .join("\n");
        //write failed users to a file with deno
        fs.writeFileSync("failed.csv", formattedFailedUsers);
      }
    } catch (error) {
      console.log(error);
    }
  }
});

// Handle requirements check
ipcMain.on("send-requirements-check", async (event) => {
  console.log("Sending requirements check");
  if (isChromeInstalled()) {
    return event.reply("requirements-check-result", { success: true });
  }
  return event.reply("requirements-check-result", { success: false });
});
