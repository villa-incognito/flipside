import { CloseIcon, SearchIcon } from "@fscrypto/ui";

interface SearchTermProps {
  onChange: (val: string) => void;
  value?: string;
}

const SearchTerm = ({ onChange, value }: SearchTermProps) => {
  return (
    <div
      className="border-gray-20 dark:border-gray-60 flex w-full items-center rounded-xl border p-2"
      data-testid="discover-search"
    >
      <SearchIcon className="text-gray-40 mr-2 h-5 w-5" />
      <input
        type="text"
        placeholder="Search..."
        className="min-w-40 dark:text-gray-40 w-full border-transparent focus:border-transparent focus:outline-none focus:ring-0 dark:bg-gray-100"
        onChange={(e) => onChange(e.target.value)}
        value={value}
      />
      {(value?.length ?? 0) > 2 && (
        <CloseIcon className="text-gray-40 mr-2 h-5 w-5 cursor-pointer" onClick={() => onChange("")} />
      )}
    </div>
  );
};

export default SearchTerm;
