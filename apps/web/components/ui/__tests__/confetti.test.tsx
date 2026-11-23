import { render,screen } from '@testing-library/react';
import { describe,it,expect } from 'vitest';
import { CountdownDoor } from '../countdown-door';
import { StickerAvatar } from '../sticker-avatar';
import { BrandMark } from '../BrandMark';
describe('Confetti primitives',()=>{
 it('never counts negative sleeps',()=>{render(<CountdownDoor days={-3}/>);expect(screen.getByLabelText('Today')).toHaveTextContent('0today!');});
 it('uses initials when there is no saved illustration',()=>{render(<StickerAvatar name="Sam Hartwell"/>);expect(screen.getByText('SH')).toBeVisible();});
 it('accepts a sticker without requiring a photo',()=>{render(<StickerAvatar name="Juno" emoji="🦊"/>);expect(screen.getByText('🦊')).toBeVisible();});
 it('renders the replaceable gift mark as an accessible decorative SVG',()=>{const {container}=render(<BrandMark size={180}/>);expect(container.querySelector('svg')).toHaveAttribute('aria-hidden','true');expect(container.querySelector('svg')).toHaveAttribute('width','180');expect(container.textContent).not.toContain('✳');});
});
