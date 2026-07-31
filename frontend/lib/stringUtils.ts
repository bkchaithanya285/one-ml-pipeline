/**
 * Clean student name extracted from Google Auth or input.
 * Strips academic suffixes like "2024 CSE", "24CSE", "2023-2027 CSE", "B.TECH CSE",
 * and leading register numbers like "9924004012 - ", leaving ONLY the student's actual name.
 */
export function cleanStudentName(rawName: string): string {
  if (!rawName) return "";

  let cleaned = rawName.trim();

  // 1. Remove leading register number prefixes (e.g., "9924004012 - JOHN DOE" or "24100342 JOHN DOE")
  cleaned = cleaned.replace(/^\d{6,12}\s*[-–:_]?\s*/i, "");

  // 2. Remove parenthesized/bracketed details at the end like "(2024 CSE)" or "[2024-2028 CSE]"
  cleaned = cleaned.replace(/\s*[\(\[\{].*?[\)\]\}]\s*$/i, "");

  // 3. Remove trailing year & department patterns like "2024 CSE", "2024 - CSE", "24CSE", "2024-2028 B.TECH CSE"
  cleaned = cleaned.replace(
    /\s*[-–_]?\s*(?:20\d{2}|\d{2})(?:[--–]\d{2,4})?\s*[-–_]?\s*(?:B\.?TECH|BCA|MCA|BSC|MSC|MBA|CSE|ECE|EEE|MECH|CIVIL|IT|AI|AIDS|AIML|CSBS|CS|DS|\s)*$/i,
    ""
  );

  // 4. Remove any trailing 4-digit years (e.g., "RAMESH 2024")
  cleaned = cleaned.replace(/\s+20\d{2}\s*$/i, "");

  // 5. Remove any trailing department codes (e.g., "RAMESH CSE" or "RAMESH - CSE")
  cleaned = cleaned.replace(
    /\s+[-–_]?\s*(?:CSE|ECE|EEE|MECH|CIVIL|IT|AI|AIDS|AIML|CSBS|B\.?TECH)\s*$/i,
    ""
  );

  // 6. Clean extra whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}
