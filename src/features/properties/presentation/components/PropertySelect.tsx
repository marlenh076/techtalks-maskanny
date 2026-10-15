"use client";

import * as Select from "@radix-ui/react-select";
import type { ComponentProps } from "react";
import { Check, ChevronDown } from "lucide-react";
import styles from "./PropertySelect.module.css";

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

// Discovery forms use native select events and FormData, including an empty
// "Any" option. Keep that contract alongside the create form's Radix picker.
export function PropertySelect({ className = "", ...props }: ComponentProps<"select">) {
  return <select {...props} className={`${PROPERTY_INPUT_CLASSES} ${styles.select} cursor-pointer ${className}`} />;
}

export type PropertySelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type PropertySelectProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  options: PropertySelectOption[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
};

// Shared by all selects in the Create Property form. Radix owns focus,
// keyboard/typeahead interaction and portal positioning; styles stay scoped.
export default function PropertyCreateSelect({
  id,
  label,
  value,
  placeholder,
  options,
  onValueChange,
  disabled = false,
  invalid = false,
  describedBy,
}: PropertySelectProps) {
  return (
    <Select.Root
      name={id}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      required
    >
      <Select.Trigger
        id={id}
        type="button"
        aria-labelledby={`${id}-label`}
        aria-required="true"
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={`${PROPERTY_INPUT_CLASSES} flex cursor-pointer items-center justify-between gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon asChild>
          <ChevronDown aria-hidden="true" size={18} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          aria-label={label}
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          avoidCollisions
          hideWhenDetached
          className="z-100 max-h-[min(320px,calc(100dvh-24px))] min-w-[var(--radix-select-trigger-width)] max-w-[calc(100vw-24px)] overflow-hidden rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--surface)] p-1 text-[var(--ink)] shadow-[0_18px_48px_-24px_rgba(22,23,26,0.28)]"
        >
          <Select.Viewport className="max-h-[min(310px,calc(100dvh-34px))] overflow-y-auto overscroll-contain">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex min-h-11 cursor-pointer items-center rounded-[10px] py-2.5 pr-10 pl-3.5 text-sm text-[var(--ink-2)] outline-none data-[highlighted]:bg-[var(--chip)] data-[highlighted]:text-[var(--ink)] data-[state=checked]:font-semibold data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute right-3 text-[var(--success)]">
                  <Check aria-hidden="true" size={17} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
