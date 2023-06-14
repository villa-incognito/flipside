import { SVGProps, memo } from "react";
const SvgSettings2Icon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path
      d="m5.621 14.963 1.101.172c.813.127 1.393.872 1.333 1.71l-.081 1.137a.811.811 0 0 0 .445.787l.814.4c.292.145.641.09.88-.134l.818-.773a1.55 1.55 0 0 1 2.138 0l.818.773a.776.776 0 0 0 .88.135l.815-.402a.808.808 0 0 0 .443-.785l-.08-1.138c-.06-.838.52-1.583 1.332-1.71l1.101-.172a.798.798 0 0 0 .651-.62l.201-.9a.816.816 0 0 0-.324-.847l-.918-.643a1.634 1.634 0 0 1-.476-2.132l.555-.988a.824.824 0 0 0-.068-.907l-.563-.723a.78.78 0 0 0-.85-.269l-1.064.334a1.567 1.567 0 0 1-1.928-.949l-.407-1.058a.791.791 0 0 0-.737-.511l-.903.002a.791.791 0 0 0-.734.516l-.398 1.045a1.566 1.566 0 0 1-1.93.956l-1.11-.348a.78.78 0 0 0-.851.27l-.56.724a.823.823 0 0 0-.062.91l.568.99c.418.73.213 1.666-.469 2.144l-.907.636a.817.817 0 0 0-.324.847l.2.9c.072.325.33.57.651.62Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.591 10.409a2.25 2.25 0 1 1-3.183 3.182 2.25 2.25 0 0 1 3.183-3.182Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const Memo = memo(SvgSettings2Icon);
export default Memo;
