import { SVGProps, memo } from "react";
const SvgLinkedinIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M4.75 7.75a3 3 0 0 1 3-3h8.5a3 3 0 0 1 3 3v8.5a3 3 0 0 1-3 3h-8.5a3 3 0 0 1-3-3v-8.5Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.75 16.25V14a2.25 2.25 0 0 1 4.5 0v2.25M10.75 11.75v4.5M7.75 11.75v4.5M7.75 8.75v.5"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgLinkedinIcon);
export default Memo;
