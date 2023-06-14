import { SVGProps, memo } from "react";
const SvgArrowUpRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17.25 15.25v-8.5h-8.5M17 7 6.75 17.25"
    />
  </svg>
);
const Memo = memo(SvgArrowUpRightIcon);
export default Memo;
