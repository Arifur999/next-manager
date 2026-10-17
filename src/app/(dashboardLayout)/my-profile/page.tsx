import ProfileForm from "@/components/modules/Account/ProfileForm";
import { getUserInfo } from "@/services/auth.services";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "My profile",
};

// Reads the signed-in user, so it must never be cached — a cached shell would
// show one person's details to the next visitor.
export const dynamic = "force-dynamic";

const MyProfilePage = async () => {
  const user = await getUserInfo();

  if (!user) redirect("/login");

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="My profile">
        What the rest of the agency sees when your name appears on their screen.
      </PageHeader>

      <ProfileForm user={user} />
    </div>
  );
};

export default MyProfilePage;
