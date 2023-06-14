import { SVGProps, memo } from "react";
const SvgDotsVerticalIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M13 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM13 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
    />
  </svg>
);
const Memo = memo(SvgDotsVerticalIcon);
export default Memo;
