import type { ComponentProps } from "react";
import styles from "./PropertySelect.module.css";

// Shared with the create form so input and select surfaces stay identical.
export const PROPERTY_INPUT_CLASSES = `
  block w-full min-h-[52px] appearance-none
  rounded-(--radius-sm) border border-transparent
  bg-(--bg) px-[16px] py-[14px] text-[14px]! text-(--ink)
  transition-[background,border-color,box-shadow]
  duration-(--duration-fast) ease-[ease]
  placeholder:text-(--faint)
  hover:border-(--line-strong)
  focus:border-(--ink) focus:bg-(--surface)
  focus:shadow-[0_0_0_3px_rgba(22,23,26,0.045)]
  focus:outline-none motion-reduce:transition-none
`;

export function PropertySelect({
  className = "",
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={`${PROPERTY_INPUT_CLASSES} ${styles.select} cursor-pointer ${className}`}
    />
  );
}
