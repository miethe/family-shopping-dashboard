'use client';
import { useState } from 'react';
import { useRecentActivity } from '@/hooks/useActivity';
import { formatTimeAgo } from '@/lib/date-utils';
import { SectionHeader } from '@/components/ui/section-header';
export function RecentActivity() {
  const {data,isLoading,error,refetch}=useRecentActivity({limit:10});
  const [expanded,setExpanded]=useState(false);
  const events=data?.events || [];
  return <section className={`home-card home-activity ${expanded ? 'is-expanded' : ''}`}>
    <SectionHeader title="Little updates" action={events.length>1 && <button onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? 'Show less' : 'Show more updates'} →</button>}/>
    {isLoading ? <p role="status">Catching up…</p> : error ? <p role="alert">Couldn’t load updates. <button onClick={()=>refetch()}>Try again</button></p> : !events.length ? <div className="home-empty"><span aria-hidden="true">♡</span><h3>The good things start here.</h3><p>Saved ideas and little victories will appear as you go.</p></div> : events.slice(0,expanded ? 10 : 3).map(event=><div className="home-activity-row" key={event.id}><i aria-hidden="true"/><div><p>{event.description}</p><small>{formatTimeAgo(event.created_at)}</small></div></div>)}
  </section>;
}
