import {render,screen,fireEvent} from '@testing-library/react';
import {expect,it,vi} from 'vitest';
import {Header} from '../Header';
vi.mock('@/hooks/useAuth',()=>({useAuth:()=>({user:null})}));
vi.mock('@/components/quick-add',()=>({QuickAddModal:({isOpen}:any)=>isOpen?<div role="dialog">Save an idea</div>:null}));
it('opens idea capture in one tap from the shared phone header',()=>{render(<Header/>);fireEvent.click(screen.getByRole('button',{name:'Add an idea'}));expect(screen.getByRole('dialog')).toHaveTextContent('Save an idea');});
