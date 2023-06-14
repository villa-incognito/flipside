import { SVGProps, memo } from "react";
const SvgStopIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <rect
      width={12.5}
      height={12.5}
      x={5.75}
      y={5.75}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      rx={1}
    />
  </svg>
);
const Memo = memo(SvgStopIcon);
export default Memo;
