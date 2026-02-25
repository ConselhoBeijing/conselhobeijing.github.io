import { defineCollection, z } from 'astro:content';

const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string().transform((str) => new Date(str)),
    type: z.enum(['local', 'external']),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    externalLink: z.string().url().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    intro: z.string(),
    cover: z.string().optional(),
    thumbnail: z.string().optional(),
  }),
});

const team = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string(),
    photo: z.string().optional(),
    group: z.enum(['director', 'executive']),
    linkedin: z.string().url().optional(),
    wechat: z.string().url().optional(),
    instagram: z.string().url().optional(),
    youtube: z.string().url().optional(),
  }),
});

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    start: z.string().transform((str) => new Date(str)),
    end: z.string().transform((str) => new Date(str)).optional(),
    location: z.string().optional(),
  }),
});

const pages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
  }),
});

export const collections = { news, projects, team, events, pages };
