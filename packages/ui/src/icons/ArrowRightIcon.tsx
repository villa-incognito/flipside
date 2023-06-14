import { SVGProps, memo } from "react";
const SvgArrowRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m13.75 6.75 5.5 5.25-5.5 5.25M19 12H4.75"
    />
  </svg>
);
const Memo = memo(SvgArrowRightIcon);
export default Memo;
