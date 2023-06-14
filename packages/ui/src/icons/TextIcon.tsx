import { SVGProps, memo } from "react";
const SvgTextIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M18.25 7.25v-1.5H5.75v1.5M12 6v12.25m0 0h-1.25m1.25 0h1.25"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgTextIcon);
export default Memo;
