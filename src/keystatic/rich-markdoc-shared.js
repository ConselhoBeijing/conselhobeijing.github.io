export const DEFAULT_TEXT_COLOR = "#7ef056";

export const RICH_IMAGE_WIDTH_PRESET_MAP = {
  small: 33,
  medium: 50,
  large: 66,
  full: 100,
};

const HEX_COLOR_PATTERN = /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i;
const TAG_ATTRIBUTE_PATTERN = /([a-zA-Z0-9_-]+)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([^\s"=]+))/g;
const TEXT_COLOR_TAG_PATTERN = /\{%\s*textColor\b([\s\S]*?)%\}([\s\S]*?)\{%\s*\/textColor\s*%\}/g;
const RICH_IMAGE_TAG_PATTERN = /\{%\s*richImage\b([\s\S]*?)\/%\}/g;
const TEXT_COLOR_HTML_PATTERN = /<span class="rich-text-color" style="color:\s*([^";]+);?">([\s\S]*?)<\/span>/g;
const RICH_IMAGE_HTML_PATTERN =
  /<figure class="rich-image-wrapper rich-image-wrapper--align-(left|center|right)" style="max-width:\s*(\d+)%;\s*width:\s*100%;"><img class="rich-image-figure" src="([^"]*)" alt="([^"]*)" \/>(?:<figcaption class="rich-image-caption">([\s\S]*?)<\/figcaption>)?<\/figure>/g;

export function normalizeHexColor(value) {
  if (typeof value !== "string") {
    return DEFAULT_TEXT_COLOR;
  }

  const trimmed = value.trim().toLowerCase();
  if (!HEX_COLOR_PATTERN.test(trimmed)) {
    return DEFAULT_TEXT_COLOR;
  }

  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;

  if (prefixed.length === 4) {
    const [, red, green, blue] = prefixed;
    return `#${red}${red}${green}${green}${blue}${blue}`;
  }

  return prefixed;
}

export function clampRichImageWidthPercent(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return RICH_IMAGE_WIDTH_PRESET_MAP.large;
  }

  return Math.min(100, Math.max(10, Math.round(value)));
}

export function getRichImageWidthPercent(widthMode, widthPreset, customWidthPercent) {
  if (widthMode === "custom") {
    return clampRichImageWidthPercent(customWidthPercent);
  }

  if (typeof widthPreset === "string" && widthPreset in RICH_IMAGE_WIDTH_PRESET_MAP) {
    return RICH_IMAGE_WIDTH_PRESET_MAP[widthPreset];
  }

  return RICH_IMAGE_WIDTH_PRESET_MAP.large;
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function unescapeHtml(value = "") {
  return String(value)
    .replaceAll("&quot;", '"')
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&");
}

export function parseTagAttributes(raw = "") {
  const attributes = {};
  let match;

  while ((match = TAG_ATTRIBUTE_PATTERN.exec(raw)) !== null) {
    const [, key, quotedValue, bareValue] = match;
    const value = quotedValue ?? bareValue ?? "";
    attributes[key] = value.replaceAll('\\"', '"').replaceAll("\\\\", "\\");
  }

  TAG_ATTRIBUTE_PATTERN.lastIndex = 0;
  return attributes;
}

function escapeTagAttribute(value = "") {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function stringifyTagAttributes(attributes) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}="${escapeTagAttribute(value)}"`)
    .join(" ");
}

function getRichImagePresetFromWidthPercent(widthPercent) {
  for (const [preset, value] of Object.entries(RICH_IMAGE_WIDTH_PRESET_MAP)) {
    if (value === widthPercent) {
      return preset;
    }
  }

  return null;
}

export function createRichImageHtml(attributes = {}) {
  const src = typeof attributes.src === "string" ? attributes.src : "";
  if (!src) {
    return null;
  }

  const alt = typeof attributes.alt === "string" ? attributes.alt : "";
  const caption = typeof attributes.caption === "string" ? attributes.caption.trim() : "";
  const align =
    attributes.align === "left" || attributes.align === "right" || attributes.align === "center"
      ? attributes.align
      : "center";
  const width = getRichImageWidthPercent(
    attributes.widthMode,
    attributes.widthPreset,
    Number(attributes.customWidthPercent)
  );

  const captionHtml = caption
    ? `<figcaption class="rich-image-caption">${escapeHtml(caption)}</figcaption>`
    : "";

  return `<figure class="rich-image-wrapper rich-image-wrapper--align-${align}" style="max-width: ${width}%; width: 100%;"><img class="rich-image-figure" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />${captionHtml}</figure>`;
}

function createRichImageTag(attributes = {}) {
  const src = typeof attributes.src === "string" ? attributes.src : "";
  if (!src) {
    return "";
  }

  const widthPercent = clampRichImageWidthPercent(Number(attributes.widthPercent));
  const preset = getRichImagePresetFromWidthPercent(widthPercent);
  const tagAttributes = {
    src,
    alt: typeof attributes.alt === "string" ? attributes.alt : "",
    caption: typeof attributes.caption === "string" ? attributes.caption : undefined,
    widthMode: preset ? "preset" : "custom",
    widthPreset: preset ?? "large",
    customWidthPercent: preset ? undefined : String(widthPercent),
    align:
      attributes.align === "left" || attributes.align === "right" || attributes.align === "center"
        ? attributes.align
        : "center",
  };

  const serialized = stringifyTagAttributes(tagAttributes);
  return serialized ? `{% richImage ${serialized} /%}` : "{% richImage /%}";
}

export function richMarkdocTagsToHtml(content = "") {
  let result = String(content).replace(RICH_IMAGE_TAG_PATTERN, (_, attributeSource) => {
    const html = createRichImageHtml(parseTagAttributes(attributeSource));
    return html ?? "";
  });

  let previous;
  do {
    previous = result;
    result = result.replace(TEXT_COLOR_TAG_PATTERN, (_, attributeSource, innerContent) => {
      const attributes = parseTagAttributes(attributeSource);
      return `<span class="rich-text-color" style="color: ${escapeHtml(
        normalizeHexColor(attributes.color)
      )};">${innerContent}</span>`;
    });
  } while (result !== previous);

  return result;
}

export function richMarkdocHtmlToTags(content = "") {
  let result = String(content).replace(
    RICH_IMAGE_HTML_PATTERN,
    (_, align, width, src, alt, caption = "") =>
      createRichImageTag({
        align,
        widthPercent: Number(width),
        src: unescapeHtml(src),
        alt: unescapeHtml(alt),
        caption: caption ? unescapeHtml(caption) : undefined,
      })
  );

  let previous;
  do {
    previous = result;
    result = result.replace(TEXT_COLOR_HTML_PATTERN, (_, color, innerContent) => {
      const attributes = stringifyTagAttributes({
        color: normalizeHexColor(unescapeHtml(color)),
      });
      return `{% textColor ${attributes} %}${innerContent}{% /textColor %}`;
    });
  } while (result !== previous);

  return result;
}
