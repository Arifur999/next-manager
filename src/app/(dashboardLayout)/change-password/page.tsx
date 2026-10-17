import ChangePasswordForm from "@/components/modules/Account/ChangePasswordForm";
import type { Metadata } from "next";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Change password",
};

const ChangePasswordPage = () => {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Change password">
        You will be signed out and asked to sign in again with the new one.
      </PageHeader>

      <ChangePasswordForm />
    </div>
  );
};

export default ChangePasswordPage;
