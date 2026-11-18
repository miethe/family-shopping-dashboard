import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Occurrence } from "@/lib/api/gifting";
import { CalendarPanel } from "../CalendarPanel";

const year = new Date().getFullYear();
const event = (id: number, closed: boolean): Occurrence => ({ id, occasion_id: id, name: closed ? "Closed celebration" : "Open celebration", date: `${year}-12-25`, closed, budget_total: null, allocated: "0", remaining_money: null, envelopes: [], spent: "0", planned: "0", purchased_count: 0, unknown_prices: 0, phases: { considering: 0, bought: 0, in_hand: 0, given: 0 } });
function mount() { return render(<CalendarPanel occurrences={[event(1, false), event(2, true)]} loading={false} error={null} retry={vi.fn()} onClose={vi.fn()} />); }
beforeEach(() => localStorage.clear());
describe("calendar panel", () => {
  it("defaults to Upcoming and remembers the chosen view", async () => {
    const user = userEvent.setup(); const { unmount } = mount();
    expect(screen.getByRole("tab", { name: "Upcoming" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("tab", { name: "Season" })); unmount(); mount();
    expect(screen.getByRole("tab", { name: "Season" })).toHaveAttribute("aria-selected", "true");
  });
  it("preserves filters and selected date when switching views", async () => {
    const user = userEvent.setup(); mount();
    await user.click(screen.getByRole("checkbox", { name: "Include closed" }));
    await user.click(screen.getByRole("tab", { name: "Month" }));
    const date = screen.getAllByRole("button", { name: /, [0-9]+ events?/ })[0]; const label = date.getAttribute("aria-label")!;
    await user.click(date); await user.click(screen.getByRole("tab", { name: "Season" })); await user.click(screen.getByRole("tab", { name: "Month" }));
    expect(screen.getByRole("button", { name: label })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("checkbox", { name: "Include closed" })).not.toBeChecked();
  });
  it("shows closed events collapsed and filters them", async () => {
    const user = userEvent.setup(); mount(); await user.click(screen.getByRole("tab", { name: "Season" }));
    const summary = screen.getByText(/Closed celebration/, { selector: "summary" });
    expect(summary.parentElement).not.toHaveAttribute("open");
    expect(within(summary).getByText("Closed")).toBeInTheDocument();
    await user.click(summary); expect(summary.parentElement).toHaveAttribute("open");
    await user.click(screen.getByRole("checkbox", { name: "Include closed" })); expect(screen.queryByText(/Closed celebration/, { selector: "summary" })).not.toBeInTheDocument();
  });
  it("supports arrow navigation between tabs", async () => {
    const user = userEvent.setup(); mount(); const upcoming = screen.getByRole("tab", { name: "Upcoming" }); upcoming.focus();
    await user.keyboard("{ArrowRight}"); expect(screen.getByRole("tab", { name: "Season" })).toHaveFocus();
  });
});
