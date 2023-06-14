import { SVGProps, memo } from "react";
const SvgCodeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <rect
      width={14.5}
      height={14.5}
      x={4.75}
      y={4.75}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      rx={2}
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m8.75 10.75 2.5 2.25-2.5 2.25"
    />
  </svg>
);
const Memo = memo(SvgCodeIcon);
export default Memo;
