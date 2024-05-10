import cheerio from "cheerio";
import urlModule from "url";

const getHtmlContent = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`
      );
    }
    return await response.text();
  } catch (error) {
    console.error("Error fetching HTML:", error);
    return null;
  }
};

const extractLinks = (html, baseUrl, urlDomain) => {
  const $ = cheerio.load(html);
  const links = [];
  $("a").each((idx, element) => {
    const link = $(element).attr("href");

    if (link) {
      const absoluteUrl = urlModule.resolve(baseUrl, link);
      if (absoluteUrl.includes(urlDomain)) {
        links.push(absoluteUrl);
      } else {
        console.log("Link out of scope", link);
      }
    }
  });

  return links;
};

const crawlPage = async (
  url,
  urlDomain,
  visitedUrls,
  maxDepth,
  currentDepth = 0
) => {
  if (currentDepth > maxDepth) {
    return [];
  }

  if (visitedUrls.has(url)) {
    return [];
  }

  console.log(`Crawling ${url} (Depth: ${currentDepth})`);
  visitedUrls.add(url);

  const html = await getHtmlContent(url);
  if (!html) {
    return [];
  }

  const links = extractLinks(html, url, urlDomain);

  const childLinks = [];
  for (const link of links) {
    const childLinksFromPage = await crawlPage(
      link,
      urlDomain,
      visitedUrls,
      maxDepth,
      currentDepth + 1
    );
    childLinks.push(...childLinksFromPage);
  }

  return [...new Set([...links, ...childLinks])];
};

export const crawlWebsite = async (indexUrl, maxDepth, urlDomain) => {
  const visitedUrls = new Set();
  const links = await crawlPage(indexUrl, urlDomain, visitedUrls, maxDepth);
  console.log("Total links retrived", links.length);
  return links;
};
