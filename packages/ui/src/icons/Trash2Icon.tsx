import { SVGProps, memo } from "react";
const SvgTrash2Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="m5.75 7.75.841 9.673a2 2 0 0 0 1.993 1.827h5.832a2 2 0 0 0 1.993-1.827l.841-9.673H5.75ZM9.75 10.75v5.5M13.25 10.75v5.5M8.75 7.75v-1a2 2 0 0 1 2-2h1.5a2 2 0 0 1 2 2v1M4.75 7.75h13.5"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgTrash2Icon);
export default Memo;
