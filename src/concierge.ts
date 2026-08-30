import { searchExperiences } from "./catalog.js";
import type { ConciergeInput, ConciergeResult, Experience } from "./types.js";

const DEFAULT_BASE_URL = "http://127.0.0.1:3000";

export function publicBaseUrl(explicitBaseUrl?: string): string {
  const candidate = explicitBaseUrl ?? process.env.PUBLIC_BASE_URL ?? DEFAULT_BASE_URL;
  try {
    const url = new URL(candidate);
    return url.origin;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

export function experienceSourceUrl(experience: Experience, baseUrl?: string): string {
  return new URL(`/experiences/${encodeURIComponent(experience.slug)}`, publicBaseUrl(baseUrl))
    .href;
}

export function answerConcierge(input: ConciergeInput, baseUrl?: string): ConciergeResult {
  const matches = searchExperiences({
    query: input.query,
    ...(input.area ? { area: input.area } : {}),
    ...(input.category ? { category: input.category } : {}),
    ...(input.language ? { language: input.language } : {}),
    limit: input.limit ?? 3,
  }).map((experience) => ({
    experience,
    sourceUrl: experienceSourceUrl(experience, baseUrl),
  }));

  const sources = matches.map(({ experience, sourceUrl }, index) => ({
    index: index + 1,
    experienceId: experience.id,
    title: experience.name,
    url: sourceUrl,
  }));

  const answer =
    matches.length === 0
      ? "No matching demo experience was found in the synthetic Pirin catalogue. This is a request-only demonstrator; try a broader activity, area, or language."
      : `The synthetic catalogue contains ${matches.length} relevant option${matches.length === 1 ? "" : "s"}: ${matches
          .map(
            ({ experience }, index) =>
              `${experience.name} in ${experience.settlement} [${index + 1}]`,
          )
          .join(
            "; ",
          )}. This is a request-only demonstration: availability and prices are indicative, and the host must confirm every request.`;

  return {
    answer,
    matches,
    sources,
    groundedInCatalog: true,
    synthetic: true,
  };
}

export const concierge = answerConcierge;
