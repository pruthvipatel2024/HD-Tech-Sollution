import { apiRequest } from "./api-client";

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // Calls the file uploader and returns the public secure URL
  const res = await apiRequest("/upload", {
    method: "POST",
    body: formData,
  });
  return res.secure_url;
}
