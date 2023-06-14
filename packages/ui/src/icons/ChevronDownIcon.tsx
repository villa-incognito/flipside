import { SVGProps, memo } from "react";
const SvgChevronDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15.25 10.75 12 14.25l-3.25-3.5"
    />
  </svg>
);
const Memo = memo(SvgChevronDownIcon);
export default Memo;
