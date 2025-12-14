import { Product, PromoCode } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Sapphire Midnight Gown',
    category: 'Party Wear',
    price: 450,
    description: 'An elegant deep blue gown with intricate silver embroidery, perfect for evening galas.',
    imageUrl: 'https://picsum.photos/seed/dress1/600/900'
  },
  {
    id: 'p2',
    name: 'Crimson Bridal Lehenga',
    category: 'Wedding Wear',
    price: 1200,
    description: 'Traditional red bridal wear with heavy gold zardozi work, crafted for your special day.',
    imageUrl: 'https://picsum.photos/seed/dress2/600/900'
  },
  {
    id: 'p3',
    name: 'Emerald Silk Saree',
    category: 'Wedding Wear',
    price: 850,
    description: 'Pure silk saree in emerald green, featuring hand-woven motifs.',
    imageUrl: 'https://picsum.photos/seed/dress3/600/900'
  },
  {
    id: 'p4',
    name: 'Champagne Cocktail Dress',
    category: 'Party Wear',
    price: 320,
    description: 'A chic, modern cut dress in champagne gold, ideal for cocktail parties.',
    imageUrl: 'https://picsum.photos/seed/dress4/600/900'
  }
];

export const INITIAL_PROMOS: PromoCode[] = [
  { code: 'LUXE10', discountPercent: 10 },
  { code: 'WEDDING20', discountPercent: 20 }
];

export const BRAND_NAME = "BushNoor";