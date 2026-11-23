import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PersonQuickCreateModal } from '../PersonQuickCreateModal';
import { stickerImage, stickers, stickerColors } from '@/components/people/PersonCreator';
const {mutate,push}=vi.hoisted(()=>({mutate:vi.fn(),push:vi.fn()}));
let pending=false;
vi.mock('next/navigation',()=>({useRouter:()=>({push})}));
vi.mock('@/hooks/usePersons',()=>({useCreatePerson:()=>({mutate,isPending:pending})}));
vi.mock('@/components/common/GroupMultiSelect',()=>({GroupMultiSelect:()=> <div>Groups</div>}));
vi.mock('@/components/ui/image-picker',()=>({ImagePicker:({value,onChange}:any)=><input aria-label="Photo URL" value={value||''} onChange={e=>onChange(e.target.value)}/>}));
const close=vi.fn(),success=vi.fn();
function setup(){return render(<PersonQuickCreateModal isOpen onClose={close} onSuccess={success}/>);}
function name(){fireEvent.change(screen.getByLabelText(/Their name/),{target:{value:'Juno'}});}
function next(){fireEvent.click(screen.getByRole('button',{name:'Continue →'}));}
beforeEach(()=>{vi.clearAllMocks();pending=false;mutate.mockImplementation((data,opts)=>opts.onSuccess({id:3,...data}));});
describe('person creator replaces the quick form',()=>{
 it('renders when open',()=>{setup();expect(screen.getByRole('heading',{name:'Who’s joining the gift list?'})).toBeVisible();});
 it('does not render when closed',()=>{render(<PersonQuickCreateModal isOpen={false} onClose={close}/>);expect(screen.queryByRole('dialog')).toBeNull();});
 it('shows fields screen by screen',()=>{setup();expect(screen.queryByLabelText('Photo URL')).toBeNull();name();next();expect(screen.getByLabelText('Photo URL')).toBeVisible();next();expect(screen.getByLabelText('Birthday (optional)')).toBeVisible();next();expect(screen.getByLabelText('Interests')).toBeVisible();});
 it('requires display name',()=>{setup();expect(screen.getByLabelText(/Their name/)).toBeRequired();});
 it('submits valid data and shows a done screen',()=>{setup();name();next();next();next();fireEvent.change(screen.getByLabelText('Interests'),{target:{value:'Drawing, Dinosaurs'}});fireEvent.click(screen.getByText('Create their profile →'));expect(mutate.mock.calls[0][0].interests).toEqual(['Drawing','Dinosaurs']);expect(screen.getByText('Juno’s in!')).toBeVisible();expect(success).toHaveBeenCalledOnce();expect(close).not.toHaveBeenCalled();fireEvent.click(screen.getByText('Open their profile →'));expect(push).toHaveBeenCalledWith('/people/3/profile');});
 it('omits optional fields for name-only skip',()=>{setup();name();next();fireEvent.click(screen.getByText('Skip and create'));expect(mutate.mock.calls[0][0]).toEqual({display_name:'Juno'});});
 it('shows loading state during submission',()=>{pending=true;setup();expect(screen.getByRole('button',{name:/Continue/})).toBeDisabled();});
 it('disables submission when pending',()=>{setup();name();next();pending=true;fireEvent.click(screen.getByLabelText('Choose 🦊'));expect(screen.getByText('Skip and create')).toBeDisabled();});
 it('disables continue when name empty',()=>{setup();expect(screen.getByText('Continue →')).toBeDisabled();});
 it('enables continue for a name',()=>{setup();name();expect(screen.getByText('Continue →')).toBeEnabled();});
 it('shows API error on the field’s step',()=>{mutate.mockImplementation((d,o)=>o.onError(new Error('Invalid birthdate')));setup();name();next();next();next();fireEvent.click(screen.getByText('Skip and create'));expect(screen.getByLabelText('Birthday (optional)')).toBeVisible();expect(screen.getByRole('alert')).toHaveTextContent('Invalid birthdate');});
 it('resets when closed',()=>{const view=setup();name();view.rerender(<PersonQuickCreateModal isOpen={false} onClose={close}/>);view.rerender(<PersonQuickCreateModal isOpen onClose={close}/>);expect(screen.getByLabelText(/Their name/)).toHaveValue('');});
 it('cancel closes',()=>{setup();fireEvent.click(screen.getByText('Cancel'));expect(close).toHaveBeenCalledOnce();});
 it('prevents close when pending',()=>{pending=true;setup();fireEvent.click(screen.getByLabelText('Close dialog'));expect(close).not.toHaveBeenCalled();});
 it('focuses the first field and keeps back input',()=>{setup();expect(screen.getByLabelText(/Their name/)).toHaveFocus();name();next();fireEvent.click(screen.getByText('← Back'));expect(screen.getByLabelText(/Their name/)).toHaveValue('Juno');expect(screen.getByLabelText(/Their name/)).toHaveFocus();});
 it('allows any relationship rather than restricting the family',()=>{setup();name();fireEvent.change(screen.getByLabelText(/Relationship/),{target:{value:'Grandparent'}});next();fireEvent.click(screen.getByText('Skip and create'));expect(mutate.mock.calls[0][0].relationship).toBe('Grandparent');});
 it('uses the shared touch-target button primitive',()=>{setup();expect(screen.getByText('Continue →').className).toContain('min-h-');});
 it('photo replaces sticker and sticker replaces photo',()=>{setup();name();next();fireEvent.click(screen.getByLabelText('Choose 🦊'));fireEvent.change(screen.getByLabelText('Photo URL'),{target:{value:'/uploads/photo.png'}});fireEvent.click(screen.getByText('Skip and create'));expect(mutate.mock.calls[0][0].photo_url).toBe('/uploads/photo.png');fireEvent.click(screen.getByText('Add another person'));name();next();fireEvent.change(screen.getByLabelText('Photo URL'),{target:{value:'/uploads/photo.png'}});fireEvent.click(screen.getByLabelText('Choose 🦕'));fireEvent.click(screen.getByText('Skip and create'));expect(mutate.mock.calls[1][0].photo_url).toBe(stickerImage('🦕',stickerColors[0]));});
 it('sticker images fit the existing 500 character photo field',()=>{for(const s of stickers)for(const c of stickerColors)expect(stickerImage(s,c).length).toBeLessThanOrEqual(500);expect(stickerImage('<script>','red')).toBe('');});
 it('Enter form submission advances without creating early',()=>{setup();name();fireEvent.submit(screen.getByLabelText(/Their name/).closest('form')!);expect(screen.getByLabelText('Photo URL')).toBeVisible();expect(mutate).not.toHaveBeenCalled();});
});
