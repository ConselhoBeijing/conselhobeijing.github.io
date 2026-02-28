import { type BasicFormField, type FormFieldInputProps } from '@keystatic/core';
import { TextField } from '@keystar/ui/text-field';
import { createElement, useReducer } from 'react';
import {
  isValidEventDateTimeInput,
  toEventDateTimeInput,
  toEventTimezoneDate,
} from '../utils/events';

type FixedTimezoneDatetimeValidation = {
  isRequired?: boolean;
  min?: string;
  max?: string;
};

type FixedTimezoneDatetimeDefaultValue =
  | string
  | {
      kind: 'now';
    };

type FixedTimezoneDatetimeFieldOptions = {
  label: string;
  defaultValue?: FixedTimezoneDatetimeDefaultValue;
  validation?: FixedTimezoneDatetimeValidation;
  description?: string;
};

function validateValue(
  value: string | null,
  validation: FixedTimezoneDatetimeValidation | undefined,
  label: string
): string | undefined {
  if (value !== null && !isValidEventDateTimeInput(value)) {
    return `${label} is not a valid datetime`;
  }

  if (validation?.isRequired && value === null) {
    return `${label} is required`;
  }

  if (value !== null && validation?.min && value < validation.min) {
    return `${label} must be after ${validation.min}`;
  }

  if (value !== null && validation?.max && value > validation.max) {
    return `${label} must be no later than ${validation.max}`;
  }

  return undefined;
}

function parseValue(value: string | Date): string {
  if (typeof value === 'string' && isValidEventDateTimeInput(value)) {
    return value;
  }

  return toEventDateTimeInput(value);
}

export function fixedTimezoneDatetimeField({
  label,
  defaultValue,
  validation,
  description,
}: FixedTimezoneDatetimeFieldOptions): BasicFormField<string | null, string | null, Date | null> {
  return {
    kind: 'form',
    label,
    Input(props: FormFieldInputProps<string | null>) {
      const [blurred, onBlur] = useReducer(() => true, false);
      const errorMessage = blurred || props.forceValidation ? validateValue(props.value, validation, label) : undefined;

      return createElement(TextField, {
        label,
        description,
        type: 'datetime-local',
        onChange: (nextValue: string) => {
          props.onChange(nextValue === '' ? null : nextValue);
        },
        autoFocus: props.autoFocus,
        value: props.value ?? '',
        onBlur,
        isRequired: validation?.isRequired,
        errorMessage,
      });
    },
    defaultValue() {
      if (defaultValue === undefined) {
        return null;
      }

      if (typeof defaultValue === 'string') {
        return parseValue(defaultValue);
      }

      if (defaultValue.kind === 'now') {
        return toEventDateTimeInput(new Date());
      }

      return null;
    },
    parse(value) {
      if (value === undefined) {
        return null;
      }

      if (value instanceof Date || typeof value === 'string') {
        return parseValue(value);
      }

      throw new Error('Must be a string or date');
    },
    serialize(value) {
      if (value === null) {
        return {
          value: undefined,
        };
      }

      return {
        value: toEventTimezoneDate(value),
      };
    },
    validate(value) {
      const message = validateValue(value, validation, label);

      if (message !== undefined) {
        throw new Error(message);
      }

      return value;
    },
    reader: {
      parse(value) {
        if (value === undefined) {
          return null;
        }

        if (value instanceof Date) {
          return value;
        }

        if (typeof value === 'string') {
          return isValidEventDateTimeInput(value) ? toEventTimezoneDate(value) : new Date(value);
        }

        throw new Error('Must be a string or date');
      },
    },
  };
}
