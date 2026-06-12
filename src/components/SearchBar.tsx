import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "./icons";

interface SearchInputProps {
  onChange: (query: string) => void;
  className?: string;
  autoFocus?: boolean;
}

/** 150msデバウンス付きの検索入力 */
export function SearchInput({ onChange, className, autoFocus }: SearchInputProps) {
  const [value, setValue] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange(value), 150);
    return () => window.clearTimeout(timer.current);
  }, [value, onChange]);

  return (
    <div className={`search-input${className ? ` ${className}` : ""}`}>
      <SearchIcon size={17} />
      <input
        type="search"
        placeholder="タスク名・メモを検索"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="タスク名・メモを検索"
        autoFocus={autoFocus}
      />
    </div>
  );
}

interface SearchBarProps {
  onChange: (query: string) => void;
  onClose: () => void;
}

/** モバイル用: ヘッダー下に出る検索行 */
export function SearchBar({ onChange, onClose }: SearchBarProps) {
  return (
    <div className="search-bar">
      <SearchInput onChange={onChange} className="grow" autoFocus />
      <button
        type="button"
        className="button-secondary"
        onClick={() => {
          onChange("");
          onClose();
        }}
      >
        閉じる
      </button>
    </div>
  );
}
