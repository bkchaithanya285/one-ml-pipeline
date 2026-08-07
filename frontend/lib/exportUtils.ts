import * as XLSX from "xlsx";
import { Registration, AttendanceRecord } from "@/types";

function getXLSXModule() {
  if (XLSX && XLSX.utils && typeof XLSX.utils.json_to_sheet === "function") {
    return XLSX;
  }
  if (
    (XLSX as any).default &&
    (XLSX as any).default.utils &&
    typeof (XLSX as any).default.utils.json_to_sheet === "function"
  ) {
    return (XLSX as any).default;
  }
  return XLSX;
}

function downloadBlob(blob: Blob, filename: string) {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
}

export function exportToExcel(
  registrations: Registration[],
  filename = "CSI_KARE_ML_Pipeline_Registrations.xlsx"
) {
  if (!registrations || registrations.length === 0) {
    alert("No registration records available to export.");
    return;
  }

  try {
    const xlsxLib = getXLSXModule();

    const data = registrations.map((r, index) => ({
      "S.No": index + 1,
      "Full Name": r.name || "N/A",
      "Register Number": r.registerNumber || "N/A",
      "UPI / UTR Transaction ID": r.transactionId || "N/A",
      "Email Address": r.email || "N/A",
      "Phone Number": r.phone || "N/A",
      Department: r.department || "N/A",
      Year: r.year || "N/A",
      Section: r.section || "N/A",
      "Residency Status": r.residency || "N/A",
      "Payment Status": r.paymentStatus || "Pending",
      "Registration Status": r.registrationStatus || "Registered",
      "Rejection Reason": r.rejectionReason || "N/A",
      "Cloudinary Public ID": r.cloudinaryPublicId || "N/A",
      "Payment Screenshot URL": r.paymentScreenshot || "N/A",
      "Registration Time": r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : "N/A",
    }));

    if (xlsxLib && xlsxLib.utils && typeof xlsxLib.utils.json_to_sheet === "function") {
      const worksheet = xlsxLib.utils.json_to_sheet(data);
      const workbook = xlsxLib.utils.book_new();
      xlsxLib.utils.book_append_sheet(workbook, worksheet, "Registrations");

      const max_widths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length + 3, 18),
      }));
      worksheet["!cols"] = max_widths;

      try {
        if (typeof xlsxLib.writeFile === "function") {
          xlsxLib.writeFile(workbook, filename);
          return;
        }
      } catch (err) {
        console.warn("XLSX.writeFile fallback to Blob:", err);
      }

      const excelBuffer = xlsxLib.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadBlob(blob, filename);
      return;
    }
  } catch (err) {
    console.error("Error generating Excel with SheetJS, using CSV fallback:", err);
  }

  // Guaranteed Fallback if SheetJS fails
  exportToCSV(registrations, filename.endsWith(".xlsx") ? filename.replace(/\.xlsx$/, ".csv") : filename);
}

export function exportToCSV(
  registrations: Registration[],
  filename = "CSI_KARE_ML_Pipeline_Registrations.csv"
) {
  if (!registrations || registrations.length === 0) {
    alert("No registration records available to export.");
    return;
  }

  try {
    const headers = [
      "S.No",
      "Full Name",
      "Register Number",
      "UPI Transaction ID",
      "Email Address",
      "Phone Number",
      "Department",
      "Year",
      "Section",
      "Residency Status",
      "Payment Status",
      "Registration Status",
      "Rejection Reason",
      "Cloudinary Public ID",
      "Payment Screenshot URL",
      "Registration Time",
    ];

    const rows = registrations.map((r, index) => [
      index + 1,
      `"${(r.name || "").replace(/"/g, '""')}"`,
      `"${r.registerNumber || ""}"`,
      `"${r.transactionId || ""}"`,
      `"${r.email || ""}"`,
      `"${r.phone || ""}"`,
      `"${r.department || ""}"`,
      `"${r.year || ""}"`,
      `"${r.section || ""}"`,
      `"${r.residency || ""}"`,
      `"${r.paymentStatus || ""}"`,
      `"${r.registrationStatus || ""}"`,
      `"${(r.rejectionReason || "").replace(/"/g, '""')}"`,
      `"${r.cloudinaryPublicId || ""}"`,
      `"${r.paymentScreenshot || ""}"`,
      `"${r.createdAt ? new Date(r.createdAt).toLocaleString("en-IN") : "N/A"}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    downloadBlob(blob, filename);
  } catch (err) {
    console.error("CSV Export error:", err);
    alert("Failed to export CSV file.");
  }
}

export function exportAttendanceToExcel(
  sessionName: string,
  registrations: Registration[],
  sessionRecords: AttendanceRecord[],
  filename?: string
) {
  const cleanSessionName = sessionName.replace(/[^a-zA-Z0-9]/g, "_");
  const defaultFilename = filename || `CSI_Attendance_${cleanSessionName}.xlsx`;

  try {
    const xlsxLib = getXLSXModule();

    const recordMap = new Map<string, AttendanceRecord>();
    sessionRecords.forEach((rec) => {
      if (rec.registerNumber) recordMap.set(rec.registerNumber.toLowerCase().trim(), rec);
      if (rec.regId) recordMap.set(rec.regId.toLowerCase().trim(), rec);
    });

    const data = registrations.map((r, index) => {
      const rec =
        recordMap.get(r.registerNumber.toLowerCase().trim()) ||
        recordMap.get(r.id.toLowerCase().trim());
      const isPresent = rec !== undefined;

      return {
        "S.No": index + 1,
        "Full Name": r.name,
        "Register Number": r.registerNumber,
        Department: r.department,
        Year: r.year,
        Section: r.section || "N/A",
        "Residency Status": r.residency || "N/A",
        "Email Address": r.email,
        "Phone Number": r.phone,
        "Attendance Status": isPresent ? "PRESENT" : "ABSENT",
        "Scanned Time": isPresent && rec ? new Date(rec.scannedAt).toLocaleTimeString("en-IN") : "N/A",
        "Session Title": sessionName,
        "Payment Status": r.paymentStatus,
      };
    });

    if (xlsxLib && xlsxLib.utils && typeof xlsxLib.utils.json_to_sheet === "function") {
      const worksheet = xlsxLib.utils.json_to_sheet(data);
      const workbook = xlsxLib.utils.book_new();
      xlsxLib.utils.book_append_sheet(workbook, worksheet, "Session Attendance");

      const max_widths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length + 3, 16),
      }));
      worksheet["!cols"] = max_widths;

      try {
        if (typeof xlsxLib.writeFile === "function") {
          xlsxLib.writeFile(workbook, defaultFilename);
          return;
        }
      } catch (err) {
        console.warn("XLSX.writeFile fallback to Blob:", err);
      }

      const excelBuffer = xlsxLib.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      downloadBlob(blob, defaultFilename);
    }
  } catch (err) {
    console.error("Attendance Excel Export error:", err);
  }
}


