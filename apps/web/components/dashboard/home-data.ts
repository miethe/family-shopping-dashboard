import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { Person, Occasion } from '@/types';
import type { Occurrence } from '@/lib/api/gifting';
import type { Holiday } from '@/lib/api/holidays';
export function daysUntil(date: string, now = new Date()) { return differenceInCalendarDays(parseISO(date), now); }
export function upcomingEvents(rows: Occurrence[], now = new Date()) {
  return rows.filter(o => !o.closed && daysUntil(o.date, now) >= 0).sort((a,b)=>a.date.localeCompare(b.date));
}
export function majorEvent(rows: Occurrence[], occasions: Occasion[], holidays: Holiday[], now = new Date()) {
  const majorIds = new Set(holidays.filter(h=>h.is_major).map(h=>h.id));
  const ids = new Set(occasions.filter(o=>o.holiday_id != null && majorIds.has(o.holiday_id)).map(o=>o.id));
  return upcomingEvents(rows,now).find(o=>ids.has(o.occasion_id));
}
export function nextBirthday(people: Person[], now = new Date()) {
  return people.flatMap(person=>{
    if (!person.birthdate) return [];
    const born=parseISO(person.birthdate);
    if (Number.isNaN(born.getTime()) || born>now) return [];
    // Feb 29 falls on Feb 28 in a non-leap year. Compare calendar days, never 24-hour blocks.
    const inYear=(year:number)=>new Date(year,born.getMonth(),Math.min(born.getDate(),new Date(year,born.getMonth()+1,0).getDate()));
    let next=inYear(now.getFullYear());
    if(differenceInCalendarDays(next,now)<0) next=inYear(now.getFullYear()+1);
    return [{person, date:next, days:differenceInCalendarDays(next,now), age:next.getFullYear()-born.getFullYear()}];
  }).sort((a,b)=>a.days-b.days || a.person.id-b.person.id)[0];
}
export const money = (value: string | number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:Number(value)%1 ? 2 : 0}).format(Number(value));
