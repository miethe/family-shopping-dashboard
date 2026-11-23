/** Single replacement point for the shell and generated app icons. */
export function BrandMark({ size = 35, className }: { size?: number; className?: string }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="13" fill="#354de8" />
    <g stroke="#ffdf70" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 17h20v5H10zM12 22v10h16V22M20 17v15M20 17c-10 0-9-10-4-7 2 1 4 7 4 7Zm0 0c10 0 9-10 4-7-2 1-4 7-4 7Z" />
    </g>
  </svg>;
}
