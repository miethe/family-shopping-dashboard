import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Home } from '../Home';
import { majorEvent, nextBirthday, daysUntil } from '../home-data';
import type { Occurrence } from '@/lib/api/gifting';
import type { Person, Occasion } from '@/types';
import type { Holiday } from '@/lib/api/holidays';
const state=vi.hoisted(()=>({events:[] as Occurrence[],people:[] as Person[],occasions:[] as Occasion[],holidays:[] as Holiday[],ideas:[] as any[],error:null as Error|null,loading:false,refetch:vi.fn()}));
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>({user:{email:'sam@example.test'}})}));
vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn()})}));
vi.mock('@/hooks/useGifting',()=>({useOccurrences:()=>({data:state.events,error:state.error,isLoading:state.loading,refetch:state.refetch}),useGiftingIdeas:()=>({data:state.ideas,isLoading:false,error:null})}));
vi.mock('@/hooks/usePersons',()=>({usePersons:()=>({data:{items:state.people},isLoading:false})}));
vi.mock('@/hooks/useOccasions',()=>({useOccasions:()=>({data:{items:state.occasions},isLoading:false,refetch:state.refetch})}));
vi.mock('@tanstack/react-query',()=>({useQuery:()=>({data:state.holidays,isLoading:false,refetch:state.refetch})}));
vi.mock('@/hooks/useActivity',()=>({useRecentActivity:()=>({data:{events:[]},isLoading:false})}));
vi.mock('@/components/quick-add',()=>({QuickAddModal:({isOpen,onClose}:any)=>isOpen ? <div role="dialog"><button onClick={onClose}>Close capture</button></div>:null}));
function event(id:number,date:string,name='Christmas'):Occurrence {return {id,occasion_id:id,name,date,closed:false,budget_total:'600',spent:'342',planned:'400',allocated:'600',remaining_money:'258',purchased_count:8,unknown_prices:0,phases:{considering:6,bought:5,in_hand:3,given:0},envelopes:[]};}
beforeEach(()=>{state.events=[];state.people=[];state.occasions=[];state.holidays=[];state.ideas=[];state.error=null;state.loading=false;});
describe('Confetti Home',()=>{
 it('greets the person without rejected brand decoration',()=>{render(<Home/>);expect(screen.getByRole('heading',{level:1})).toHaveTextContent(/^Hello, Sam$/);});
 it('offers three real first steps without invented totals',()=>{render(<Home/>);expect(screen.getByRole('link',{name:'Add an event →'})).toHaveAttribute('href','/events');expect(screen.getByRole('link',{name:'Add a person →'})).toHaveAttribute('href','/people/new');fireEvent.click(screen.getByRole('button',{name:'Save your first idea →'}));expect(screen.getByRole('dialog')).toBeVisible();fireEvent.click(screen.getByText('Close capture'));expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(screen.queryByText(/gifts bought/)).not.toBeInTheDocument();});
 it('selects the nearest major saved event, skipping closed and past events',()=>{
   const now=new Date(2026,10,23);const events=[event(1,'2026-11-26','Thanksgiving'),event(2,'2026-12-25'),{...event(3,'2026-11-24'),closed:true},event(4,'2025-12-25')];
   const occasions=[{id:2,holiday_id:9},{id:3,holiday_id:9},{id:4,holiday_id:9}] as Occasion[];
   expect(majorEvent(events,occasions,[{id:9,is_major:true}] as Holiday[],now)?.id).toBe(2);
   expect(majorEvent(events,occasions,[],now)).toBeUndefined();
 });
 it('uses API money and counts, and keeps the plan reachable',()=>{state.events=[event(2,'2099-12-25')];render(<Home/>);expect(screen.getByText('8 of 14 gifts bought')).toBeVisible();expect(screen.getByText('$342')).toBeVisible();expect(screen.getByRole('link',{name:'Open plan →'})).toHaveAttribute('href','/events/2');expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeCloseTo(57);});
 it('does not portray missing budgets as zero budgets',()=>{state.events=[{...event(2,'2099-12-25'),budget_total:null}];render(<Home/>);expect(screen.getByText('Set a budget →')).toBeVisible();expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();});
 it('handles zero and exceeded budgets without invalid percentages',()=>{state.events=[{...event(2,'2099-12-25'),budget_total:'0'}];render(<Home/>);expect(screen.getByText(/over budget/)).toBeVisible();expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow','0');});
 it('distinguishes a failed request from an empty family',()=>{state.error=new Error('offline');render(<Home/>);expect(screen.getByRole('alert')).toHaveTextContent('couldn’t load');expect(screen.queryByText('Add an event →')).not.toBeInTheDocument();fireEvent.click(screen.getByText('Try again'));expect(state.refetch).toHaveBeenCalled();});
 it('does not show empty-event onboarding while loading',()=>{state.loading=true;render(<Home/>);expect(screen.getByRole('status')).toHaveTextContent('Finding');expect(screen.queryByText('Add an event →')).not.toBeInTheDocument();});
 it('uses birthdays across year boundaries and handles leap day',()=>{const people=[{id:1,display_name:'Juno',birthdate:'2016-12-12'},{id:2,display_name:'Milo',birthdate:'2020-02-29'}] as Person[];expect(nextBirthday(people,new Date(2026,11,13))?.person.id).toBe(2);expect(nextBirthday(people,new Date(2027,1,28))?.days).toBe(0);expect(nextBirthday(people,new Date(2027,1,28))?.age).toBe(7);expect(daysUntil('2026-12-25',new Date(2026,11,24,23,59))).toBe(1);});
 it('does not invent a birthday or nudge a complete profile',()=>{state.people=[{id:1,display_name:'Juno',interests:['Art'],sizes:{shoes:'3'},created_at:'2026-11-01T12:00:00Z',updated_at:'2026-11-01T12:00:00Z'} as Person];render(<Home/>);expect(screen.queryByText(/Next birthday/)).not.toBeInTheDocument();expect(screen.queryByText('A friendly nudge')).not.toBeInTheDocument();});
});
