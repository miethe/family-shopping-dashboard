'use client';
import Link from 'next/link';
import { useGiftingIdeas } from '@/hooks/useGifting';
import { SectionHeader } from '@/components/ui/section-header';
import { money } from './home-data';
export function IdeaInbox({ onAdd }: { onAdd?: ()=>void }) {
  const {data,isLoading,error,refetch}=useGiftingIdeas();
  return <section className="home-card home-ideas">
    <SectionHeader title="Ideas inbox" action={<Link href="/ideas">{data?.length ? `${data.length} saved` : 'See all'} →</Link>}/>
    {isLoading ? <p role="status">Finding your good ideas…</p> : error ? <p role="alert">Couldn’t load ideas. <button onClick={()=>refetch()}>Try again</button></p> : !data?.length ? <div className="home-empty"><span aria-hidden="true">💡</span><h3>A good thought belongs here.</h3><p>A link, a little hint, something they’d love.</p><button className="home-link" onClick={onAdd}>Save your first idea →</button></div> : data.slice(0,3).map(idea=><Link className="home-idea-row" href="/ideas" key={idea.id}>
      <span className="idea-thumb" aria-hidden="true">🎁</span><span className="idea-copy"><strong>{idea.name}</strong><small>Saved for a good day</small></span><b>{idea.price != null ? money(idea.price) : 'Price later'}</b>
    </Link>)}
  </section>;
}
