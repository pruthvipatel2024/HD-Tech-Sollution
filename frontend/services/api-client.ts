const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${BASE_URL}${endpoint}`;
  
  // Allow browser to pass HTTP-Only credentials cookies
  options.credentials = "include";
  
  // Set headers
  const headers = new Headers(options.headers || {});
  
  // Do not set Content-Type header if sending FormData (Multipart)
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  options.headers = headers;

  let response = await fetch(url, options);

  // Auto-refresh token sequence if Access Token expired (401)
  if (
    response.status === 401 &&
    !endpoint.includes("/auth/login") &&
    !endpoint.includes("/auth/refresh")
  ) {
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        try {
          const refreshData = await refreshRes.json();
          if (refreshData.token && typeof document !== "undefined") {
            document.cookie = `token=${refreshData.token}; path=/; max-age=${15 * 60}; SameSite=Lax; Secure`;
          }
        } catch (err) {
          console.error("[Session Client] Failed to parse refreshed token payload:", err);
        }
        // Retry the original query
        response = await fetch(url, options);
      } else {
        // Refresh token failed or expired, redirect admin back to sign-in page
        if (
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/admin/dashboard")
        ) {
          window.location.href = "/admin/login";
        }
      }
    } catch (err) {
      console.error("[Session Client] Automatic token refresh check failed:", err);
    }
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}
