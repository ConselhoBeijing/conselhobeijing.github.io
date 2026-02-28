import { config, fields, collection, singleton } from "@keystatic/core";
import { fixedTimezoneDatetimeField } from "./src/keystatic/fixed-timezone-datetime";
import { createRichMarkdocField } from "./src/keystatic/rich-markdoc";

export default config({
  storage: {
    kind: "local",

    // kind: "github",
    // repo: `conselhobeijing/website`,
  },
  ui: {
    brand: {
      name: "Conselho Beijing",
      // mark: ({ colorScheme }) => {
      //   let path = colorScheme === "dark" ? "/icons/conselho-footer-dark.png" : "/icons/conselho-footer-light.png";

      //   return "<img src={ path } height = { 24} />";
      // },
    },
    navigation: {
      Conteudo: ["news", "events", "projects", "team"],
      Paginas: ["aboutPage", "faqPage"],
    },
  },
  collections: {
    news: collection({
      label: "Notícias",
      slugField: "title",
      path: "src/content/news/**",
      format: { contentField: "content" },
      columns: ["title", "date", "type"],
      schema: {
        title: fields.slug({ name: { label: "Título" } }),
        date: fields.date({ label: "Data" }),
        type: fields.select({
          label: "Tipo",
          options: [
            { label: "Artigo", value: "local" },
            { label: "Link Externo", value: "external" },
          ],
          defaultValue: "external",
        }),
        description: fields.text({ label: "Descrição", multiline: true }),
        thumbnail: fields.text({
          label: "Thumbnail URL or Path",
          description: "Use a full URL or a site path like /news/2025/banner.png",
        }),
        externalLink: fields.url({ label: "Link Externo" }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value || "Tag",
        }),
        content: createRichMarkdocField({
          label: "Content",
          directory: "public/news",
          publicPath: "/news",
        }),
      },
    }),
    projects: collection({
      label: "Projetos",
      slugField: "title",
      path: "src/content/projects/*",
      format: { contentField: "content" },
      columns: ["title"],
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        intro: fields.text({ label: "Introduction", multiline: true }),
        thumbnail: fields.image({
          label: "Thumbnail",
          directory: "public/projects",
          publicPath: "/projects",
        }),
        content: createRichMarkdocField({
          label: "Content",
          directory: "public/projects",
          publicPath: "/projects",
        }),
      },
    }),
    team: collection({
      label: "Equipe",
      slugField: "name",
      path: "src/content/team/*",
      format: "json",
      columns: ["name", "role", "group"],
      schema: {
        name: fields.slug({ name: { label: "Name" } }),
        role: fields.text({ label: "Role" }),
        bio: fields.text({ label: "Bio", multiline: true }),

        photo: fields.image({
          label: "Foto",
          directory: "public/team",
          publicPath: "/team",
        }),
        group: fields.select({
          label: "Grupo",
          options: [
            { label: "Conselheiro Diretor", value: "director" },
            { label: "Conselheiro Executivo", value: "executive" },
          ],
          defaultValue: "executive",
        }),
        workgroups: fields.array(
          fields.select({
            label: "Workgroup",
            options: [
              { label: "Comunicação", value: "Comunicação" },
              { label: "Eventos", value: "Eventos" },
              { label: "Mapeamento", value: "Mapeamento" },
              { label: "Apoio ao Brasileiro", value: "Apoio ao Brasileiro" },
              { label: "Comunicação", value: "Comunicação" },
            ],
            defaultValue: "Comunicação",
          }),
          {
            label: "Workgroups",

            itemLabel: (props) => props.value || "Workgroup",
          },
        ),
        linkedin: fields.url({ label: "LinkedIn" }),
        wechat: fields.url({ label: "WeChat URL" }),
        instagram: fields.url({ label: "Instagram" }),
        youtube: fields.url({ label: "YouTube" }),
      },
    }),
    events: collection({
      label: "Eventos",
      slugField: "title",
      path: "src/content/events/*",
      format: { contentField: "content" },
      columns: ["title", "start", "location"],
      schema: {
        title: fields.slug({ name: { label: "Título" } }),
        start: fixedTimezoneDatetimeField({ label: "Início" }),
        end: fixedTimezoneDatetimeField({ label: "Término" }),
        location: fields.text({ label: "Localização" }),
        content: createRichMarkdocField({
          label: "Description",
          directory: "public/events",
          publicPath: "/events",
        }),
      },
    }),
  },
  singletons: {
    aboutPage: singleton({
      label: "Sobre",
      path: "src/content/pages/about",
      entryLayout: "content",
      format: { contentField: "content" },
      schema: {
        title: fields.text({ label: "Title" }),
        subtitle: fields.text({ label: "Subtitle" }),
        content: createRichMarkdocField({
          label: "Content",
          directory: "public/about",
          publicPath: "/about",
        }),
      },
    }),
    faqPage: singleton({
      label: "FAQ",
      entryLayout: "content",
      path: "src/content/pages/faq",
      format: { contentField: "content" },
      schema: {
        title: fields.text({ label: "Title" }),
        subtitle: fields.text({ label: "Subtitle" }),
        content: createRichMarkdocField({
          label: "Content (Markdown)",
          directory: "public/about",
          publicPath: "/about",
        }),
      },
    }),
  },
});
