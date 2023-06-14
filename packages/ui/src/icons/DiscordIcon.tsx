import { SVGProps, memo } from "react";
const SvgDiscordIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="m5.914 7.384-.977 7.233a2 2 0 0 0 1.046 2.036L9 18.25l1-2.5s.656.5 2 .5c1.344 0 2-.5 2-.5l1 2.5 3.017-1.597a2 2 0 0 0 1.046-2.036l-.977-7.233a1 1 0 0 0-.697-.822l-2.64-.812v.5a1 1 0 0 1-1 1h-3.5a1 1 0 0 1-1-1v-.5l-2.638.812a1 1 0 0 0-.697.822Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM14.5 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgDiscordIcon);
export default Memo;
