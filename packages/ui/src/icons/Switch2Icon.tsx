import { SVGProps, memo } from "react";
const SvgSwitch2Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M8.25 11.25 4.75 8l3.5-3.25M4.75 8h10.5M15.75 12.75l3.5 3.25-3.5 3.25M19.25 16H8.75"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgSwitch2Icon);
export default Memo;
