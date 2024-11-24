async function getBusinessToken(cookies) {
  try {
    // Make the request to Facebook's business locations endpoint
    const response = await fetch(
      "https://business.facebook.com/business_locations",
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "accept-language": "en-US,en;q=0.7",
          priority: "u=0, i",
          "sec-ch-ua":
            '"Brave";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "none",
          "sec-fetch-user": "?1",
          "sec-gpc": "1",
          "upgrade-insecure-requests": "1",
          cookie: cookies,
        },
        body: null,
        method: "GET",
      }
    );

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const responseText = await response.text();
    // console.log(responseText);
    // Extract the token using a regular expression
    const tokenMatch = responseText.match(/(EAAG\w+)/);
    return tokenMatch ? tokenMatch[1] : null;
  } catch (error) {
    console.error("Error fetching business token:", error);
    return null;
  }
}

module.exports = getBusinessToken;
