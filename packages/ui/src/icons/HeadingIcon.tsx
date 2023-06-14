import { SVGProps, memo } from "react";
const SvgHeadingIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M5.75 5.75h1.5m0 0h1m-1 0v6m0 6.5h-1.5m1.5 0h1m-1 0v-6.5m0 0h9.5m0 0v-6m0 6v6.5m1.5-12.5h-1.5m0 0h-1m1 12.5h1.5m-1.5 0h-1"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgHeadingIcon);
export default Memo;
