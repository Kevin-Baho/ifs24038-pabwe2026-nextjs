import Swal from "sweetalert2";

export function showSuccessDialog(
  message: string,
  title: string = "Berhasil"
): Promise<unknown> {
  return Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: "#2563eb",
  });
}

export function showErrorDialog(
  message: string,
  title: string = "Gagal"
): Promise<unknown> {
  return Swal.fire({
    icon: "error",
    title,
    text: message,
    confirmButtonColor: "#ef4444",
  });
}

export async function showConfirmDialog(
  message: string,
  title: string = "Apakah Anda Yakin?"
): Promise<boolean> {
  const result = await Swal.fire({
    icon: "warning",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal",
  });

  return Boolean(result.isConfirmed);
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) {
    return "-";
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "-";
  }
}

