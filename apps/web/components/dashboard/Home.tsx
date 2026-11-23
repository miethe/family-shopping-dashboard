'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useOccurrences } from '@/hooks/useGifting';
import { usePersons } from '@/hooks/usePersons';
import { useOccasions } from '@/hooks/useOccasions';
import { holidayApi } from '@/lib/api/holidays';
import { QuickAddModal } from '@/components/quick-add';
import { CountdownDoor } from '@/components/ui/countdown-door';
import { SectionHeader } from '@/components/ui/section-header';
import { AvatarCarousel } from '@/components/features/dashboard/AvatarCarousel';
import { StatsCards } from './StatsCards';
import { IdeaInbox } from './IdeaInbox';
import { RecentActivity } from './RecentActivity';
import { BudgetCard } from './BudgetCard';
import { daysUntil, majorEvent, nextBirthday, upcomingEvents } from './home-data';
export function Home() {
  const {user}=useAuth(); const router=useRouter();
  const events=useOccurrences(); const people=usePersons({limit:100}); const occasions=useOccasions({limit:100});
  const holidays=useQuery({queryKey:['holidays'],queryFn:holidayApi.list});
  const [now,setNow]=useState(()=>new Date()); const [capture,setCapture]=useState(false);
  useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),60000);return ()=>clearInterval(timer);},[]);
  const upcoming=upcomingEvents(events.data || [],now);
  const major=majorEvent(events.data || [],occasions.data?.items || [],holidays.data || [],now);
  const event=major || upcoming[0];
  const birthday=nextBirthday(people.data?.items || [],now);
  const person=birthday?.person;
  const nudge=people.data?.items.find(p=>!p.interests?.length || (!p.size_profile?.length && !Object.keys(p.sizes || {}).length));
  const name=user?.email.split('@')[0].split(/[._-]/)[0];
  const firstName=name ? name.charAt(0).toUpperCase()+name.slice(1) : 'there';
  const loading=events.isLoading || occasions.isLoading || holidays.isLoading;
  const error=events.error || occasions.error || holidays.error;
  return <div className="club-home">
    <div className="home-heading"><div><h1>Hello, {firstName} <span aria-hidden="true">☀</span></h1><p>{upcoming[0] ? `Up next: ${upcoming[0].name} · ${format(parseISO(upcoming[0].date),'MMM d')} · ${daysUntil(upcoming[0].date,now)} days` : 'Big love. Little details. Good days ahead.'}</p></div><button className="home-primary" onClick={()=>setCapture(true)}>+ Add an idea</button></div>
    <div className="home-festoon" aria-hidden="true"/>
    <div className="home-hero-grid">
      <section className="home-event-hero">
        {loading ? <p role="status">Finding your next celebration…</p> : error ? <div role="alert"><h2>Your celebrations will be back.</h2><p>We couldn’t load the plan.</p><button className="home-white" onClick={()=>{events.refetch();occasions.refetch();holidays.refetch();}}>Try again</button></div> : event ? <>
          <span className="hero-confetti" aria-hidden="true">✦</span><div className="hero-row"><div><div className="home-eyebrow">{major ? 'The big one is coming' : 'Your next celebration'}</div><h2>{event.name}</h2><p>{format(parseISO(event.date),'EEE, MMM d')}{event.envelopes.length>0 ? ` · ${event.envelopes.length} people to celebrate` : ' · Make a little magic'}</p></div><CountdownDoor days={daysUntil(event.date,now)}/></div>
          <div className="hero-foot"><StatsCards compact ideas={event.phases.considering} toBuy={0} purchased={event.purchased_count} total={Object.values(event.phases).reduce((a,b)=>a+b,0)}/><Link className="home-white" href={`/events/${event.id}`}>Open plan →</Link></div>
        </> : <><div className="home-eyebrow">The good days start here</div><h2>Something to look forward to.</h2><p>A birthday, a holiday, or just because. Make room for your first celebration.</p><div className="hero-foot"><span aria-hidden="true">🎁</span><Link className="home-white" href="/events">Add an event →</Link></div></>}
      </section>
      <section className={`home-birthday ${birthday ? 'has-birthday' : ''}`}>
        {people.isLoading ? <p role="status">Finding birthdays…</p> : people.error ? <p role="alert">Couldn’t load people. <button onClick={()=>people.refetch()}>Try again</button></p> : birthday && person ? <><div className="home-eyebrow">Next birthday · {birthday.days} days</div><span className="birthday-cake" aria-hidden="true">🎂</span><h2>{birthday.age===10 ? 'Double digits' : `A big day`}<br/>for {person.display_name.split(' ')[0]}.</h2><p>{format(birthday.date,'MMMM d')} · Turning {birthday.age}</p><Link className="home-white" href={`/people/${person.id}`}>Plan a little magic →</Link><Link className="birthday-mobile" href={`/people/${person.id}`}><span>🎂 &nbsp; {person.display_name.split(' ')[0]} turns {birthday.age} · {format(birthday.date,'MMM d')}</span><strong>{birthday.days} days →</strong></Link></> : <><div className="home-eyebrow">Start with someone you love</div><span className="birthday-cake" aria-hidden="true">🎂</span><h2>Who’s on<br/>your gift list?</h2><p>A name is all you need to start.</p><Link className="home-white" href="/people/new">Add a person →</Link></>}
      </section>
    </div>
    <div className="home-dashboard-grid"><IdeaInbox onAdd={()=>setCapture(true)}/>{!loading && !error && <BudgetCard event={event}/>}<RecentActivity/>
      <section className="home-card home-people"><SectionHeader title={<><span className="desktop-copy">Your favourite people</span><span className="phone-copy">Your people</span></>} action={<Link href="/people">View all →</Link>}/>
        {people.isLoading ? <p role="status">Gathering your people…</p> : people.error ? <p role="alert">Couldn’t load people. <button onClick={()=>people.refetch()}>Try again</button></p> : people.data?.items.length ? <AvatarCarousel people={people.data.items.map(p=>({id:String(p.id),display_name:p.display_name.split(' ')[0],avatarUrl:p.photo_url,giftCount:0}))} onPersonClick={id=>router.push(`/people/${id}`)}/> : <div className="home-empty"><h3>Your favourite people belong here.</h3><p>Start with one. The little details can wait.</p><Link href="/people/new" className="home-link">Add your first person →</Link></div>}
      </section>
      {nudge && <section className="home-card home-nudge"><div className="home-eyebrow">A friendly nudge</div><h2>A little more {nudge.display_name.split(' ')[0]}?</h2><p>One tiny detail. One less return later.</p><Link className="home-white" href={`/people/${nudge.id}/profile`}>Finish {nudge.display_name.split(' ')[0]}’s profile →</Link></section>}
    </div>
    <QuickAddModal isOpen={capture} onClose={()=>setCapture(false)}/>
  </div>;
}
