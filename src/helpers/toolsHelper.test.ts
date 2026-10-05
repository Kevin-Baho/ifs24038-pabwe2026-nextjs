import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import {
  showSuccessDialog,
  showErrorDialog,
  showConfirmDialog,
  formatDate,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
  },
}));

describe("toolsHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("showSuccessDialog", () => {
    it("should call Swal.fire with success icon and default title", async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true } as any);
      await showSuccessDialog("Operasi berhasil");

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "success",
          title: "Berhasil",
          text: "Operasi berhasil",
        })
      );
    });

    it("should call Swal.fire with custom title", async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true } as any);
      await showSuccessDialog("Operasi berhasil", "Hebat!");

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "success",
          title: "Hebat!",
          text: "Operasi berhasil",
        })
      );
    });
  });

  describe("showErrorDialog", () => {
    it("should call Swal.fire with error icon and default title", async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true } as any);
      await showErrorDialog("Terjadi kesalahan");

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Gagal",
          text: "Terjadi kesalahan",
        })
      );
    });

    it("should call Swal.fire with custom title", async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true } as any);
      await showErrorDialog("Terjadi kesalahan", "Peringatan");

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "error",
          title: "Peringatan",
          text: "Terjadi kesalahan",
        })
      );
    });
  });

  describe("showConfirmDialog", () => {
    it("should return true when user confirms", async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: true } as any);
      const result = await showConfirmDialog("Hapus data?");
      expect(result).toBe(true);
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: "warning",
          showCancelButton: true,
          text: "Hapus data?",
        })
      );
    });

    it("should return false when user cancels", async () => {
      vi.mocked(Swal.fire).mockResolvedValueOnce({ isConfirmed: false } as any);
      const result = await showConfirmDialog("Hapus data?", "Konfirmasi Hapus");
      expect(result).toBe(false);
    });
  });

  describe("formatDate", () => {
    it("should return '-' when input is null, undefined, or empty", () => {
      expect(formatDate(null)).toBe("-");
      expect(formatDate(undefined)).toBe("-");
      expect(formatDate("")).toBe("-");
    });

    it("should return '-' for invalid date strings", () => {
      expect(formatDate("invalid-date-format")).toBe("-");
    });

    it("should format valid ISO date into Indonesian locale", () => {
      const formatted = formatDate("2026-10-04T12:00:00.000Z");
      expect(formatted).not.toBe("-");
      expect(typeof formatted).toBe("string");
      expect(formatted).toContain("2026");
    });

    it("should return '-' when DateTimeFormat throws an error", () => {
      const spy = vi.spyOn(Intl, "DateTimeFormat").mockImplementation(function () {
        throw new Error("Formatting failed");
      } as any);

      expect(formatDate("2026-10-04T12:00:00.000Z")).toBe("-");
      spy.mockRestore();
    });
  });
});

