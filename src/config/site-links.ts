export interface NavLink {
  name: string;
  href: string;
  external?: boolean;
}

export type SocialLinkId = "wechat" | "instagram" | "linkedin" | "email";

export interface SocialLink {
  id: SocialLinkId;
  name: string;
  href: string;
  iconClass: string;
  external?: boolean;
  showQrPopover?: boolean;
}

export const branding = {
  logoPath: "/icons/conselho-footer-light.png",
  logoPathDark: "/icons/conselho-footer-dark.png",
  footerLogoLightPath: "/icons/conselho-top-logo-full.png",
  footerLogoDarkPath: "/icons/conselho-top-logo-full-dark.png",
  logoAlt: "Conselho dos Cidadãos Brasileiros de Beijing",
  footerLogoAlt: "Conselho dos Cidadãos Brasileiros de Beijing",
  logoTitle: "Conselho dos Cidadãos Brasileiros de Beijing",
};

export const primaryNavLinks: NavLink[] = [
  { name: "Sobre", href: "/sobre" },
  { name: "Notícias", href: "/news" },
  { name: "Projetos", href: "/projects" },
  { name: "Agenda", href: "/events" },
  { name: "Equipe", href: "/team" },
  { name: "FAQ", href: "/faq" },
];

export const socialLinks: SocialLink[] = [
  {
    id: "wechat",
    name: "WeChat",
    href: "http://weixin.qq.com/r/mp/MSlWTvnEoaTerb0t93wj",
    iconClass: "bi bi-wechat",
    external: true,
    showQrPopover: true,
  },
  {
    id: "instagram",
    name: "Instagram",
    href: "https://instagram.com/conselhobeijing",
    iconClass: "bi bi-instagram",
    external: true,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/conselhobj",
    iconClass: "bi bi-linkedin",
    external: true,
  },
  {
    id: "email",
    name: "E-mail",
    href: "mailto:diretoria@conselhobeijing.org",
    iconClass: "bi bi-envelope",
    external: true,
  },
];

export const socialLinksConfig = {
  wechatQrImage: "/images/wechat-qr.jpg",
  wechatHint: "Use o WeChat para escanear este código e seguir nossa Conta Oficial",
};
