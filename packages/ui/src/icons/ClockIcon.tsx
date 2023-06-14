import { SVGProps, memo } from "react";
const SvgClockIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <circle cx={12} cy={12} r={7.25} stroke="currentColor" strokeWidth={1.5} />
    <path stroke="currentColor" strokeWidth={1.5} d="M12 8v4l2 2" />
  </svg>
);
const Memo = memo(SvgClockIcon);
export default Memo;
