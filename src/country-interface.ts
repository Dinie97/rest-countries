export interface Country {
  id: number;
  favourite: boolean;
  name: string;
  region: string;
  capital: string;
  flag: string;
  population: number;
}

export interface Favourite {
  id: number;
  favourite: boolean;
  population: number;
  name: string;
}
