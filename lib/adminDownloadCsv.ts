import { adminFetchRaw } from "@/lib/adminFetch";

export async function adminDownloadCsv(path: string, fallbackFilename: string): Promise<void> {
  const res = await adminFetchRaw(path);
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  const match = cd?.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? fallbackFilename;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
