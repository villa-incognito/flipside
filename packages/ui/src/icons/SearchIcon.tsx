import { SVGProps, memo } from "react";
const SvgSearchIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19.25 19.25 15.5 15.5M4.75 11a6.25 6.25 0 1 1 12.5 0 6.25 6.25 0 0 1-12.5 0Z"
    />
  </svg>
);
const Memo = memo(SvgSearchIcon);
export default Memo;
