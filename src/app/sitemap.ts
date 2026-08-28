import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { guides } from "@/content/guides";
export default function sitemap(): MetadataRoute.Sitemap { if (!siteUrl) return []; const paths = ["/", "/shop", "/guides", "/policies/terms", "/policies/privacy", "/policies/cookies", "/policies/returns", "/policies/warranty", "/policies/delivery-pickup", "/policies/repair-custody", "/policies/device-data"]; return [...paths.map((path) => ({ url: siteUrl + path, lastModified: new Date(), changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.6 })), ...guides.map((guide) => ({ url: siteUrl + "/guides/" + guide.slug, lastModified: guide.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 }))]; }
