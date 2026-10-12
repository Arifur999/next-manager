import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10 focus:outline-none"
    >
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
};

export default AuthLayout;
