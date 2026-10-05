import { DELCOM_BASEURL } from "@/lib/config";
import { ApiResult } from "@/types";

const TOKEN_KEY = "DELCOM_ACCESS_TOKEN";

export function getAccessToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function putAccessToken(token: string | null): void {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
}

export async function _fetchWithAuth<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${DELCOM_BASEURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const token = getAccessToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const responseJson = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message:
          responseJson.message ||
          `Request failed with status ${response.status}`,
        data: responseJson.data,
      };
    }

    return {
      success: responseJson.success ?? true,
      message: responseJson.message || "Success",
      data: responseJson.data ?? (responseJson as unknown as T),
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Network error occurred";
    return {
      success: false,
      message: errorMessage,
    };
  }
}

