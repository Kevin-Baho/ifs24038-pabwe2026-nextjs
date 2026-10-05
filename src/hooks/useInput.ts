import { useState, ChangeEvent } from "react";

export type InputChangeHandler = (
  e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string
) => void;

export function useInput(
  initialValue: string = ""
): [string, InputChangeHandler, (val: string) => void] {
  const [value, setValue] = useState<string>(initialValue);

  const handleValueChange: InputChangeHandler = (e) => {
    if (typeof e === "string") {
      setValue(e);
    } else {
      setValue(e.target.value);
    }
  };

  return [value, handleValueChange, setValue];
}

export default useInput;

