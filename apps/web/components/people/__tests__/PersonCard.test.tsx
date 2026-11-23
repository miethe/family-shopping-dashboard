import { render,screen } from '@testing-library/react';
import { expect,it,vi } from 'vitest';
import { PersonCard } from '../PersonCard';
vi.mock('@/hooks/useGifts',()=>({useGiftsByPerson:()=>({data:{items:[]}})}));
it('shows group names as chips and links to the profile',()=>{render(<PersonCard person={{id:3,display_name:'Juno',groups:[{id:1,name:'Household',color:'#ffdf70'},{id:2,name:'Family'}]} as any}/>);expect(screen.getByText('Household')).toBeVisible();expect(screen.getByText('Family')).toBeVisible();expect(screen.getByRole('link')).toHaveAttribute('href','/people/3/profile');});
it('does not invent groups or gifts',()=>{render(<PersonCard person={{id:4,display_name:'Wren'} as any}/>);expect(screen.queryByText('Groups:')).toBeNull();expect(screen.getByText('0 gift ideas')).toBeVisible();});
