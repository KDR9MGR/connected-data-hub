/** Public address of the live site — used for absolute URLs (share images, sitemap). */
export const SITE_URL = "https://www.swastha.org.in";

export const absoluteUrl = (path: string) =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
