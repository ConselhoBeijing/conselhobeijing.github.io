import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    news: collection({
      label: "News",
      slugField: "title",
      path: "src/content/news/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({ label: "Date" }),
        type: fields.select({
          label: "Type",
          options: [
            { label: "Artigo", value: "local" },
            { label: "Link Externo", value: "external" },
          ],
          defaultValue: "local",
        }),
        thumbnail: fields.image({
          label: "Thumbnail",
          directory: "public/images/news",
          publicPath: "/images/news",
        }),
        externalLink: fields.url({ label: "Link Externo" }),
        content: fields.document({
          label: "Content",
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: "public/images/news",
            publicPath: "/images/news",
          },
        }),
      },
    }),
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "src/content/projects/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        intro: fields.text({ label: "Introduction", multiline: true }),
        cover: fields.image({
          label: "Cover Image",
          directory: "public/images/projects",
          publicPath: "/images/projects",
        }),
        content: fields.document({
          label: "Content",
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: "public/images/projects",
            publicPath: "/images/projects",
          },
        }),
      },
    }),
    team: collection({
      label: "Team",
      slugField: "name",
      path: "src/content/team/*",
      schema: {
        name: fields.slug({ name: { label: "Name" } }),
        role: fields.text({ label: "Role" }),
        bio: fields.text({ label: "Bio", multiline: true }),
        photo: fields.image({
          label: "Photo",
          directory: "public/images/team",
          publicPath: "/images/team",
        }),
        group: fields.select({
          label: "Group",
          options: [
            { label: "Director Counselor", value: "director" },
            { label: "Executive Counselor", value: "executive" },
          ],
          defaultValue: "executive",
        }),
        linkedin: fields.url({ label: "LinkedIn" }),
        wechat: fields.text({ label: "WeChat ID" }),
        instagram: fields.url({ label: "Instagram" }),
        youtube: fields.url({ label: "YouTube" }),
      },
    }),
    events: collection({
      label: "Events",
      slugField: "title",
      path: "src/content/events/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        start: fields.datetime({ label: "Start Time" }),
        end: fields.datetime({ label: "End Time" }),
        location: fields.text({ label: "Location" }),
        content: fields.document({
          label: "Description",
          formatting: true,
          dividers: true,
          links: true,
        }),
      },
    }),
  },
});
