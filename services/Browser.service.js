const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const anonymousPlugin = require("puppeteer-extra-plugin-anonymize-ua");
const checkLoginStatus = require("../utils/loginStatusChecker.js");
const getBusinessToken = require("../utils/getBusinessToken.js");
puppeteer.use(StealthPlugin());
puppeteer.use(anonymousPlugin());

class BrowserInit {
  browsers = [];
  cookiesList = [];
  failedUsers = [];

  constructor(options) {
    this.options = options;

    // Register signal handlers for graceful shutdown
    this.setupSignalHandlers();
  }

  // Initialize multiple browser instances
  async initBrowsers() {
    const { headless, args, instances } = this.options;

    for (let i = 0; i < instances; i++) {
      const browser = await puppeteer.launch({
        headless,
        args,
        executablePath: this.getChromeExecutablePath(),
      });

      this.browsers.push(browser);
    }
  }

  // Login and retrieve cookies for a single user
  async getUserCookies(page, url, user, formSelector = "form") {
    const { email, password } = user;

    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector(formSelector);

    // Input credentials
    const emailInput = await page.$("input[name='email']");
    const passwordInput = await page.$("input[name='pass']");
    if (!emailInput || !passwordInput) {
      throw new Error("Could not find email or password input fields");
    }

    await emailInput.type(email, { delay: 10 });
    await passwordInput.type(password, { delay: 10 });

    // Submit the form and wait for navigation to complete
    await page.click("button[type='submit']");
    await page.waitForNavigation();

    await this.delay(2);
    const { statusCode, isAuthLogin } = await checkLoginStatus(page);
    console.log("Status code:", { statusCode, isAuthLogin });
    await this.delay(2);

    if (statusCode === "AUTOMATION_NOTICE" && isAuthLogin) {
      const noticeButton = await page.$(
        "div[role='button'] > div > div[data-visualcompletion='ignore']"
      );
      await noticeButton?.click();
      await page.waitForNavigation();
      await this.delay(2);
    }

    if (!isAuthLogin) {
      const cookies = await page.cookies();
      fs.appendFileSync(
        "failed.csv",
        `${user.email},${user.password},${statusCode}\n`
      );

      await this.clearSessionData(page, cookies);
      return;
    }

    const cookies = await page.cookies();
    const formattedCookies = this.cookiesFormatter(cookies);
    const token = await getBusinessToken(formattedCookies);

    if (!token) {
      await this.clearSessionData(page, cookies);
      return;
    }

    fs.appendFileSync(
      "cookies.csv",
      `${email},${password},${token || "N/A"},${formattedCookies}\n`
    );

    await this.clearSessionData(page, cookies);
  }

  // Process users by assigning each browser instance one user at a time in a single tab
  async processUsers(url, users) {
    const usersPerInstance = Math.ceil(users.length / this.browsers.length);

    try {
      const tasks = this.browsers.map(async (browser, index) => {
        const userChunk = users.slice(
          index * usersPerInstance,
          (index + 1) * usersPerInstance
        );
        const page = await browser.newPage();
        const tabs = await browser.pages();
        if (tabs.length > 1) await tabs[0].close();

        for (const user of userChunk) {
          try {
            await this.getUserCookies(page, url, user);
          } catch (userError) {
            console.error(`Error processing user: ${userError}`);
            fs.appendFileSync(
              "failed.csv",
              `${user.email},${user.password},${"OPERATION_FAILED"}\n`
            );
          }
        }

        await page.close();
      });

      await Promise.all(tasks);
    } catch (error) {
      console.log("\nProcess aborted");
      console.error(error);
    }
  }

  // Clear cookies and session data
  async clearSessionData(page, cookies) {
    await page.deleteCookie(...cookies);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  // Close all browser instances and display collected cookies
  async closeAndDisplayCookies() {
    await Promise.all(this.browsers.map((browser) => browser.close()));
    return this.cookiesList;
  }

  // Close all browser instances and display failed users
  async closeAndDisplayFailedUsers() {
    await Promise.all(this.browsers.map((browser) => browser.close()));
    return this.failedUsers;
  }

  // Setup signal handlers to handle termination signals gracefully
  setupSignalHandlers() {
    const cleanup = async () => {
      await this.closeAndDisplayCookies();
      process.exit();
    };

    // Capture SIGINT (Ctrl+C) and SIGTERM signals
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
  }

  // Delay function
  async delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
  }

  // Cookies formatter
  cookiesFormatter(cookies) {
    return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join(";");
  }

  // Determine Chrome executable path
  getChromeExecutablePath() {
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
}

module.exports = BrowserInit;
