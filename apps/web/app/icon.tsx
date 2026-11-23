import { ImageResponse } from 'next/og';
import { BrandMark } from '@/components/ui/BrandMark';
export const size = { width: 192, height: 192 };
export const contentType = 'image/png';
export default function Icon() { return new ImageResponse(<BrandMark icon size={192} />, size); }
