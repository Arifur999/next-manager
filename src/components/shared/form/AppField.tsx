import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AnyFieldApi } from "@tanstack/react-form";
import React from "react";

// TanStack Form's error shape depends on the validator: a zod issue object, a
// plain string, or something else entirely. Normalize before rendering.
const getErrorMessage = (error: unknown): string => {
    if (typeof error === "string") return error;

    if (error && typeof error === "object") {
        if ("message" in error && typeof error.message === "string") {
            return error.message;
        }
    }

    return String(error);
};

type AppFieldProps = {
    field: AnyFieldApi;
    label: string;
    type?: "text" | "email" | "password" | "number" | "date" | "time";
    placeholder?: string;
    append?: React.ReactNode;
    prepend?: React.ReactNode;
    className?: string;
    disabled?: boolean;
};

const AppField = ({
    field,
    label,
    type = "text",
    placeholder,
    append,
    prepend,
    className,
    disabled = false,
}: AppFieldProps) => {
    // Only after touch, and only the first one: showing "required" the instant a
    // form opens tells the user off for something they have not done yet.
    const firstError =
        field.state.meta.isTouched && field.state.meta.errors.length > 0
            ? getErrorMessage(field.state.meta.errors[0])
            : null;

    const hasError = firstError !== null;

    return (
        <div className={cn("space-y-1.5", className)}>
            <Label htmlFor={field.name} className={cn(hasError && "text-destructive")}>
                {label}
            </Label>

            <div className="relative">
                {prepend && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
                        {prepend}
                    </div>
                )}

                <Input
                    id={field.name}
                    name={field.name}
                    type={type}
                    value={field.state.value ?? ""}
                    placeholder={placeholder}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    disabled={disabled}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? `${field.name}-error` : undefined}
                    className={cn(
                        prepend && "pl-10",
                        append && "pr-10",
                        hasError && "border-destructive focus-visible:ring-destructive/20",
                    )}
                />

                {append && (
                    <div className="absolute inset-y-0 right-0 z-10 flex items-center pr-3">{append}</div>
                )}
            </div>

            {hasError && (
                <p id={`${field.name}-error`} role="alert" className="text-sm text-destructive">
                    {firstError}
                </p>
            )}
        </div>
    );
};

export default AppField;
