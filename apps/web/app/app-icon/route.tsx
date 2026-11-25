import { ImageResponse } from 'next/og';
import { BrandMark } from '@/components/ui/BrandMark';
export const dynamic = 'force-static';
export function GET() {
  return new ImageResponse(<BrandMark icon size={512} />, { width: 512, height: 512 });
}
