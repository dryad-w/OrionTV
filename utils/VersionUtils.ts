const normalizeVersionPart = (part: string): string | number => {
  const numericPart = Number(part);
  return Number.isNaN(numericPart) ? part.toLowerCase() : numericPart;
};

export function compareVersions(version1: string, version2: string): number {
  const parts1 = version1
    .trim()
    .replace(/^v(?=\d)/i, '')
    .split('.')
    .map(normalizeVersionPart);
  const parts2 = version2
    .trim()
    .replace(/^v(?=\d)/i, '')
    .split('.')
    .map(normalizeVersionPart);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] ?? 0;
    const part2 = parts2[i] ?? 0;

    if (part1 === part2) {
      continue;
    }

    return part1 > part2 ? 1 : -1;
  }

  return 0;
}
