const SITE_NAME = 'Portal Nexo';
const DEFAULT_DESCRIPTION =
  'Portal editorial premium sobre finanzas personales, inversiones y economía en español.';

export const siteConfig = {
  name: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portalnexo.com',
  twitter: '@portalnexo',
  defaultOgImage: '/og-default.svg',
  revalidateSeconds: 300,
};

export const navCategoriesFallback = [
  'Finanzas personales',
  'Inversiones',
  'Tarjetas de crédito',
  'Préstamos',
  'Economía',
];

export const adsConfig = {
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '',
};

