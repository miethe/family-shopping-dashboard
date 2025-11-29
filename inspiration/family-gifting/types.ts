export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  ALL_LISTS = 'ALL_LISTS',
  SINGLE_LIST = 'SINGLE_LIST',
}

export enum GiftStatus {
  IDEA = 'Idea',
  SHORTLISTED = 'Shortlisted',
  PURCHASED = 'Purchased',
  HIDDEN = 'Hidden'
}

export interface Person {
  id: string;
  name: string;
  avatar: string;
  colorRing: string;
}

export interface GiftItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
  status: GiftStatus;
  assignedTo?: string; // Who is buying it
  image?: string;
}

export interface GiftList {
  id: string;
  title: string;
  subtitle?: string; // e.g., "Christmas Ideas"
  owner: Person;
  items: GiftItem[];
  itemCount: number;
  tags?: string[];
  themeColor: 'mustard' | 'salmon' | 'sage' | 'blue' | 'gray';
}

export interface ActivityLog {
  id: string;
  actor: string;
  actorAvatar: string;
  action: string;
  target: string; // The item name
  status: 'Purchased' | 'Added' | 'Removed';
}