export const siteConfig = {
  name: 'Paramedical Knowledge Hub',
  description:
    'General health and paramedical information for educational purposes. Not a replacement for professional medical advice.',
  url: 'https://parameddiy.com',
  ogImage: '/og-image.jpg',
  links: {
    twitter: '',
    github: '',
  },
  author: {
    name: 'Paramedical Knowledge Hub',
    email: 'contact@parameddiy.com',
  },
};

export const categories = [
  'prevention',
  'rehabilitation',
  'physiotherapy',
  'occupational_therapy',
  'nutrition',
  'mental_wellbeing',
  'general_health',
  'other',
] as const;

export type Category = (typeof categories)[number];

export const categoryLabels: Record<Category, string> = {
  prevention: 'Prevention',
  rehabilitation: 'Rehabilitation',
  physiotherapy: 'Physiotherapy',
  occupational_therapy: 'Occupational Therapy',
  nutrition: 'Nutrition',
  mental_wellbeing: 'Mental Wellbeing',
  general_health: 'General Health',
  other: 'Other',
};

