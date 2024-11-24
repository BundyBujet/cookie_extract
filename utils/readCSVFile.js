const fs = require("fs").promises;

/**
 * Read file for emails and parse user credentials.
 * @param {string} filename - Path to the file containing email and password entries.
 * @returns {Promise<Array<{ email: string, password: string }>>}
 */
const readFileForEmails = async (filename) => {
  try {
    const data = await fs.readFile(filename, "utf-8");
    const users = data.trim();

    if (users.length === 0) {
      console.log(
        "Provide a file named emails.txt that contains a valid email and password per line."
      );
      return [];
    }

    const userEntries = users.split("\n").map((line) => {
      const [email, password] = line.trim().split(":");
      return { email, password };
    });

    return userEntries;
  } catch (err) {
    console.log(
      `\n%cFile not found. Make sure to provide a file named %cemails.txt %cthat contains a valid email and password per line.`,
      `color: ${Colors.red}`,
      `color: ${Colors.yellow}`,
      `color: ${Colors.red}`
    );
    return [];
  }
};

module.exports = readFileForEmails;
