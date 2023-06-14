import { createIcon } from "./shared";

const paths = (
  <>
    <path
      d="M28.7507 32.0832H11.2503C9.40938 32.0832 7.91699 30.5908 7.91699 28.7498V11.2498C7.91699 9.40889 9.40937 7.9165 11.2503 7.9165H28.7507C30.5917 7.9165 32.0841 9.40889 32.0841 11.2498V28.7498C32.0841 30.5908 30.5917 32.0832 28.7507 32.0832Z"
      fill="#666666"
      stroke="#666666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.5 27.5L16.6964 19.6999L23.8962 19.6997L27.4977 12.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
);

const LineChartIcon = createIcon(paths, "LineChartIcon", "0 0 40 40");

export default LineChartIcon;
