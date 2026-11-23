import Link from 'next/link';
import type { Occurrence } from '@/lib/api/gifting';
import { BudgetMeter } from '@/components/budget/BudgetMeter';
import { SectionHeader } from '@/components/ui/section-header';
import { money } from './home-data';
export function BudgetCard({ event }: { event?: Occurrence }) {
  const budget=event?.budget_total == null ? null : Number(event.budget_total);
  const spent=Number(event?.spent || 0);
  const percent=budget && budget>0 ? spent/budget*100 : 0;
  const remaining=budget == null ? null : budget-spent;
  const over=remaining != null && remaining<0;
  return <section className="home-card home-budget">
    <SectionHeader title={event ? `${event.name} budget` : 'A little room for giving'} action={<Link href="/budgets">Details →</Link>}/>
    {budget == null ? <div className="home-empty"><span aria-hidden="true">💛</span><h3>Big love. Your kind of budget.</h3><p>Choose an amount that feels right for you.</p><Link className="home-link" href={event ? `/events/${event.id}` : '/events'}>Set a budget →</Link></div> : <>
      <div className="budget-dollars">{money(spent)}<span> / {money(budget)}</span></div>
      <p className="budget-caption">Spent so far · {money(Math.abs(remaining!))} {over ? 'over budget' : 'left to play with'}</p>
      <BudgetMeter className="home-budget-meter" size="sm" showLabels={false} data={{budget_total:budget,purchased_amount:spent,planned_amount:0,remaining_amount:remaining,purchased_percent:Math.min(100,Math.max(0,percent)),planned_percent:0,is_over_budget:over,has_budget:true}}/>
      <div className="budget-meta"><span>{event!.purchased_count} gifts bought</span><span>{budget>0 ? `${Math.round(percent)}% of budget` : 'No spending budget'}</span></div>
      <p className={`budget-note ${over ? 'over' : ''}`}>{over ? 'A little over the plan. Take a look before your next purchase.' : percent>=90 ? 'Nearly there. Keep an eye on the last few gifts.' : 'Looking good! Your plan is comfortably inside the budget.'}</p>
    </>}
  </section>;
}
