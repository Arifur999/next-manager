import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppSubmitButtonProps = {
    isPending: boolean;
    children: React.ReactNode;
    pendingLabel?: string;
    className?: string;
    disabled?: boolean;
};

const AppSubmitButton = ({
    isPending,
    children,
    pendingLabel,
    className,
    disabled = false,
}: AppSubmitButtonProps) => {
    const isDisabled = disabled || isPending;

    return (
        <Button
            type="submit"
            disabled={isDisabled}
            className={cn(
                "w-full transition-all",
                // Busy and blocked should not look the same: a pending button
                // stays full-opacity with a wait cursor, a genuinely disabled
                // one dims.
                isPending && "cursor-wait disabled:opacity-100",
                !isPending && isDisabled && "cursor-not-allowed opacity-50",
                className,
            )}
        >
            {isPending ? (
                <span className="flex items-center justify-center gap-2.5">
                    <Loader size={16} onDark label={pendingLabel ?? "Submitting"} />
                    <span className="animate-pulse">{pendingLabel ? pendingLabel : children}</span>
                </span>
            ) : (
                children
            )}
        </Button>
    );
};

export default AppSubmitButton;
