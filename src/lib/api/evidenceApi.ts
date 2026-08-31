import { apiClient } from "./client";

const supportedMimeTypes = new Set(["image/jpeg", "image/png", "application/pdf"]);
export const MAX_EVIDENCE_FILE_BYTES = 5 * 1024 * 1024;
export function evidenceValidationMessage(file: File) {
  if (!supportedMimeTypes.has(file.type)) return "Choose a JPEG, PNG, or PDF file.";
  if (file.size < 1 || file.size > MAX_EVIDENCE_FILE_BYTES) return "Choose one file no larger than 5 MiB.";
  return null;
}
export async function uploadEvidenceFile({ file, subjectType, subjectId, purpose }: { file: File; subjectType: "repair" | "return_request"; subjectId: string; purpose: "repair_intake" | "return"; }) {
  const form = new FormData();
  form.set("file", file);
  form.set("subjectType", subjectType);
  form.set("subjectId", subjectId);
  form.set("purpose", purpose);
  return apiClient.post<unknown>("/evidence", { body: form });
}
