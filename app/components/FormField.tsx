"use client"

import React from 'react'
// We rename the Shadcn import to 'ShadcnFormField' using 'as'
import { 
  FormControl, 
  FormItem, 
  FormLabel, 
  FormMessage, 
  FormField as ShadcnFormField 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Control, FieldValues, Path } from 'react-hook-form'

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'file';
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text"
}: FormFieldProps<T>) => {
  return (
    // Use the aliased name here to avoid the infinite loop
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="label">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              className="input"
              placeholder={placeholder}
              type={type}
              {...field}
              
            />
          </FormControl>
          <FormMessage className="text-xs text-red-500" />
        </FormItem>
      )}
    />
  )
}

export default FormField