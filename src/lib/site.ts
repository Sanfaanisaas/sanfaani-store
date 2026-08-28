export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || null;
export const siteMetadataBase = new URL(siteUrl ?? "http://localhost:3000");
