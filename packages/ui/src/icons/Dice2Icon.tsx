import { SVGProps, memo } from "react";
const SvgDice2Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="M17.25 4.75H6.75a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2V6.75a2 2 0 0 0-2-2Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 9a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM15.5 15a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgDice2Icon);
export default Memo;
