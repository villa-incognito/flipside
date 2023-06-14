import { SVGProps, memo } from "react";
const SvgChristmasTreeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M14.802 11.25h2.448L12 4.75l-5.25 6.5h2.448l-3.448 4h3l-4 4h14.5l-4-4h3l-3.448-4Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgChristmasTreeIcon);
export default Memo;
