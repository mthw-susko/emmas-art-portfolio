export interface Artwork {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
}

export interface AboutContent {
  bio: string;
  email: string;
  instagram: string;
  skills: Skill[];
  clients: string[];
  portraitUrl?: string;
}

export interface Skill {
  name: string;
  percentage: number;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface User {
  uid: string;
  email: string;
}
