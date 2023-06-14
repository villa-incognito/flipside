import { SVGProps, memo } from "react";
const SvgChevronLeftIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13.25 8.75 9.75 12l3.5 3.25"
    />
  </svg>
);
const Memo = memo(SvgChevronLeftIcon);
export default Memo;
