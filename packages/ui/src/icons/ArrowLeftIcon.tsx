import { SVGProps, memo } from "react";
const SvgArrowLeftIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M10.25 6.75 4.75 12l5.5 5.25M19.25 12H5"
    />
  </svg>
);
const Memo = memo(SvgArrowLeftIcon);
export default Memo;
