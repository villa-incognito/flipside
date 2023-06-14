import { ChristmasTreeIcon } from "@fscrypto/ui";

export const NoResults = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-20">
      <ChristmasTreeIcon className="text-gray-20 h-32 w-32" />
      <p className="text-[40px] font-extrabold text-gray-50">No results Found</p>
      <p className=" text-gray-40">We couldn't find what you searched for.</p>
      <p className=" text-gray-40">Try searching again.</p>
    </div>
  );
};
