import { SVGProps, memo } from "react";
const SvgCameraIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M19.25 17.25v-7.5a2 2 0 0 0-2-2h-.333a1 1 0 0 1-.923-.615l-.738-1.77a1 1 0 0 0-.923-.615H9.667a1 1 0 0 0-.923.615l-.738 1.77a1 1 0 0 1-.923.615H6.75a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2Z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M15.25 13a3.25 3.25 0 1 1-6.5 0 3.25 3.25 0 0 1 6.5 0Z"
    />
  </svg>
);
const Memo = memo(SvgCameraIcon);
export default Memo;
