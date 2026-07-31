/**
 * Clean student name extracted from Google Auth or input.
 * Strips academic suffixes like "2024 CSE", "24ECE", "2023-2027 EEE", "2024 MECH", "B.TECH BIOTECH",
 * and leading register numbers like "9924004012 - ", leaving ONLY the student's actual name.
 */
export function cleanStudentName(rawName: string): string {
  if (!rawName) return "";

  let cleaned = rawName.trim();

  // 1. Remove leading register number prefixes (e.g., "9924004012 - JOHN DOE" or "24100342 JOHN DOE")
  cleaned = cleaned.replace(/^\d{6,12}\s*[-–:_]?\s*/i, "");

  // 2. Remove parenthesized/bracketed details anywhere at the end like "(2024 ECE)" or "[2024-2028 MECH]"
  cleaned = cleaned.replace(/\s*[\(\[\{].*?[\)\]\}]\s*$/i, "");

  // 3. Remove 2-digit or 4-digit years with attached dept codes like "24ECE", "23EEE", "24MECH", "24CIVIL", "24BIO"
  cleaned = cleaned.replace(/\s*[-–_]?\s*(?:20\d{2}|19\d{2}|\d{2})[A-Za-z]+.*$/i, "");

  // 4. Remove ANY year (4-digit like 2024, range like 2023-2027, or 2-digit like 24) and ALL text/words after it
  cleaned = cleaned.replace(/\s*[-–_]?\s*(?:20\d{2}|19\d{2}|\d{2})(?:[--–]\d{2,4})?\b.*$/i, "");

  // 5. Remove standalone trailing branch/dept words if no year was present (e.g., "KARTHIK ECE", "KARTHIK - B.TECH EEE")
  const deptList = [
    "CSE",
    "ECE",
    "EEE",
    "MECH",
    "MECHANICAL",
    "CIVIL",
    "BIO",
    "BIOTECH",
    "BIOMEDICAL",
    "IT",
    "AI",
    "AIDS",
    "AIML",
    "CSBS",
    "CS",
    "DS",
    "AERO",
    "AEROSPACE",
    "AUTO",
    "AUTOMOBILE",
    "CHEM",
    "CHEMICAL",
    "AGRI",
    "AGRICULTURE",
    "FOOD",
    "FPT",
    "BTECH",
    "B\\.TECH",
    "MTECH",
    "M\\.TECH",
    "BBA",
    "MBA",
    "BCA",
    "MCA",
    "BSC",
    "MSC",
    "BPHARM",
    "DPHARM",
  ].join("|");

  const deptRegex = new RegExp(`\\s*[-–_]?\\s*\\b(?:${deptList})\\b.*$`, "i");
  cleaned = cleaned.replace(deptRegex, "");

  // 6. Clean extra whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}
