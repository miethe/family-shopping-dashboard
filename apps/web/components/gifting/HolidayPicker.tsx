'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import type { Holiday } from '@/lib/api/holidays';
export function upcomingHolidays(holidays:Holiday[]) { return [...holidays].sort((a,b)=>a.next_date.localeCompare(b.next_date)||Number(b.is_major)-Number(a.is_major)||a.name.localeCompare(b.name)); }
export function HolidayPicker({holidays,value,onChange}:{holidays:Holiday[];value:string;onChange:(holiday:Holiday)=>void}) {
 const [search,setSearch]=useState('');const rows=upcomingHolidays(holidays).filter(h=>h.name.toLowerCase().includes(search.toLowerCase()));
 return <div className="club-holiday-picker"><h2>Pick a holiday</h2><p>Start a little family tradition.</p><Input aria-label="Find a holiday" placeholder="Find a holiday…" value={search} onChange={e=>setSearch(e.target.value)}/><h3>Coming up next</h3><div role="group" aria-label="Holidays">{rows.map(h=><button type="button" key={h.id} aria-pressed={value===String(h.id)} onClick={()=>onChange(h)}><span aria-hidden="true">{h.theme_key==='christmas'?'🎄':'✨'}</span><div><strong>{h.name}</strong>{h.is_major&&<small>★ Major</small>}<p>{new Date(`${h.next_date}T12:00:00`).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'})} · {h.days_until===0?'Today':`in ${h.days_until} days`}</p></div><b aria-hidden="true">{value===String(h.id)?'✓':'+'}</b></button>)}</div>{!rows.length&&<p>No holidays match. Try another name or add your own.</p>}<p className="club-holiday-hint">Choose one to set your date and budget.</p></div>;
}
