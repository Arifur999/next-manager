import LoginForm from "@/components/modules/Auth/LoginForm";
import RouteLoading from "@/components/shared/RouteLoading";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign in",
};

const LoginPage = () => {
  // LoginForm reads ?redirect= through useSearchParams(), which opts the tree
  // out of static prerendering unless there is a boundary to fall back to.
  return (
    <Suspense fallback={<RouteLoading label="Loading sign in..." />}>
      <LoginForm />
    </Suspense>
  );
};

export default LoginPage;
