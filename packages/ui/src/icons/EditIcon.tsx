import { SVGProps, memo } from "react";
const SvgEditIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m4.75 19.25 4.25-1 9.293-9.293a1 1 0 0 0 0-1.414l-1.836-1.836a1 1 0 0 0-1.414 0L5.75 15l-1 4.25ZM19.25 19.25h-5.5"
    />
  </svg>
);
const Memo = memo(SvgEditIcon);
export default Memo;
