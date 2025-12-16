export interface Game {
  id?: number;
  name: string;
  title?: string;
  categoryId: number;
  category?: string;
  description?: string;
  rules?: string;
  difficulty?: string;
  price?: string;
  image?: string;
}
