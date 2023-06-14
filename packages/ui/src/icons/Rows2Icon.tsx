import { SVGProps, memo } from "react";
const SvgRows2Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M4.75 5.75v.5a1 1 0 0 0 1 1h12.5a1 1 0 0 0 1-1v-.5a1 1 0 0 0-1-1H5.75a1 1 0 0 0-1 1ZM4.75 11.75v.5a1 1 0 0 0 1 1h12.5a1 1 0 0 0 1-1v-.5a1 1 0 0 0-1-1H5.75a1 1 0 0 0-1 1ZM4.75 17.75v.5a1 1 0 0 0 1 1h12.5a1 1 0 0 0 1-1v-.5a1 1 0 0 0-1-1H5.75a1 1 0 0 0-1 1Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgRows2Icon);
export default Memo;
