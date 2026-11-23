import { render,screen,fireEvent } from '@testing-library/react';
import { expect,it,vi } from 'vitest';
import { ProfilePrompts } from '../ProfileOverview';
const {mutate}=vi.hoisted(()=>({mutate:vi.fn()}));
vi.mock('@/hooks/usePersons',()=>({useUpdatePerson:()=>({mutate})}));
vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn()})}));
it('opens only the missing field and patches it without overwriting existing details',()=>{render(<ProfilePrompts person={{id:3,display_name:'Juno',notes:'Keep this note',size_profile:[{type:'Shoes',value:'5'}]} as any}/>);expect(screen.queryByRole('button',{name:/What size/})).toBeNull();fireEvent.click(screen.getByRole('button',{name:/What’s Juno into/}));fireEvent.change(screen.getByLabelText('What’s Juno into?'),{target:{value:'Drawing, Space'}});fireEvent.click(screen.getByText('Save'));expect(mutate.mock.calls[0][0]).toEqual({interests:['Drawing','Space']});});
