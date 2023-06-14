import { SVGProps, memo } from "react";
const SvgPencilIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="m4.75 19.25 4.25-1 9.95-9.95a1 1 0 0 0 0-1.413L17.112 5.05a1 1 0 0 0-1.414 0L5.75 15l-1 4.25ZM14.023 7.04l3 3"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgPencilIcon);
export default Memo;
