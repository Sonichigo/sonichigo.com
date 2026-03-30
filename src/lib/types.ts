export interface Talk {
  id: number;
  title: string;
  description: string | null;
  event_name: string;
  event_url: string | null;
  date: string;
  location: string | null;
  type: "speaker" | "host" | "panelist" | "workshop";
  image_url: string | null;
  video_url: string | null;
  slides_url: string | null;
}

export interface Post {
  id: number;
  title: string;
  url: string;
  source: string;
  published_at: string;
  excerpt: string | null;
  tags: string[];
  image_url: string | null;
  is_featured: boolean;
}

export interface Travel {
  id: number;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  visited_date: string | null;
  purpose: string | null;
  notes: string | null;
  image_url: string | null;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
  updated_at: string;
}
