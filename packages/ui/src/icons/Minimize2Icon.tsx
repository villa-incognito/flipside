import { SVGProps, memo } from "react";
const SvgMinimize2Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M10.25 18.25v-4.5h-4.5M13.75 5.75v4.5h4.5M4.75 19.25l5.5-5.5M19.25 4.75l-5.5 5.5"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgMinimize2Icon);
export default Memo;
