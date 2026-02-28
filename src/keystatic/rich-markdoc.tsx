import React from "react";
import type { BasicFormField, FormFieldInputProps } from "@keystatic/core";
import { fields } from "@keystatic/core";
import { block, mark } from "@keystatic/core/content-components";
import { paletteIcon } from "@keystar/ui/icon/icons/paletteIcon";
import { imageIcon } from "@keystar/ui/icon/icons/imageIcon";
import {
  DEFAULT_TEXT_COLOR,
  clampRichImageWidthPercent,
  getRichImageWidthPercent,
  richMarkdocHtmlToTags,
  richMarkdocTagsToHtml,
  normalizeHexColor,
} from "./rich-markdoc-shared.js";

type RichImageDirectoryOptions = {
  directory: string;
  publicPath: string;
};

type CreateRichMarkdocFieldOptions = RichImageDirectoryOptions & {
  label: string;
  description?: string;
};

function createColorField(): BasicFormField<string, string, string> {
  return {
    kind: "form",
    Input(props: FormFieldInputProps<string>) {
      const inputValue = typeof props.value === "string" ? props.value : DEFAULT_TEXT_COLOR;
      const color = normalizeHexColor(inputValue);

      return (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <input
            type="color"
            aria-label="Color picker"
            value={color}
            onChange={(event) => {
              props.onChange(normalizeHexColor(event.target.value));
            }}
          />
          <input
            type="text"
            aria-label="Hex color"
            value={inputValue}
            onChange={(event) => {
              props.onChange(event.target.value.toLowerCase());
            }}
          />
        </div>
      );
    },
    defaultValue() {
      return DEFAULT_TEXT_COLOR;
    },
    parse(value) {
      return typeof value === "string" ? value : DEFAULT_TEXT_COLOR;
    },
    serialize(value) {
      return {
        value: normalizeHexColor(value),
      };
    },
    validate(value) {
      return normalizeHexColor(value);
    },
    reader: {
      parse(value) {
        return normalizeHexColor(value);
      },
    },
    label: "Color",
  };
}

function createRichMarkdocComponents({ directory, publicPath }: RichImageDirectoryOptions) {
  return {
    textColor: mark({
      label: "Colored text",
      icon: paletteIcon,
      schema: {
        color: createColorField(),
      },
      tag: "span",
      style: ({ value }) => ({
        color: normalizeHexColor(value.color),
      }),
    }),
    richImage: block({
      label: "Rich image",
      icon: imageIcon,
      schema: {
        src: fields.image({
          label: "Image",
          directory,
          publicPath,
          validation: {
            isRequired: true,
          },
        }),
        alt: fields.text({
          label: "Alt text",
          validation: {
            isRequired: true,
          },
        }),
        caption: fields.text({
          label: "Caption",
        }),
        widthMode: fields.select({
          label: "Width mode",
          options: [
            { label: "Preset", value: "preset" },
            { label: "Custom", value: "custom" },
          ],
          defaultValue: "preset",
        }),
        widthPreset: fields.select({
          label: "Preset width",
          options: [
            { label: "Small (33%)", value: "small" },
            { label: "Medium (50%)", value: "medium" },
            { label: "Large (66%)", value: "large" },
            { label: "Full (100%)", value: "full" },
          ],
          defaultValue: "large",
        }),
        customWidthPercent: fields.integer({
          label: "Custom width (%)",
          defaultValue: 66,
          validation: {
            min: 10,
            max: 100,
          },
        }),
        align: fields.select({
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
          defaultValue: "center",
        }),
      },
      ContentView({ value }) {
        const width = getRichImageWidthPercent(value.widthMode, value.widthPreset, value.customWidthPercent);
        const filename = value.src?.filename ? ` ${value.src.filename}` : "";

        return (
          <div
            style={{
              border: "1px solid rgba(0, 0, 0, 0.14)",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              backgroundColor: "rgba(249, 240, 227, 0.7)",
            }}
          >
            <strong>Rich image{filename}</strong>
            <div style={{ marginTop: "0.35rem", fontSize: "0.875rem" }}>
              {value.align} aligned, {width}% width
            </div>
            <div style={{ marginTop: "0.35rem", fontSize: "0.875rem" }}>{value.alt || "Add alt text"}</div>
            {value.caption ? <div style={{ marginTop: "0.35rem", fontSize: "0.875rem" }}>{value.caption}</div> : null}
          </div>
        );
      },
    }),
  };
}

export function createRichMarkdocField({ label, description, directory, publicPath }: CreateRichMarkdocFieldOptions) {
  const baseField = fields.markdoc({
    label,
    description,
    extension: "md",
    options: {
      bold: true,
      italic: true,
      strikethrough: true,
      code: true,
      heading: true,
      blockquote: true,
      orderedList: true,
      unorderedList: true,
      table: true,
      link: true,
      divider: true,
      codeBlock: true,
      image: {
        directory,
        publicPath,
      },
    },
    components: createRichMarkdocComponents({ directory, publicPath }),
  });

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  function transformContent(
    content: Uint8Array | undefined,
    transformer: (value: string) => string
  ): Uint8Array | undefined {
    if (!content) {
      return content;
    }

    return encoder.encode(transformer(decoder.decode(content)));
  }

  return {
    ...baseField,
    parse(value, args) {
      return baseField.parse(value, {
        ...args,
        content: transformContent(args.content, richMarkdocHtmlToTags),
      });
    },
    serialize(value, extra) {
      const serialized = baseField.serialize(value, extra);
      return {
        ...serialized,
        content: transformContent(serialized.content, richMarkdocTagsToHtml),
      };
    },
    reader: {
      ...baseField.reader,
      parse(value, args) {
        return baseField.reader.parse(value, {
          ...args,
          content: transformContent(args.content, richMarkdocHtmlToTags),
        });
      },
    },
  };
}
