import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getAccessToken,
  putAccessToken,
  _fetchWithAuth,
} from "./apiHelper";
import { DELCOM_BASEURL } from "@/lib/config";

describe("apiHelper", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("Token Storage", () => {
    it("should store and retrieve access token in localStorage", () => {
      expect(getAccessToken()).toBeNull();
      putAccessToken("token-123");
      expect(getAccessToken()).toBe("token-123");
      putAccessToken(null);
      expect(getAccessToken()).toBeNull();
    });

    it("should safely handle SSR environment without window", () => {
      const originalWindow = global.window;
      // @ts-expect-error simulating ssr
      delete global.window;

      expect(getAccessToken()).toBeNull();
      expect(() => putAccessToken("token-test")).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe("_fetchWithAuth", () => {
    it("should perform fetch with relative url and default JSON content type", async () => {
      const mockResponse = {
        success: true,
        message: "OK",
        data: { id: "1" },
      };

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      const result = await _fetchWithAuth<{ id: string }>("/posts");

      expect(fetchSpy).toHaveBeenCalledWith(
        `${DELCOM_BASEURL}/posts`,
        expect.objectContaining({
          headers: expect.any(Headers),
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: "1" });
    });

    it("should perform fetch with endpoint without leading slash and absolute http url", async () => {
      const mockResponse = {
        success: true,
        message: "OK",
        data: {},
      };

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as Response);

      await _fetchWithAuth("posts");
      expect(fetchSpy).toHaveBeenLastCalledWith(
        `${DELCOM_BASEURL}/posts`,
        expect.anything()
      );

      await _fetchWithAuth("https://custom-url.com/api/test");
      expect(fetchSpy).toHaveBeenLastCalledWith(
        "https://custom-url.com/api/test",
        expect.anything()
      );
    });

    it("should attach Authorization header when token exists", async () => {
      putAccessToken("my-secret-token");

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, message: "OK" }),
      } as Response);

      await _fetchWithAuth("/users/me");

      const calledHeaders = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(calledHeaders.get("Authorization")).toBe("Bearer my-secret-token");
    });

    it("should NOT override Content-Type when body is FormData", async () => {
      const formData = new FormData();
      formData.append("key", "value");

      const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      } as Response);

      await _fetchWithAuth("/upload", {
        method: "POST",
        body: formData,
      });

      const calledHeaders = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(calledHeaders.has("Content-Type")).toBe(false);
    });

    it("should fallback data when response does not have data property", async () => {
      const rawData = { custom: "field" };
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => rawData,
      } as Response);

      const result = await _fetchWithAuth("/custom");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(rawData);
    });

    it("should handle HTTP error status and extract message", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: "Bad Request details" }),
      } as Response);

      const result = await _fetchWithAuth("/error-endpoint");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Bad Request details");
    });

    it("should handle HTTP error status when response is not JSON", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      } as unknown as Response);

      const result = await _fetchWithAuth("/server-error");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Request failed with status 500");
    });

    it("should catch fetch network exception with Error instance", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce(
        new Error("Connection refused")
      );

      const result = await _fetchWithAuth("/offline");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Connection refused");
    });

    it("should catch fetch network exception with non-Error object", async () => {
      vi.spyOn(global, "fetch").mockRejectedValueOnce("Unknown crash");

      const result = await _fetchWithAuth("/crash");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Network error occurred");
    });
  });
});

