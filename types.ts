export interface Product {
  id: string;
  name: string;
  category: 'Party Wear' | 'Wedding Wear';
  price: number;
  description: string;
  imageUrl: string;
}

export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
  tryOnCount: number;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
}

export enum ImageResolution {
  RES_1K = "1K",
  RES_2K = "2K",
  RES_4K = "4K"
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface CartItem extends Product {
  quantity: number;
}
