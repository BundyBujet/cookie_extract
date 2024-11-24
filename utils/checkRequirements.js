const fs = require("fs");
const path = require("path");

// Function to check if Chrome is installed
function isChromeInstalled() {
  const platform = process.platform;

  let chromePaths = [];

  // Define common Chrome paths for different operating systems
  if (platform === "win32") {
    chromePaths = [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
  } else if (platform === "darwin") {
    chromePaths = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    ];
  } else if (platform === "linux") {
    chromePaths = [
      "/usr/bin/google-chrome",
      "/usr/local/bin/google-chrome",
      "/usr/bin/chromium-browser",
      "/usr/bin/google-chrome-stable",
    ];
  }

  // Check if any of the paths exist
  return chromePaths.some((chromePath) => fs.existsSync(chromePath));
}

module.exports = {
  isChromeInstalled,
};
