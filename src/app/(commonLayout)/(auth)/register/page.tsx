import RegisterForm from "@/components/modules/Auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your workspace",
};

const RegisterPage = () => {
  return <RegisterForm />;
};

export default RegisterPage;
