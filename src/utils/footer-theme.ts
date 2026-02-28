const FOOTER_SECTION_BACKGROUNDS = [
  ["/news", "#7ef056"],
  ["/events", "#fae43f"],
  ["/projects", "#61e3ff"],
] as const;

function normalizePathname(pathname: string): string {
  const trimmedPathname = pathname.replace(/\/+$/, "");
  return trimmedPathname || "/";
}

export function resolveFooterBackgroundColor(pathname: string): string | null {
  const normalizedPathname = normalizePathname(pathname);

  for (const [sectionPath, backgroundColor] of FOOTER_SECTION_BACKGROUNDS) {
    if (
      normalizedPathname === sectionPath ||
      normalizedPathname.startsWith(`${sectionPath}/`)
    ) {
      return backgroundColor;
    }
  }

  return null;
}
