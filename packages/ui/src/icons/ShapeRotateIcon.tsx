import { SVGProps, memo } from "react";
const SvgShapeRotateIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M4.929 14.812a2 2 0 0 1 1.06-2.622l3.221-1.368a2 2 0 0 1 2.623 1.06l1.367 3.222a2 2 0 0 1-1.06 2.622l-3.22 1.368a2 2 0 0 1-2.623-1.06l-1.368-3.222ZM17.127 17.25c2.83-2.831 2.83-7.545 0-10.377a7.251 7.251 0 0 0-9.675-.52"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M6.75 4.75v2.5h2.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Memo = memo(SvgShapeRotateIcon);
export default Memo;
