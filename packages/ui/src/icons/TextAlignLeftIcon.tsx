import { SVGProps, memo } from "react";
const SvgTextAlignLeftIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M4.75 5.75h9.5M4.75 18.25h9.5M4.75 12h14.5"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgTextAlignLeftIcon);
export default Memo;
