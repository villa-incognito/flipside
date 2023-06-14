import { SVGProps, memo } from "react";
const SvgChartIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.75 6.75a2 2 0 0 1 2-2h10.5a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H6.75a2 2 0 0 1-2-2V6.75ZM8.75 15.25v-5.5M15.25 15.25v-5.5M12 15.25v-2.5"
    />
  </svg>
);
const Memo = memo(SvgChartIcon);
export default Memo;
