import { SVGProps, memo } from "react";
const SvgTelegramIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M9.875 13.625 15 19.25l4.25-14.5L4.75 10l5.125 3.625Zm0 0 2.375-1.875"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgTelegramIcon);
export default Memo;
