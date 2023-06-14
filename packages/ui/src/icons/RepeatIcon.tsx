import { SVGProps, memo } from "react";
const SvgRepeatIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M16.75 4.75 19.25 7l-2.5 2.25M7.25 19.25 4.75 17l2.5-2.25"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 7H9.75a5 5 0 0 0-5 5v.25M5.75 17h8.5a5 5 0 0 0 5-5v-.25"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgRepeatIcon);
export default Memo;
