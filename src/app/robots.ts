import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: ["/account/", "/checkout", "/operations/", "/orders/", "/repair/track/"] }, sitemap: siteUrl ? siteUrl + "/sitemap.xml" : undefined }; }
