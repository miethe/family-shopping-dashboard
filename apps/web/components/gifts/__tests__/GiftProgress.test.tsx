import { render,screen,fireEvent } from '@testing-library/react';
import { expect,it,vi } from 'vitest';
import { GiftProgress } from '../GiftProgress';
const {mutate}=vi.hoisted(()=>({mutate:vi.fn()}));
vi.mock('@/hooks/useGifts',()=>({useUpdateGift:()=>({mutate})}));
vi.mock('../StatusButton',()=>({StatusButton:()=> <button>Change status</button>}));
it('edits location notes without changing other gift fields',()=>{render(<GiftProgress gift={{id:1,status:'purchased',notes:'Hall closet'} as any}/>);expect(screen.getByText('Purchased')).toHaveAttribute('data-current','true');fireEvent.click(screen.getByText('Edit notes'));expect(screen.getByLabelText('Where it is / notes')).toHaveValue('Hall closet');fireEvent.change(screen.getByLabelText('Where it is / notes'),{target:{value:'Top shelf'}});fireEvent.click(screen.getByText('Save notes'));expect(mutate.mock.calls[0][0]).toEqual({notes:'Top shelf'});});
