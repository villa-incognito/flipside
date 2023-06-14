import { SVGProps, memo } from "react";
const SvgPlayIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M18.25 12 5.75 5.75v12.5L18.25 12Z"
    />
  </svg>
);
const Memo = memo(SvgPlayIcon);
export default Memo;
