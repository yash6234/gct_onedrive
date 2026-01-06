"use client";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

interface SearchbarProps {
  defaultValue?: string | null;
  params?: Record<string, string | null | undefined>;
  path?: string;
  placeholder?: string;
}

export function Searchbar({
  defaultValue = "",
  params,
  path,
  placeholder = "Search files...",
}: SearchbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [inputValue, setValue] = useState(defaultValue ?? "");

  useEffect(() => {
    setValue(defaultValue ?? "");
  }, [defaultValue]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleSearch = () => {
    const query = inputValue.trim();
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value) searchParams.set(key, value);
    }
    if (query) {
      searchParams.set("q", query);
    }
    const basePath = path && path.trim().length ? path : pathname;
    const suffix = searchParams.toString();
    router.push(suffix ? `${basePath}?${suffix}` : basePath);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch();
  };

  return (
    <form className="drive-search" onSubmit={handleSubmit}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M11 4a7 7 0 105.292 12.292l3.707 3.707 1.414-1.414-3.707-3.707A7 7 0 0011 4zm0 2a5 5 0 110 10A5 5 0 0111 6z"
          fill="currentColor"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleChange}
        aria-label={placeholder}
      />
    </form>
  );
}
