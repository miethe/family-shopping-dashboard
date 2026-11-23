"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { giftingApi } from "@/lib/api/gifting";

export function useOccurrences() {
  return useQuery({
    queryKey: ["gifting", "occurrences"],
    queryFn: giftingApi.occurrences,
  });
}
export function useGiftingOccurrence(id: number) {
  return useQuery({
    queryKey: ["gifting", "occurrence", id],
    queryFn: () => giftingApi.occurrence(id),
    enabled: Number.isSafeInteger(id) && id > 0,
  });
}
export function usePersonShelf(id: number) {
  return useQuery({
    queryKey: ["gifting", "person", id],
    queryFn: () => giftingApi.person(id),
    enabled: Number.isSafeInteger(id) && id > 0,
  });
}
export function useGiftingBudget(year: number) {
  return useQuery({
    queryKey: ["gifting", "budget", year],
    queryFn: () => giftingApi.budgets(year),
  });
}
export function useGiftingIdeas() {
  return useQuery({
    queryKey: ["gifting", "ideas"],
    queryFn: giftingApi.ideas,
    staleTime: 0,
  });
}
export function useGiftingMutation<T, R>(fn: (data: T) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await Promise.all(
        ["gifting", "gifts", "persons", "ideas", "lists", "occasions"].map(
          (key) => queryClient.invalidateQueries({ queryKey: [key] }),
        ),
      );
    },
  });
}
