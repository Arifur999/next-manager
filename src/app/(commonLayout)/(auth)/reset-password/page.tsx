import ResetPasswordForm from "@/components/modules/Auth/ResetPasswordForm";
import RouteLoading from "@/components/shared/RouteLoading";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Set a new password",
};

const ResetPasswordPage = () => {
  // The form reads ?token= through useSearchParams(), which opts the tree out
  // of static prerendering unless there is a boundary to fall back to.
  return (
    <Suspense fallback={<RouteLoading label="Loading..." />}>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPasswordPage;
