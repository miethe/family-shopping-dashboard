'use client';
import Link from 'next/link';
import { StickerAvatar } from '@/components/ui/sticker-avatar';
import { formatDateCustom, getAge } from '@/lib/date-utils';
import { useGiftsByPerson } from '@/hooks/useGifts';
import type { Person } from '@/types';
export interface PersonCardProps { person: Person }
export function PersonCard({person}:PersonCardProps) {
  const gifts=useGiftsByPerson(person.id);
  const birthday=person.birthdate?formatDateCustom(person.birthdate,{month:'short',day:'numeric'}):null;
  return <Link href={`/people/${person.id}/profile`} className="club-person-card" aria-label={`View details for ${person.display_name}`}>
    <StickerAvatar name={person.display_name} photo={person.photo_url}/><span className="person-arrow" aria-hidden="true">↗</span>
    <h3>{person.display_name}</h3><p>{person.relationship || (person.birthdate?`${getAge(person.birthdate)} years old`:'Your person')}{birthday&&<> · {birthday}</>}</p>
    {!!person.groups?.length&&<div className="person-group-chips">{person.groups.map(g=><span key={g.id}>{g.name}</span>)}</div>}
    <div className="person-card-foot"><span>{gifts.data?`${gifts.data.items.length} gift ideas`:'Gift ideas'}</span><span>View →</span></div>
  </Link>;
}
