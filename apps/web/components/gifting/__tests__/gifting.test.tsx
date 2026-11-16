import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  giftingApi,
  type Occurrence,
  type PersonShelf,
  type YearBudget,
} from "@/lib/api/gifting";
import { EventHome } from "../EventHome";
import { EventOccurrence, AllowanceForm } from "../EventOccurrence";
import { PersonShelves } from "../PersonShelves";
import { CaptureDrawer } from "../CaptureDrawer";
import { EventBudgets } from "../EventBudgets";
import { StoreLink } from "../shared";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/hooks/usePersons", () => ({
  usePersons: () => ({ data: { items: [{ id: 1, display_name: "Wren" }] } }),
}));
vi.mock("@/hooks/useOccasions", () => ({
  useOccasions: () => ({ data: { items: [] } }),
}));
vi.mock("@/lib/api/gifting", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api/gifting")>()),
  giftingApi: {
    occurrences: vi.fn(),
    occurrence: vi.fn(),
    person: vi.fn(),
    budgets: vi.fn(),
    capture: vi.fn(),
    allowance: vi.fn(),
    phase: vi.fn(),
    place: vi.fn(),
    close: vi.fn(),
    ideas: vi.fn(),
  },
}));
const totals = {
  spent: "40.00",
  planned: "70.00",
  purchased_count: 1,
  unknown_prices: 0,
  phases: { considering: 1, bought: 1, in_hand: 0, given: 0 },
};
const gift = {
  id: 1,
  name: "Tea set",
  url: "https://example.com/tea",
  price: "40.00",
  placement_id: 1,
  phase: "bought" as const,
  quantity: 1,
};
const event: Occurrence = {
  ...totals,
  id: 1,
  occasion_id: 1,
  name: "Winter gathering",
  date: "2099-12-25",
  closed: false,
  budget_total: "180",
  allocated: "100",
  remaining_money: "140",
  envelopes: [
    {
      ...totals,
      id: 1,
      person_id: 1,
      person_name: "Wren",
      money_allowance: "100",
      count_allowance: 2,
      remaining_money: "60",
      remaining_count: 1,
      gifts: [gift],
    },
  ],
};
const person: PersonShelf = {
  id: 1,
  name: "Wren",
  interests: ["Reading"],
  ideas: [
    { ...gift, id: 2, name: "Scarf", placement_id: null, phase: "considering" },
  ],
  wishlist: [gift],
  past_gifts: [{ ...gift, phase: "given" }],
  occasions: [event],
};
function mount(node: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{node}</QueryClientProvider>,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(giftingApi.occurrences).mockResolvedValue([event]);
  vi.mocked(giftingApi.occurrence).mockResolvedValue(event);
  vi.mocked(giftingApi.person).mockResolvedValue(person);
  vi.mocked(giftingApi.allowance).mockResolvedValue(event);
  vi.mocked(giftingApi.capture).mockResolvedValue(gift);
  vi.mocked(giftingApi.budgets).mockResolvedValue({
    ...totals,
    year: 2026,
    allocated: "100",
    budget_total: "180",
    events: [
      {
        ...totals,
        occasion_id: 1,
        name: event.name,
        budget_total: "180",
        allocated: "100",
        occurrences: [event],
      },
    ],
  } as YearBudget);
});
describe("Event gifting screens", () => {
  it("shows upcoming events first and explains the deferred calendar", async () => {
    const user = userEvent.setup();
    mount(<EventHome />);
    expect(
      await screen.findByRole("heading", { name: "Winter gathering" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Winter gathering/ }),
    ).toHaveAttribute("href", "/events/1");
    await user.click(screen.getByRole("button", { name: "Calendar view" }));
    expect(screen.getByRole("status")).toHaveTextContent("milestone 2");
  });
  it("changes a gift phase through its recipient envelope", async () => {
    const user = userEvent.setup();
    mount(<EventOccurrence id={1} />);
    const select = await screen.findByRole("combobox", {
      name: "Phase for Tea set",
    });
    await user.selectOptions(select, "given");
    await waitFor(() =>
      expect(giftingApi.phase).toHaveBeenCalledWith(1, "given"),
    );
    expect(screen.getByText("1 gifts remaining")).toBeVisible();
  });
  it("keeps zero allowance distinct from an unset allowance", async () => {
    const user = userEvent.setup();
    mount(<AllowanceForm occurrenceId={1} personId={1} />);
    await user.type(screen.getByLabelText("Gift count allowance"), "0");
    await user.click(screen.getByRole("button", { name: "Save allowance" }));
    await waitFor(() =>
      expect(giftingApi.allowance).toHaveBeenCalledWith(1, 1, {
        money_allowance: null,
        count_allowance: 0,
      }),
    );
  });
  it("allows every person section to collapse and keeps store links", async () => {
    const user = userEvent.setup();
    mount(<PersonShelves id={1} />);
    const title = await screen.findByText("Wishlist", { selector: "summary" });
    expect(title.closest("details")).toHaveAttribute("open");
    await user.click(title);
    expect(title.closest("details")).not.toHaveAttribute("open");
    expect(
      screen
        .getByText("Past gifts", { selector: "summary" })
        .closest("details"),
    ).not.toHaveAttribute("open");
    expect(
      screen.getAllByRole("link", { name: "Open link ↗" }).length,
    ).toBeGreaterThan(0);
  });
  it("saves a compact drawer capture and opens Ideas", async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    mount(<CaptureDrawer isOpen onClose={close} />);
    const drawer = screen.getByRole("dialog");
    await user.type(within(drawer).getByLabelText(/Gift name/), "Demo scarf");
    await user.type(
      within(drawer).getByLabelText(/Source link/),
      "https://example.com/scarf",
    );
    await user.selectOptions(within(drawer).getByLabelText("Recipient"), "1");
    await user.click(within(drawer).getByRole("button", { name: "Save idea" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/ideas"));
    expect(giftingApi.capture).toHaveBeenCalledWith({
      name: "Demo scarf",
      url: "https://example.com/scarf",
      person_id: 1,
      kind: "ideas",
    });
    expect(close).toHaveBeenCalled();
  });
  it("groups budgets by event with recipient money and count caps", async () => {
    mount(<EventBudgets />);
    expect(
      await screen.findByRole("heading", { name: "Winter gathering" }),
    ).toBeVisible();
    expect(screen.getByText("2 gifts maximum · 1 remaining")).toBeVisible();
  });
  it("reports a failed request and retries", async () => {
    vi.mocked(giftingApi.occurrences).mockRejectedValueOnce(
      new Error("Offline"),
    );
    const user = userEvent.setup();
    mount(<EventHome />);
    expect(await screen.findByRole("alert")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByRole("heading", { name: "Winter gathering" }),
    ).toBeVisible();
  });
  it("does not render unsafe legacy store links", () => {
    mount(<StoreLink url="javascript:alert(1)" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
