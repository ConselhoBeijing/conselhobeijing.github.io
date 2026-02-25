export type SinglePageSectionKey = "hero" | "sobre" | "noticias" | "agenda" | "projetos" | "equipe" | "faq";

export type SinglePageSectionTone = "green" | "yellow" | "blue" | "gold";

export interface SinglePageSectionConfig {
  key: SinglePageSectionKey;
  title: string;
  subtitle: string;
  tone: SinglePageSectionTone;
  ctaLabel?: string;
  ctaHref?: string;
}

export const singlePageSections: SinglePageSectionConfig[] = [
  {
    key: "hero",
    title: "Conselho dos Cidadãos",
    subtitle: "Uma visão geral da comunidade brasileira em Pequim, com acesso rápido às principais frentes de atuação.",
    tone: "green",
    ctaLabel: "Conhecer o Conselho",
    ctaHref: "/sobre",
  },
  {
    key: "sobre",
    title: "Sobre",
    subtitle: "Conheça o propósito, a atuação regional e a forma como o conselho organiza ações voluntárias para brasileiros na China.",
    tone: "yellow",
    ctaLabel: "Ler página completa",
    ctaHref: "/sobre",
  },
  {
    key: "noticias",
    title: "Notícias",
    subtitle: "As atualizações mais recentes sobre eventos, parcerias e iniciativas da comunidade.",
    tone: "blue",
    ctaLabel: "Ver todas as notícias",
    ctaHref: "/news",
  },
  {
    key: "agenda",
    title: "Agenda",
    subtitle: "Próximos eventos locais para fortalecer conexões, cultura e apoio mútuo.",
    tone: "gold",
    ctaLabel: "Ver agenda completa",
    ctaHref: "/events",
  },
  {
    key: "projetos",
    title: "Projetos",
    subtitle: "Todas as iniciativas organizadas para apoiar, conectar e valorizar brasileiros na região.",
    tone: "green",
    ctaLabel: "Explorar projetos",
    ctaHref: "/projects",
  },
  {
    key: "equipe",
    title: "Equipe",
    subtitle: "Conselheiros que coordenam ações e representam a comunidade de forma voluntária.",
    tone: "yellow",
    ctaLabel: "Ver equipe completa",
    ctaHref: "/team",
  },
  {
    key: "faq",
    title: "FAQ",
    subtitle: "Perguntas mais frequentes para orientar brasileiros recém-chegados e residentes.",
    tone: "blue",
    ctaLabel: "Acessar FAQ completo",
    ctaHref: "/faq",
  },
];

export function getSinglePageSection(key: SinglePageSectionKey): SinglePageSectionConfig {
  const section = singlePageSections.find((item) => item.key === key);
  if (!section) {
    throw new Error(`Configuração da seção "${key}" não encontrada em src/config/single-page.ts.`);
  }
  return section;
}
