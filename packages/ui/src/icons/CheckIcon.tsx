import { SVGProps, memo } from "react";
const SvgCheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m5.75 12.867 2.59 3.547a2 2 0 0 0 3.26-.043l6.65-9.621"
    />
  </svg>
);
const Memo = memo(SvgCheckIcon);
export default Memo;
