import { SVGProps, memo } from "react";
const SvgCheck2Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="m10.25 16.25-.61.436a.75.75 0 0 0 1.335-.245l-.725-.191Zm6.465-7.911a.75.75 0 0 0-.93-1.178l.93 1.178ZM8.36 12.314a.75.75 0 1 0-1.22.872l1.22-.872Zm2.615 4.127c.582-2.212 1.996-4.233 3.308-5.728a22.75 22.75 0 0 1 1.712-1.75 17.902 17.902 0 0 1 .675-.589l.036-.028.008-.006.001-.002-.465-.588a114.16 114.16 0 0 0-.465-.588h-.002c0 .002-.002.003-.003.004a1.74 1.74 0 0 0-.013.01l-.045.036-.163.136a24.26 24.26 0 0 0-2.404 2.377c-1.376 1.567-2.962 3.796-3.63 6.334l1.45.382ZM7.14 13.186l2.5 3.5 1.22-.872-2.5-3.5-1.22.872Z"
      fill="currentColor"
    />
  </svg>
);
const Memo = memo(SvgCheck2Icon);
export default Memo;
