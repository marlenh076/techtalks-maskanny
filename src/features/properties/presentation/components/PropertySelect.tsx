"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import "./property-select.css";

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
export default function PropertySelect({
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
        className="property-create-select"
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
          className="property-create-select-content"
        >
          <Select.Viewport className="property-create-select-viewport">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="property-create-select-option"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="property-create-select-check">
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
