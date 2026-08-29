import ChangePasswordForm from "@/components/modules/Account/ChangePasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change password",
};

const ChangePasswordPage = () => {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Change password</h1>
        <p className="text-sm text-muted-foreground">
          You will be signed out and asked to sign in again with the new one.
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
};

export default ChangePasswordPage;
