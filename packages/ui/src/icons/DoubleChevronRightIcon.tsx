import { SVGProps, memo } from "react";
const SvgDoubleChevronRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="m7.75 8.75 3.5 3.25-3.5 3.25M12.75 8.75l3.5 3.25-3.5 3.25"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgDoubleChevronRightIcon);
export default Memo;
