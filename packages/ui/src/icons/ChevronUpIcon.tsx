import { SVGProps, memo } from "react";
const SvgChevronUpIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15.25 14.25 12 10.75l-3.25 3.5"
    />
  </svg>
);
const Memo = memo(SvgChevronUpIcon);
export default Memo;
