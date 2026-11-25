import { render,screen } from '@testing-library/react';
import { describe,it,expect } from 'vitest';
import { CountdownDoor } from '../countdown-door';
import { StickerAvatar } from '../sticker-avatar';
import { BrandMark } from '../BrandMark';
describe('Confetti primitives',()=>{
 it('never counts negative sleeps',()=>{render(<CountdownDoor days={-3}/>);expect(screen.getByLabelText('Today')).toHaveTextContent('0today!');});
 it('uses initials when there is no saved illustration',()=>{render(<StickerAvatar name="Sam Hartwell"/>);expect(screen.getByText('SH')).toBeVisible();});
 it('accepts a sticker without requiring a photo',()=>{render(<StickerAvatar name="Juno" emoji="🦊"/>);expect(screen.getByText('🦊')).toBeVisible();});
 it('renders the Together Bow mark as an accessible decorative SVG',()=>{const {container}=render(<BrandMark size={180}/>);expect(container.querySelector('svg')).toHaveAttribute('aria-hidden','true');expect(container.querySelector('svg')).toHaveAttribute('width','180');expect(container.textContent).not.toContain('✳');});
 it('uses the icon silhouette and safe inset for installed app icons',()=>{const {container}=render(<BrandMark icon size={512}/>);expect(container.querySelector('svg')).toHaveAttribute('viewBox','0 0 96 96');expect(container.querySelector('rect')).toHaveAttribute('fill','#ffd1df');expect(container.querySelector('g')).toHaveAttribute('transform','translate(10 10) scale(.7916667)');});
});
