import { SVGProps, memo } from "react";
const SvgAppsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M4.75 6.75v1.5a2 2 0 0 0 2 2h1.5a2 2 0 0 0 2-2v-1.5a2 2 0 0 0-2-2h-1.5a2 2 0 0 0-2 2ZM14.75 7h4.5M17 4.75v4.5M4.75 15.75v1.5a2 2 0 0 0 2 2h1.5a2 2 0 0 0 2-2v-1.5a2 2 0 0 0-2-2h-1.5a2 2 0 0 0-2 2ZM13.75 15.75v1.5a2 2 0 0 0 2 2h1.5a2 2 0 0 0 2-2v-1.5a2 2 0 0 0-2-2h-1.5a2 2 0 0 0-2 2Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgAppsIcon);
export default Memo;
