// Main function to check login status
async function checkLoginStatus(page) {
  //@ts-ignore
  const pageText = await page.evaluate(() => document.body.innerText);
  const currentUrl = page.url();

  // Check login status using a switch statement
  switch (true) {
    case pageText.includes("We saw unusual activity on your account") ||
      pageText.includes("تم قفل حسابك"):
      return { statusCode: "ACCOUNT_LOCKED", isAuthLogin: false };

    case pageText.includes("Enter mobile number") ||
      pageText.includes("أدخل رقم الهاتف المحمول"):
      return { statusCode: "MOBILE_NUMBER_REQUIRED", isAuthLogin: false };

    case pageText.includes("you submitted an appeal") ||
      pageText.includes("لقد قدمت استئنافًا"):
      return { statusCode: "APPEAL_SUBMITTED", isAuthLogin: false };

    case pageText.includes("I sent a rebuttal") ||
      pageText.includes("لقد أرسلت طعنًا"):
      return { statusCode: "REBUTTAL_SENT", isAuthLogin: false };

    case pageText.includes("Wrong credentials") ||
      (await isIncorrectPassword(page)) ||
      currentUrl.includes("www_first_password_failure") ||
      pageText.includes('<input type="password">') ||
      currentUrl.includes(
        "https://www.facebook.com/login/device-based/regular/login/"
      ) ||
      currentUrl.includes("https://www.facebook.com/login"):
      return { statusCode: "WRONG_CREDENTIALS", isAuthLogin: false };

    case pageText.includes("We've disabled your account") ||
      pageText.includes("لقد قمنا بتعطيل حسابك"):
      return { statusCode: "ACCOUNT_DISABLED", isAuthLogin: false };

    case pageText.includes("Confirm your identity with a video selfie") ||
      pageText.includes("قم بتأكيد هويتك من خلال مقطع فيديو سيلفي"):
      return { statusCode: "VIDEO_SELFIE_REQUIRED", isAuthLogin: false };

    case currentUrl === "https://www.facebook.com/" &&
      !(await isIncorrectPassword(page)) &&
      !(await isTryAnotherWay(page)):
      return { statusCode: "LOGIN_SUCCESSFUL", isAuthLogin: true };

    case pageText.includes("Enter the characters you see") ||
      pageText.includes("أدخل الأحرف التي تراها"):
      return { statusCode: "CAPTCHA_REQUIRED", isAuthLogin: false };

    case pageText.includes("Check your email") ||
      pageText.includes("تفقّد بريدك الإلكتروني"):
      return { statusCode: "EMAIL_CHECK_REQUIRED", isAuthLogin: false };

    case pageText.includes("Check notifications on another device") ||
      pageText.includes("تحقق من إشعاراتك على جهاز آخر"):
      return { statusCode: "NOTIFICATION_CHECK_REQUIRED", isAuthLogin: false };

    case pageText.includes("We suspended your account") ||
      pageText.includes("لقد قمنا بتعليق حسابك"):
      return { statusCode: "ACCOUNT_SUSPENDED", isAuthLogin: false };

    case currentUrl.includes("https://www.facebook.com/?sk=welcome") &&
      !(await isIncorrectPassword(page)) &&
      !(await isTryAnotherWay(page)):
      return { statusCode: "LOGIN_SUCCESSFUL", isAuthLogin: true };

    case pageText.includes("We suspect automated behavior on your account") ||
      (pageText.includes("نشتبه في وجود سلوك تلقائي على حسابك") &&
        currentUrl.includes("https://www.facebook.com/checkpoint")):
      return { statusCode: "AUTOMATION_NOTICE", isAuthLogin: true };

    case (currentUrl.includes("https://www.facebook.com/checkpoint") &&
      !pageText.includes("We suspect automated behavior on your account")) ||
      !pageText.includes("نشتبه في وجود سلوك تلقائي على حسابك"):
      return { statusCode: "ACCOUNT_SUSPENDED", isAuthLogin: false };

    default:
      return { statusCode: "OPERATION_ERROR", isAuthLogin: false };
  }
}

// Helper functions
async function isIncorrectPassword(page) {
  return await page.evaluate(() => {
    //@ts-ignore
    return !!document.evaluate(
      '//*[contains(text(), "The password that you\'ve entered is incorrect")]',
      //@ts-ignore
      document,
      null,
      //@ts-ignore
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  });
}

async function isTryAnotherWay(page) {
  return await page.evaluate(() => {
    //@ts-ignore
    return !!document.evaluate(
      "//*[contains(text(), 'Try another way')]", //@ts-ignore
      document,
      null, //@ts-ignore
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
  });
}

module.exports = checkLoginStatus;
