import { SVGProps, memo } from "react";
const SvgMaximize2Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M4.75 14.75v4.5h4.5M19.25 9.25v-4.5h-4.5M5 19l5.25-5.25M19 5l-5.25 5.25"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgMaximize2Icon);
export default Memo;
