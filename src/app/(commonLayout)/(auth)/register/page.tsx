import RegisterForm from "@/components/modules/Auth/RegisterForm";
import { getPublicPlans } from "@/services/publicPlans.services";
import { signupTrialDays } from "@/zod/publicPlans.validation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your workspace",
};

// The trial line under the button comes from the same public plans as the
// landing page, so the two never promise different things.
const RegisterPage = async () => {
  const trialDays = signupTrialDays(await getPublicPlans());

  return <RegisterForm trialDays={trialDays} />;
};

export default RegisterPage;
