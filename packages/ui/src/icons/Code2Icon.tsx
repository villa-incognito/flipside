import { SVGProps, memo } from "react";
const SvgCode2Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="m15.75 8.75 3.5 3.25-3.5 3.25M8.25 8.75 4.75 12l3.5 3.25"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgCode2Icon);
export default Memo;
