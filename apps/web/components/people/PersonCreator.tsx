'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePicker } from '@/components/ui/image-picker';
import { GroupMultiSelect } from '@/components/common/GroupMultiSelect';
import { useCreatePerson } from '@/hooks/usePersons';
import type { Person, PersonCreate } from '@/types';

export const stickers = ['🦊','🦕','🐥','🌞','🌷','🪩'];
export const stickerColors = ['#ffdf70','#ffd1df','#c7e9d9','#e2e7ff'];
/** A self-contained image in the existing photo field; no remote resource or new schema. */
export function stickerImage(emoji: string, color: string) {
  if (!stickers.includes(emoji) || !stickerColors.includes(color)) return '';
  return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="28" fill="${color}"/><text x="48" y="66" text-anchor="middle" font-size="54">${emoji}</text></svg>`);
}
const titles = ["Who’s joining the gift list?", 'Pick a little personality.', 'When’s their birthday?', 'A few little gift clues?', 'You’re ready for the good stuff.'];
export interface PersonCreatorProps { isOpen: boolean; onClose: () => void; onSuccess?: (person: Person) => void }
export function PersonCreator({isOpen,onClose,onSuccess}: PersonCreatorProps) {
  const router=useRouter(); const create=useCreatePerson();
  const [step,setStep]=useState(0); const [name,setName]=useState(''); const [relationship,setRelationship]=useState(''); const [groups,setGroups]=useState<number[]>([]);
  const [photo,setPhoto]=useState(''); const [emoji,setEmoji]=useState(''); const [color,setColor]=useState(stickerColors[0]);
  const [birthday,setBirthday]=useState(''); const [likes,setLikes]=useState(''); const [size,setSize]=useState(''); const [notes,setNotes]=useState(''); const [constraints,setConstraints]=useState('');
  const [created,setCreated]=useState<Person|null>(null); const [error,setError]=useState('');
  const content=useRef<HTMLDivElement>(null); const saving=useRef(false);
  const reset=()=>{setStep(0);setName('');setRelationship('');setGroups([]);setPhoto('');setEmoji('');setColor(stickerColors[0]);setBirthday('');setLikes('');setSize('');setNotes('');setConstraints('');setCreated(null);setError('');};
  useEffect(()=>{if(!isOpen) reset();},[isOpen]);
  useEffect(()=>{if(isOpen) content.current?.querySelector<HTMLElement>('input,select,textarea,button,[tabindex="-1"]')?.focus();},[step,isOpen]);
  const save=()=>{
    if(saving.current || created) return;
    if(!name.trim()){setStep(0);setError('Start with their name.');return;}
    saving.current=true; setError('');
    const data: PersonCreate={display_name:name.trim(), ...(relationship.trim()?{relationship:relationship.trim()}:{}), ...(groups.length?{group_ids:groups}:{}), ...(photo || emoji?{photo_url:photo || stickerImage(emoji,color)}:{}), ...(birthday?{birthdate:birthday}:{}), ...(likes.trim()?{interests:likes.split(',').map(s=>s.trim()).filter(Boolean)}:{}), ...(size.trim()?{size_profile:[{type:'Clothing',value:size.trim()}]}:{}), ...(notes.trim()?{notes:notes.trim()}:{}), ...(constraints.trim()?{constraints:constraints.trim()}:{})};
    create.mutate(data,{onSuccess:person=>{saving.current=false;setCreated(person);setStep(4);onSuccess?.(person);},onError:(err: Error)=>{saving.current=false;const message=err.message || 'Couldn’t save. Please try again.';setError(message);if(/birth|date/i.test(message))setStep(2);else if(/photo|image/i.test(message))setStep(1);else if(/name|relationship|group/i.test(message))setStep(0);else if(/interest|size|note|constraint/i.test(message))setStep(3);}});
  };
  const advance=()=>{setError('');if(step===0&&!name.trim()){setError('Start with their name.');return;}if(step===3)save();else setStep(step+1);};
  return <Dialog open={isOpen} onOpenChange={open=>{if(!open&&!saving.current&&!create.isPending)onClose();}}><DialogContent className="person-creator" onOpenAutoFocus={e=>{e.preventDefault();content.current?.querySelector<HTMLInputElement>('input')?.focus();}}>
    <aside className="creator-story"><p className="club-eyebrow">Your family</p><h2>Big love.<br/>Little details.</h2><p>A name is all you need to start. We’ll make room for the rest.</p><div aria-hidden="true">🦊 &nbsp; ✦<br/>🎁 &nbsp; 💛</div></aside>
    <div className="creator-main"><div className="creator-bar"><button type="button" disabled={create.isPending} onClick={()=>step>0&&step<4?setStep(step-1):onClose()}>{step>0&&step<4?'← Back':'← People'}</button><span>{step===4?'All done':`${step+1} of 4`}</span></div>
    <div className="creator-progress" aria-label={`Step ${step+1} of 5`}>{[0,1,2,3].map(i=><i key={i} data-active={i<=step}/>)}</div>
    <form className="creator-form" onSubmit={e=>{e.preventDefault();advance();}}>
      <p className="club-eyebrow">{step===0?'A new favourite person':step===4?'One more person to make happy':`Meet ${name}`}</p>
      <DialogTitle>{step===4?`${created?.display_name}’s in!`:titles[step]}</DialogTitle>
      <DialogDescription>{step===0?'Start with a name. Everything else can wait.':step===1?'An icon is perfect. No photo needed.':step===2?'We’ll keep the next celebration in sight. Birthday is optional; a year is needed if you add one.':step===3?'Entirely optional. You can add these from their profile any time.':'The rest can come later. Their profile has a spot for every little detail.'}</DialogDescription>
      <div ref={content} className="creator-fields">
        {step===0&&<><Input label="Their name" required value={name} onChange={e=>setName(e.target.value)} maxLength={100} placeholder="What do you call them?" autoComplete="off"/><Input label="Relationship (optional)" value={relationship} onChange={e=>setRelationship(e.target.value)} maxLength={100} placeholder="Child, parent, friend…"/><div><p className="mb-2 text-sm">Their groups (optional)</p><GroupMultiSelect value={groups} onChange={setGroups}/></div></>}
        {step===1&&<><div className="creator-avatar" style={{background:color}} aria-label="Picture preview">{photo?<img src={photo} alt={name}/>:emoji || name.charAt(0).toUpperCase()}</div><div className="creator-stickers">{stickers.map(s=><button type="button" key={s} aria-label={`Choose ${s}`} aria-pressed={emoji===s&&!photo} onClick={()=>{setEmoji(s);setPhoto('');}}>{s}</button>)}<button type="button" aria-label="Use initial" aria-pressed={!emoji&&!photo} onClick={()=>{setEmoji('');setPhoto('');}}>{name.charAt(0).toUpperCase()}</button></div><div className="creator-colors">{stickerColors.map((c,i)=><button type="button" key={c} style={{background:c}} aria-label={`Sticker color ${i+1}`} aria-pressed={color===c} onClick={()=>setColor(c)}/>)}</div><ImagePicker cropShape="circle" value={photo||null} onChange={url=>{setPhoto(url||'');if(url)setEmoji('');setError('');}} onError={setError} disabled={create.isPending}/></>}
        {step===2&&<><span className="creator-mascot" aria-hidden="true">🎂</span><Input label="Birthday (optional)" type="date" value={birthday} onChange={e=>setBirthday(e.target.value)}/><button type="button" className="creator-skip" onClick={()=>{setBirthday('');setStep(3);}}>Skip birthday →</button></>}
        {step===3&&<>{[{label:'Interests',value:likes,set:setLikes,placeholder:'Dinosaurs, drawing, a very specific phase…'},{label:'Sizes',value:size,set:setSize,placeholder:'Shirt M, shoes 7…'},{label:'Notes',value:notes,set:setNotes,placeholder:'A wish-list link or a helpful little detail'},{label:'Gift constraints',value:constraints,set:setConstraints,placeholder:'Allergies or things to avoid'}].map(f=><div className="creator-extra" key={f.label}><Input label={f.label} value={f.value} onChange={e=>f.set(e.target.value)} maxLength={f.label==='Sizes'?100:2000} placeholder={f.placeholder}/><button type="button" className="creator-skip" onClick={()=>f.set('')}>Skip {f.label.toLowerCase()}</button></div>)}</>}
        {step===4&&<div className="creator-done" tabIndex={-1}><div className="creator-avatar">{photo?<img src={photo} alt=""/>:emoji||name.charAt(0).toUpperCase()}</div><h3>{created?.display_name}</h3><p>{relationship}</p><p>Photo, sizes and interests? Add any time.</p></div>}
        {error&&<p role="alert" className="creator-error">{error}</p>}
      </div>
      <footer className="creator-footer">{step<4?<><Button type="submit" disabled={create.isPending || (step===0&&!name.trim())} isLoading={create.isPending}>{step===3?'Create their profile →':'Continue →'}</Button>{step>0?<Button type="button" variant="ghost" disabled={create.isPending} onClick={save}>Skip and create</Button>:<Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>}</>:<><Button type="button" onClick={()=>{onClose();router.push(`/people/${created?.id}/profile`);}}>Open their profile →</Button><Button type="button" variant="ghost" onClick={reset}>Add another person</Button></>}</footer>
    </form></div>
  </DialogContent></Dialog>;
}
