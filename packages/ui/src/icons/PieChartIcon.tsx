import { SVGProps, memo } from "react";
const SvgPieChartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <circle
      cx={12}
      cy={12}
      r={7.25}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11.75 5v5.25a2 2 0 0 0 2 2H19"
    />
  </svg>
);
const Memo = memo(SvgPieChartIcon);
export default Memo;
