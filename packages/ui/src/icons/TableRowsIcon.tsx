import { SVGProps, memo } from "react";
const SvgTableRowsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5.75 19.25h12.5a1 1 0 0 0 1-1V5.75a1 1 0 0 0-1-1H5.75a1 1 0 0 0-1 1v12.5a1 1 0 0 0 1 1ZM19.25 9.25h-14M19.25 14.75h-14"
    />
  </svg>
);
const Memo = memo(SvgTableRowsIcon);
export default Memo;
