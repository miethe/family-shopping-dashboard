 'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusPill, type GiftStatus } from '@/components/ui/status-pill';
import { StatusButton } from './StatusButton';
import { ListPickerDropdown } from './ListPickerDropdown';
import { PriceEditDialog } from './PriceEditDialog';
import { PersonDropdown } from '@/components/common/PersonDropdown';
import { LinkedEntityIcons, type LinkedPerson, type LinkedList } from './LinkedEntityIcons';
import type { ListItemInfo } from './QuickPurchaseButton';
import { GiftQuickPurchaseButton } from './GiftQuickPurchaseButton';
import { useUpdateGift, useAttachPeopleToGift } from '@/hooks/useGifts';
import { useToast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils';
import type { Gift } from '@/types';
export interface GiftCardProps {
  gift: Gift & {
    status?: GiftStatus;
    assignee?: {
      name: string;
      avatarUrl?: string;
    };
    // NEW: Add these for the new components
    recipients?: LinkedPerson[];  // For LinkedEntityIcons
    lists?: LinkedList[];         // For LinkedEntityIcons
    list_items?: ListItemInfo[];  // For QuickPurchaseButton (from API)
  };
  onOpenDetail?: (giftId: string) => void;
  /** Whether bulk selection mode is active */
  selectionMode?: boolean;
  /** Whether this gift is currently selected */
  isSelected?: boolean;
  /** Callback when selection checkbox is toggled */
  onToggleSelection?: () => void;
  /** NEW: Callback when status chip is clicked */
  onStatusFilter?: (status: GiftStatus) => void;
  /** NEW: Callback when recipient icon is clicked */
  onRecipientClick?: (personId: number) => void;
  /** NEW: Callback when list icon is clicked */
  onListClick?: (listId: number) => void;
}


export function GiftCard({gift,onOpenDetail,selectionMode=false,isSelected=false,onToggleSelection,onStatusFilter,onRecipientClick,onListClick}:GiftCardProps) {
 const router=useRouter();const update=useUpdateGift(gift.id);const attach=useAttachPeopleToGift(gift.id);const {toast}=useToast();const [price,setPrice]=useState(false);const [recipient,setRecipient]=useState(false);
 const change=(data:Parameters<typeof update.mutate>[0])=>update.mutate(data,{onError:e=>toast({title:'Couldn’t update gift',description:e.message,variant:'error'})});
 const open=()=>selectionMode?onToggleSelection?.():onOpenDetail?onOpenDetail(String(gift.id)):router.push(`/gifts/${gift.id}`);
 return <article className="club-gift-card" data-selected={isSelected}>
   <button className={`club-gift-art ${gift.status==='purchased'&&!gift.image_url?'is-wrapped':''}`} onClick={open} aria-label={selectionMode?`Select ${gift.name}`:`Open ${gift.name}`} aria-pressed={selectionMode?isSelected:undefined}>
     {gift.image_url?<img src={gift.image_url} alt=""/>:<span aria-hidden="true">🎁</span>}{gift.from_santa&&<small aria-label="This gift is from Santa">🎅</small>}{selectionMode&&<b aria-hidden="true">{isSelected?'✓':'○'}</b>}
   </button>
   <div className="club-gift-copy"><h3><button onClick={open}>{gift.name}</button></h3><div className="club-gift-meta"><button onClick={()=>setPrice(true)} aria-label={`Edit price: ${gift.price!=null?'$'+formatPrice(gift.price):'Not set'}`}>{gift.price!=null?'$'+formatPrice(gift.price):'Price not set'}</button>{onStatusFilter?<button aria-label={`Filter by status: ${gift.status||'idea'}`} onClick={()=>onStatusFilter(gift.status||'idea')}><StatusPill status={gift.status||'idea'} size="sm"/></button>:<StatusPill status={gift.status||'idea'} size="sm"/>}</div>
   {!!(gift.recipients?.length||gift.lists?.length)&&<LinkedEntityIcons recipients={gift.recipients||[]} lists={gift.lists||[]} maxVisible={3} onRecipientClick={onRecipientClick} onListClick={onListClick} size="sm"/>}
   {gift.notes&&<p className="club-gift-location">⌖ {gift.notes}</p>}
   </div>
   {!selectionMode&&<details className="club-gift-actions"><summary>Gift actions</summary><div><StatusButton giftId={gift.id} currentStatus={gift.status||'idea'}/><Button variant="outline" onClick={()=>setRecipient(!recipient)}>Assign recipient</Button><ListPickerDropdown giftId={gift.id} currentListIds={gift.list_items?.map(i=>i.list_id)||[]}/><Button variant="ghost" aria-pressed={!!gift.from_santa} disabled={update.isPending} onClick={()=>change({from_santa:!gift.from_santa})}>{gift.from_santa?'Unmark as from Santa':'Mark as from Santa'}</Button>{gift.status!=='purchased'&&gift.status!=='received'&&<GiftQuickPurchaseButton giftId={gift.id} currentStatus={gift.status} onPurchase={()=>change({status:'purchased'})} isPending={update.isPending}/>}{gift.url&&/^https?:\/\//i.test(gift.url)&&<a href={gift.url} target="_blank" rel="noopener noreferrer">Store link ↗</a>}</div>{recipient&&<PersonDropdown value={gift.person_ids?.[0]||null} onChange={id=>{if(typeof id==='number')attach.mutate([id],{onSuccess:()=>setRecipient(false),onError:e=>toast({title:'Couldn’t assign recipient',description:e.message,variant:'error'})});}} allowNew={false}/>}</details>}
   <PriceEditDialog open={price} onOpenChange={setPrice} giftId={gift.id} currentPrice={gift.price}/>
 </article>;
}
