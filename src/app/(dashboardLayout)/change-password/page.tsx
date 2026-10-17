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
        Changing it signs you out everywhere, including any session left open on another
        device, and you sign in again with the new one.
      </PageHeader>

      <ChangePasswordForm />
    </div>
  );
};

export default ChangePasswordPage;
