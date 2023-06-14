import { SVGProps, memo } from "react";
const SvgChevronRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m10.75 8.75 3.5 3.25-3.5 3.25"
    />
  </svg>
);
const Memo = memo(SvgChevronRightIcon);
export default Memo;
