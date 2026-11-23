/** Together Bow: canonical geometry from the owner's logo-3.svg and logo-3-icon.svg.
 * Shell colors follow the existing html holiday attribute; image routes use fixed fills.
 */
export function BrandMark({ size = 35, className = '', icon = false }: {
  size?: number;
  className?: string;
  icon?: boolean;
}) {
  return <svg className={`brand-mark ${className}`} width={size} height={size}
    viewBox="0 0 96 96" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    {icon && <rect className="brand-icon-background" width="96" height="96" rx="23" fill="#ffd1df" />}
    <g transform={icon ? 'translate(10 10) scale(.7916667)' : undefined}>
      <g className="brand-bow" fill="#354de8">
        <circle cx="29" cy="19" r="9" />
        <circle cx="67" cy="19" r="9" />
        <path d="M12 46c0-21 22-23 36-5 14-18 36-16 36 5v7H12Z" />
        <path d="M17 60h62v18a7 7 0 0 1-7 7H24a7 7 0 0 1-7-7Z" />
      </g>
      <path fill="#ffdf70" d="M42 60h12v25H42Z" />
    </g>
  </svg>;
}
