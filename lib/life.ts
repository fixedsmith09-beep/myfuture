import {
  CumulativePoint,
  EVENT_TYPES,
  LifeEvent,
  LifeSummary,
  ScoredLifeEvent,
} from "@/types/life";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const sortEvents = <T extends LifeEvent>(events: T[]) =>
  [...events].sort((a, b) => {
    if (a.age !== b.age) {
      return a.age - b.age;
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

export const buildCumulativePoints = (events: ScoredLifeEvent[]): CumulativePoint[] => {
  const sorted = sortEvents(events);
  let running = 0;

  return sorted.map((event) => {
    const eventScore = clamp(event.score, -5, 5);
    running += eventScore;

    return {
      age: event.age,
      label: `${event.age}세`,
      cumulativeScore: running,
      eventScore,
      type: event.type,
      title: event.title,
    };
  });
};

export const summarizeLife = (events: ScoredLifeEvent[]): LifeSummary => {
  const points = buildCumulativePoints(events);
  const totalRecords = events.length;
  const totalScore = points.at(-1)?.cumulativeScore ?? 0;
  const averageScore =
    totalRecords === 0
      ? 0
      : points.reduce((acc, point) => acc + point.eventScore, 0) / totalRecords;

  const typeCount = EVENT_TYPES.reduce(
    (acc, type) => ({ ...acc, [type]: 0 }),
    {} as Record<(typeof EVENT_TYPES)[number], number>,
  );

  events.forEach((event) => {
    typeCount[event.type] += 1;
  });

  const biggestRise = [...points].sort((a, b) => b.eventScore - a.eventScore)[0];
  const biggestDrop = [...points].sort((a, b) => a.eventScore - b.eventScore)[0];

  return {
    totalRecords,
    totalScore,
    averageScore: Number(averageScore.toFixed(2)),
    biggestRise,
    biggestDrop,
    typeCount,
  };
};
