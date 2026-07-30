import * as XLSX from "xlsx";
import { Registration, AttendanceRecord } from "@/types";

export function exportToExcel(registrations: Registration[], filename = "CSI_KARE_ML_Pipeline_Registrations.xlsx") {
  const data = registrations.map((r, index) => ({
    "S.No": index + 1,
    "Full Name": r.name,
    "Register Number": r.registerNumber,
    "UPI / UTR Transaction ID": r.transactionId || "N/A",
    "Email Address": r.email,
    "Phone Number": r.phone,
    Department: r.department,
    Year: r.year,
    "Payment Status": r.paymentStatus,
    "Registration Status": r.registrationStatus,
    "Rejection Reason": r.rejectionReason || "N/A",
    "Cloudinary Public ID": r.cloudinaryPublicId,
    "Payment Screenshot URL": r.paymentScreenshot,
    "Registration Time": new Date(r.createdAt).toLocaleString("en-IN"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

  const max_widths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length + 3, 18),
  }));
  worksheet["!cols"] = max_widths;

  XLSX.writeFile(workbook, filename);
}

export function exportToCSV(registrations: Registration[], filename = "CSI_KARE_ML_Pipeline_Registrations.csv") {
  const headers = [
    "S.No",
    "Full Name",
    "Register Number",
    "UPI Transaction ID",
    "Email Address",
    "Phone Number",
    "Department",
    "Year",
    "Payment Status",
    "Registration Status",
    "Rejection Reason",
    "Cloudinary Public ID",
    "Payment Screenshot URL",
    "Registration Time",
  ];

  const rows = registrations.map((r, index) => [
    index + 1,
    `"${r.name.replace(/"/g, '""')}"`,
    `"${r.registerNumber}"`,
    `"${r.transactionId || ""}"`,
    `"${r.email}"`,
    `"${r.phone}"`,
    `"${r.department}"`,
    `"${r.year}"`,
    `"${r.paymentStatus}"`,
    `"${r.registrationStatus}"`,
    `"${(r.rejectionReason || "").replace(/"/g, '""')}"`,
    `"${r.cloudinaryPublicId}"`,
    `"${r.paymentScreenshot}"`,
    `"${new Date(r.createdAt).toLocaleString("en-IN")}"`,
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAttendanceToExcel(
  sessionName: string,
  registrations: Registration[],
  sessionRecords: AttendanceRecord[],
  filename?: string
) {
  const cleanSessionName = sessionName.replace(/[^a-zA-Z0-9]/g, "_");
  const defaultFilename = filename || `CSI_Attendance_${cleanSessionName}.xlsx`;

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
      "Email Address": r.email,
      "Phone Number": r.phone,
      "Attendance Status": isPresent ? "PRESENT" : "ABSENT",
      "Scanned Time": isPresent && rec ? new Date(rec.scannedAt).toLocaleTimeString("en-IN") : "N/A",
      "Session Title": sessionName,
      "Payment Status": r.paymentStatus,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Session Attendance");

  const max_widths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length + 3, 16),
  }));
  worksheet["!cols"] = max_widths;

  XLSX.writeFile(workbook, defaultFilename);
}
