const puppeteer = require("puppeteer-core");

const startBrowser = async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: getChromeExecutablePath(), // Path to system Chrome
      headless: false, // Optional: run in headless mode
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // Common flags for stability
    });

    const page = await browser.newPage();
    await page.goto("https://google.com");
    console.log(await page.title());

    await browser.close();
  } catch (error) {
    console.error("Error launching Puppeteer:", error);
  }
};

// Function to determine Chrome executable path based on OS
function getChromeExecutablePath() {
  const platform = process.platform;
  if (platform === "win32") {
    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  } else if (platform === "darwin") {
    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  } else if (platform === "linux") {
    return "/usr/bin/google-chrome";
  } else {
    throw new Error("Unsupported platform");
  }
}

module.exports = {
  startBrowser,
};
