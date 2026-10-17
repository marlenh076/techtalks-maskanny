import type { University } from "../models/university.model";

const connectingWords = new Set([
  "of",
  "the",
  "and",
  "in",
  "at",
  "for",
  "de",
  "du",
  "des",
  "la",
  "le",
  "et",
]);

// Presentation overrides for existing API records; names and locations stay API-driven.
const universityAbbreviations = new Map<string, string>([
  ["10185358-0635-49ed-875d-73f75a414d59", "AUB"], // American University of Beirut
  ["bd1e2058-df7b-40a6-875f-f7856124f8f8", "LAU"], // Lebanese American University
  ["6595f911-5d95-4f52-9bfd-7e7cbf8ac372", "USJ"], // Saint Joseph University
  ["9d930357-63a7-4eb1-93a0-0fa4e3e425ca", "BAU"], // Beirut Arab University
  ["132f00d4-f744-4a43-bfa4-753b706d8987", "LU"], // Lebanese University
  ["9a392d21-c5a8-4f32-bfec-38bb81d0d26a", "USEK"], // Holy Spirit University of Kaslik
  ["0b50e907-ce03-4729-9820-fc4ee7b7a407", "NDU"], // Notre Dame University
  ["5afb911c-086b-4cf9-84bd-b715a9e8e2d9", "UOB"], // University of Balamand
  ["dd645f39-24c7-4b36-9c18-6547e5e19108", "AUST"], // American University of Science and Technology
]);

export function universityMonogram({
  university_id,
  name,
}: Pick<University, "university_id" | "name">): string {
  const abbreviation = universityAbbreviations.get(university_id);
  if (abbreviation) return abbreviation;
  const words = (name.match(/[\p{L}\p{N}]+/gu) ?? []).filter(
    (word) => !connectingWords.has(word.toLowerCase()),
  );
  if (words.length === 1) return Array.from(words[0]).slice(0, 2).join("").toUpperCase();
  return (
    words
      .slice(0, 4)
      .map((word) => Array.from(word)[0])
      .join("")
      .toUpperCase() || "U"
  );
}

export function filterUniversities(universities: University[], query: string): University[] {
  const term = query.trim().toLowerCase();
  return term
    ? universities.filter((university) =>
        `${university.name} ${university.city}`.toLowerCase().includes(term),
      )
    : universities;
}
