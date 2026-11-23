'use client';
import { Avatar, AvatarFallback, AvatarImage, getInitials } from './avatar';
export function StickerAvatar({ name, photo, emoji }: { name: string; photo?: string; emoji?: string }) {
  return <Avatar className="sticker-avatar" ariaLabel={name}>
    {photo && <AvatarImage src={photo} alt={name} />}
    <AvatarFallback>{emoji || getInitials(name)}</AvatarFallback>
  </Avatar>;
}
