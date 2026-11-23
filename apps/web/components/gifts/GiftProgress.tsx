'use client';
import { useState } from 'react';
import { useUpdateGift } from '@/hooks/useGifts';
import { StatusButton } from './StatusButton';
import { Button } from '@/components/ui/button';
import type { Gift } from '@/types';
export function GiftProgress({gift}:{gift:Gift}) {
 const [editing,setEditing]=useState(false);const [notes,setNotes]=useState(gift.notes||'');const [error,setError]=useState('');const update=useUpdateGift(gift.id);
 return <section className="club-gift-progress"><div className="club-status-rail">{['idea','selected','purchased','received'].map((s,i)=><span key={s} data-current={gift.status===s}><i>{['idea','selected','purchased','received'].indexOf(gift.status||'idea')>=i?'✓':i+1}</i>{s.charAt(0).toUpperCase()+s.slice(1)}</span>)}</div><StatusButton giftId={gift.id} currentStatus={gift.status||'idea'}/><div className="club-detail-note"><div className="flex justify-between items-center gap-2"><h2>⌖ Where it is / notes</h2><Button variant="ghost" onClick={()=>{setNotes(gift.notes||'');setEditing(true);}}>Edit notes</Button></div>{editing?<form onSubmit={e=>{e.preventDefault();update.mutate({notes:notes.trim()||null},{onSuccess:()=>{setEditing(false);setError('');},onError:e=>setError(e.message)});}}><textarea aria-label="Where it is / notes" autoFocus value={notes} onChange={e=>setNotes(e.target.value)} rows={3}/><Button type="submit" disabled={update.isPending}>Save notes</Button><Button type="button" variant="ghost" onClick={()=>setEditing(false)}>Cancel</Button>{error&&<p role="alert">{error}</p>}</form>:<p className="whitespace-pre-wrap">{gift.notes||'On its way? In a hiding place? Leave yourself a little clue.'}</p>}</div></section>;
}
