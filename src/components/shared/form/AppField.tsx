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
    type?: "text" | "email" | "password" | "number" | "date" | "time" | "tel";
    /** Lets browsers and password managers fill the field (email, current-password, new-password, organization...). */
    autoComplete?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    placeholder?: string;
    append?: React.ReactNode;
    prepend?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    /** Help under the input, read out with it by screen readers. */
    description?: React.ReactNode;
    maxLength?: number;
    min?: number;
    max?: number;
    step?: number | string;
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
    autoComplete,
    inputMode,
    description,
    maxLength,
    min,
    max,
    step,
}: AppFieldProps) => {
    // Only after touch, and only the first one: showing "required" the instant a
    // form opens tells the user off for something they have not done yet.
    const firstError =
        field.state.meta.isTouched && field.state.meta.errors.length > 0
            ? getErrorMessage(field.state.meta.errors[0])
            : null;

    const hasError = firstError !== null;
    const descriptionId = `${field.name}-description`;
    const errorId = `${field.name}-error`;
    const describedBy = [description ? descriptionId : null, hasError ? errorId : null].filter(Boolean).join(" ");

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
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    maxLength={maxLength}
                    min={min}
                    max={max}
                    step={step}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    disabled={disabled}
                    aria-invalid={hasError}
                    aria-describedby={describedBy || undefined}
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

            {description && (
                <p id={descriptionId} className="text-xs text-muted-foreground">
                    {description}
                </p>
            )}

            {hasError && (
                <p id={errorId} role="alert" className="text-sm text-destructive">
                    {firstError}
                </p>
            )}
        </div>
    );
};

export default AppField;
