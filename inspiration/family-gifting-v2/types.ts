export enum GiftStatus {
  Idea = "Idea",
  ToBuy = "To Buy",
  Purchased = "Purchased",
  Gifted = "Gifted"
}

export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Recipient {
  id: string;
  name: string;
  avatar: string;
  group: 'Household' | 'Family' | 'Friends' | 'Other';
  birthday?: string;
  anniversary?: string;
  sizes?: {
    shirt?: string;
    pants?: string;
    shoe?: string;
  };
  interests?: string[];
}

export interface Gift {
  id: string;
  name: string;
  description?: string;
  status: GiftStatus;
  price?: number;
  image?: string;
  recipientId: string;
  addedBy: string; // User ID
  url?: string;
  listId?: string;
}

export interface GiftList {
  id: string;
  title: string;
  type: 'Occasion' | 'Wishlist' | 'GiftList';
  date?: string; // e.g., "Christmas 2026"
  itemCount: number;
  recipientCount?: number; // For aggregate lists
  avatars: string[];
  status?: 'In Progress' | 'Planning' | 'Archived';
}
