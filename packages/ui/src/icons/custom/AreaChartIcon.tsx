import { createIcon } from "./shared";

const paths = (
  <>
    <path
      d="M28.7507 32.0832H11.2503C9.40938 32.0832 7.91699 30.5908 7.91699 28.7498V11.2498C7.91699 9.40889 9.40937 7.9165 11.2503 7.9165H28.7507C30.5917 7.9165 32.0841 9.40889 32.0841 11.2498V28.7498C32.0841 30.5908 30.5917 32.0832 28.7507 32.0832Z"
      stroke="#666666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M31.667 9.99984V28.1998C31.667 30.1144 30.1149 31.6665 28.2004 31.6665H10.0003C10.0003 31.6665 11.3007 26.0332 14.7673 22.5665C18.2339 19.0998 20.8339 20.8332 25.1671 19.0998C29.5004 17.3665 31.667 9.99984 31.667 9.99984Z"
      fill="#666666"
      stroke="#666666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
);

const AreaChartIcon = createIcon(paths, "AreaChartIcon", "0 0 40 40");
export default AreaChartIcon;
