'use client';
import { StickerAvatar } from '@/components/ui/sticker-avatar';
interface Person { id:string; display_name:string; avatarUrl?:string; emoji?:string; giftCount:number; needsAttention?:boolean }
interface AvatarCarouselProps { people:Person[]; onPersonClick?:(id:string)=>void }
export function AvatarCarousel({people,onPersonClick}:AvatarCarouselProps) {
  return <div className="home-people-strip" tabIndex={0} aria-label="Your people">
    {people.map(person=><button key={person.id} onClick={()=>onPersonClick?.(person.id)} aria-label={`View ${person.display_name}'s profile`}><StickerAvatar name={person.display_name} photo={person.avatarUrl} emoji={person.emoji}/><span>{person.display_name}</span></button>)}
  </div>;
}
export type {Person,AvatarCarouselProps};
