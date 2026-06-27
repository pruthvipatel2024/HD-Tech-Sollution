import { apiRequest } from "./api-client";

export async function submitInquiry(data: {
  customerName: string;
  mobileNumber: string;
  email?: string;
  serviceId: string;
  message: string;
  attachments?: { url: string; name: string }[];
}) {
  const res = await apiRequest("/inquiries", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getInquiries() {
  const res = await apiRequest("/inquiries");
  return res.data;
}

export async function updateInquiryStatus(id: string, status: string) {
  const res = await apiRequest(`/inquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return res.data;
}

export async function addInquiryNote(id: string, text: string) {
  const res = await apiRequest(`/inquiries/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
  return res.data;
}

export async function deleteInquiry(id: string) {
  const res = await apiRequest(`/inquiries/${id}`, { method: "DELETE" });
  return res.data;
}
