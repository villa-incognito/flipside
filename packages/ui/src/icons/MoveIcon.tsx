import { SVGProps, memo } from "react";
const SvgMoveIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="m12 4.75-1.25 1.5h2.5L12 4.75ZM12 19.25l-1.25-1.5h2.5L12 19.25ZM19.25 12l-1.5-1.25v2.5l1.5-1.25ZM4.75 12l1.5-1.25v2.5L4.75 12ZM12 5v14.25M19 12H4.75"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgMoveIcon);
export default Memo;
