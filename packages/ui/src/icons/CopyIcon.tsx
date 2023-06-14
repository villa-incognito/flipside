import { SVGProps, memo } from "react";
const SvgCopyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M6.5 15.25v0a1.75 1.75 0 0 1-1.75-1.75V6.75a2 2 0 0 1 2-2h6.75c.966 0 1.75.784 1.75 1.75v0"
    />
    <rect
      width={10.5}
      height={10.5}
      x={8.75}
      y={8.75}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      rx={2}
    />
  </svg>
);
const Memo = memo(SvgCopyIcon);
export default Memo;
