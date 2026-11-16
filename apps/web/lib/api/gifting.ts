import { apiClient } from "./client";

export const phases = ["considering", "bought", "in_hand", "given"] as const;
export type Phase = (typeof phases)[number];
export const phaseLabel: Record<Phase, string> = {
  considering: "Considering",
  bought: "Bought",
  in_hand: "In hand",
  given: "Given",
};
export interface GiftCardData {
  id: number;
  name: string;
  url: string | null;
  price: string | null;
  placement_id: number | null;
  phase: Phase;
  quantity: number;
}
export interface Totals {
  spent: string;
  planned: string;
  purchased_count: number;
  unknown_prices: number;
  phases: Record<Phase, number>;
}
export interface Envelope extends Totals {
  id: number;
  person_id: number;
  person_name: string;
  money_allowance: string | null;
  count_allowance: number | null;
  remaining_money: string | null;
  remaining_count: number | null;
  gifts: GiftCardData[];
}
export interface Occurrence extends Totals {
  id: number;
  occasion_id: number;
  name: string;
  date: string;
  closed: boolean;
  budget_total: string | null;
  allocated: string;
  remaining_money: string | null;
  envelopes: Envelope[];
}
export interface PersonShelf {
  id: number;
  name: string;
  interests: string[];
  ideas: GiftCardData[];
  wishlist: GiftCardData[];
  past_gifts: GiftCardData[];
  occasions: Occurrence[];
}
export interface EventBudget extends Totals {
  occasion_id: number;
  name: string;
  budget_total: string | null;
  allocated: string;
  occurrences: Occurrence[];
}
export interface YearBudget extends Totals {
  year: number;
  allocated: string;
  budget_total: string | null;
  events: EventBudget[];
}
export interface Capture {
  name: string;
  url?: string;
  price?: string;
  person_id?: number;
  occurrence_id?: number;
  kind: "ideas" | "wishlist";
}
const base = "/gifting";
export const giftingApi = {
  occurrences: () => apiClient.get<Occurrence[]>(`${base}/occurrences`),
  occurrence: (id: number) =>
    apiClient.get<Occurrence>(`${base}/occurrences/${id}`),
  create: (data: {
    occasion_id: number;
    date: string;
    budget_total?: string;
  }) => apiClient.post<Occurrence>(`${base}/occurrences`, data),
  close: (id: number, closed: boolean) =>
    apiClient.patch<Occurrence>(`${base}/occurrences/${id}`, { closed }),
  allowance: (
    id: number,
    person: number,
    data: { money_allowance: string | null; count_allowance: number | null },
  ) =>
    apiClient.put<Occurrence>(
      `${base}/occurrences/${id}/people/${person}`,
      data,
    ),
  place: (envelope: number, gift: number) =>
    apiClient.post<GiftCardData>(`${base}/envelopes/${envelope}/gifts`, {
      gift_id: gift,
    }),
  phase: (id: number, phase: Phase) =>
    apiClient.patch(`${base}/gifts/${id}`, { phase }),
  person: (id: number) => apiClient.get<PersonShelf>(`${base}/people/${id}`),
  capture: (data: Capture) =>
    apiClient.post<GiftCardData>(`${base}/ideas`, data),
  ideas: () => apiClient.get<GiftCardData[]>(`${base}/ideas`),
  budgets: (year: number) =>
    apiClient.get<YearBudget>(`${base}/budgets`, { year }),
};
