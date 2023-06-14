import { SVGProps, memo } from "react";
const SvgDoubleChevronLeftIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M11.25 8.75 7.75 12l3.5 3.25M16.25 8.75 12.75 12l3.5 3.25"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgDoubleChevronLeftIcon);
export default Memo;
