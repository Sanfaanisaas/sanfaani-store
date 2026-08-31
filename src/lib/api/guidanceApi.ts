import { apiClient } from "./client";

export type GuidanceStatus = "ACTIVE" | "NO_MATCH" | "STALE" | "ARCHIVED";
export interface GuidanceRequest {
  budget: number | null;
  useCase: string;
  brands: string[];
  categories: string[];
  requiredFeatures: string[];
}
export interface GuidanceRecommendation {
  variantId: string;
  factors: string[];
  availability: string;
}
export interface GuidanceSession {
  id: string;
  budget: number | null;
  useCase: string | null;
  brands: string[];
  categories: string[];
  requiredFeatures: string[];
  status: GuidanceStatus;
  recommendations: GuidanceRecommendation[];
  updatedAt?: string;
}
export interface GuidanceCreation {
  session: GuidanceSession;
  resumeToken: string;
  expiresAt: string;
}
const statuses: readonly string[] = ["ACTIVE", "NO_MATCH", "STALE", "ARCHIVED"];
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Unexpected API response");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}
function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
function date(value: unknown): string | undefined {
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
    ? value
    : undefined;
}
function identifier(value: unknown): string {
  const result = text(value);
  if (!result) throw new Error("Guidance reference is missing");
  return result;
}
export function normalizeGuidanceSession(value: unknown): GuidanceSession {
  const item = record(value);
  const status = text(item.status);
  if (!statuses.includes(status))
    throw new Error("Guidance status is unavailable");
  return {
    id: identifier(item.id ?? item._id),
    budget:
      Number.isSafeInteger(item.budget) && (item.budget as number) >= 0
        ? (item.budget as number)
        : null,
    useCase: text(item.useCase) || null,
    brands: strings(item.brands),
    categories: strings(item.categories),
    requiredFeatures: strings(item.requiredFeatures),
    status: status as GuidanceStatus,
    recommendations: Array.isArray(item.recommendations)
      ? item.recommendations.flatMap((entry) => {
          const recommendation = record(entry);
          const variantId = text(
            recommendation.variant ?? recommendation.variantId,
          );
          return variantId
            ? [
                {
                  variantId,
                  factors: strings(recommendation.factors),
                  availability: text(recommendation.availability),
                },
              ]
            : [];
        })
      : [],
    updatedAt: date(item.updatedAt),
  };
}
export async function createGuidance(
  request: GuidanceRequest,
): Promise<GuidanceCreation> {
  const result = record(
    await apiClient.post<unknown>("/guidance", { body: request }),
  );
  return {
    session: normalizeGuidanceSession(result.session),
    resumeToken: identifier(result.resumeToken),
    expiresAt: identifier(result.expiresAt),
  };
}
export async function resumeGuidance(id: string, token?: string) {
  const headers = token ? { "X-Guidance-Resume-Token": token } : undefined;
  return normalizeGuidanceSession(
    await apiClient.get<unknown>(
      "/guidance/" + encodeURIComponent(id),
      headers ? { headers } : undefined,
    ),
  );
}
