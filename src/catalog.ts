import { readFileSync } from "node:fs";
import type { Experience, ExperienceSearchOptions } from "./types.js";

const DATA_FILE_URL = new URL("../data/demo/experiences.json", import.meta.url);
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isExperience(value: unknown): value is Experience {
  if (!isRecord(value) || !isRecord(value.host) || !isRecord(value.availability)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.slug === "string" &&
    typeof value.name === "string" &&
    typeof value.description === "string" &&
    typeof value.category === "string" &&
    typeof value.settlement === "string" &&
    Array.isArray(value.languages) &&
    value.languages.every((language) => typeof language === "string") &&
    typeof value.durationMinutes === "number" &&
    value.host.synthetic === true &&
    value.availability.mode === "by_request" &&
    value.synthetic === true &&
    value.bookingMode === "request_only" &&
    value.confirmationMode === "host_required" &&
    value.paymentMode === "off_platform_direct_to_host"
  );
}

export function loadExperiences(fileUrl: URL = DATA_FILE_URL): readonly Experience[] {
  const parsed: unknown = JSON.parse(readFileSync(fileUrl, "utf8"));
  if (!Array.isArray(parsed) || !parsed.every(isExperience)) {
    throw new Error(`Invalid synthetic experience catalogue: ${fileUrl.href}`);
  }

  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const experience of parsed) {
    if (ids.has(experience.id) || slugs.has(experience.slug)) {
      throw new Error(`Duplicate experience id or slug: ${experience.id}`);
    }
    ids.add(experience.id);
    slugs.add(experience.slug);
  }

  return Object.freeze(parsed.map((experience) => Object.freeze(experience)));
}

export const experiences: readonly Experience[] = loadExperiences();

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("en")
    .trim();
}

function includesNormalized(value: string, expected: string): boolean {
  return normalize(value).includes(normalize(expected));
}

function clampLimit(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_LIMIT;
  }
  return Math.min(MAX_LIMIT, Math.max(1, Math.trunc(limit)));
}

function scoreExperience(experience: Experience, tokens: readonly string[]): number {
  if (tokens.length === 0) {
    return 1;
  }

  const weightedFields: ReadonlyArray<readonly [string, number]> = [
    [experience.name, 8],
    [experience.category, 6],
    [experience.settlement, 6],
    [experience.description, 3],
    [experience.languages.join(" "), 2],
  ];

  return tokens.reduce((total, token) => {
    const tokenScore = weightedFields.reduce(
      (best, [value, weight]) => (normalize(value).includes(token) ? Math.max(best, weight) : best),
      0,
    );
    return total + tokenScore;
  }, 0);
}

export function searchExperiences(
  queryOrOptions: string | ExperienceSearchOptions = {},
): Experience[] {
  const options = typeof queryOrOptions === "string" ? { query: queryOrOptions } : queryOrOptions;
  const query = normalize(options.query ?? "");
  const tokens = query.split(/\s+/u).filter(Boolean);

  return experiences
    .filter((experience) => {
      if (options.area && !includesNormalized(experience.settlement, options.area)) {
        return false;
      }
      if (options.category && !includesNormalized(experience.category, options.category)) {
        return false;
      }
      if (
        options.language &&
        !experience.languages.some((language) =>
          includesNormalized(language, options.language ?? ""),
        )
      ) {
        return false;
      }
      return scoreExperience(experience, tokens) > 0;
    })
    .map((experience, catalogIndex) => ({
      experience,
      catalogIndex,
      score: scoreExperience(experience, tokens),
    }))
    .sort((left, right) => right.score - left.score || left.catalogIndex - right.catalogIndex)
    .slice(0, clampLimit(options.limit))
    .map(({ experience }) => experience);
}

export function getExperience(idOrSlug: string): Experience | undefined {
  const needle = normalize(idOrSlug);
  return experiences.find(
    (experience) => normalize(experience.id) === needle || normalize(experience.slug) === needle,
  );
}

export function listByArea(area: string): Experience[] {
  if (!area.trim()) {
    return [];
  }
  return experiences.filter((experience) => includesNormalized(experience.settlement, area));
}

export function listAreas(): string[] {
  return [...new Set(experiences.map((experience) => experience.settlement))].sort((a, b) =>
    a.localeCompare(b, "en"),
  );
}
