import NotFoundState from "@/components/shared/state/NotFoundState"
import { getDefaultDashboardRoute } from "@/lib/authUtils"
import { getUserInfo } from "@/services/auth.services"
import { toUserRole } from "@/types/user.types"

const DashboardNotFound = async () => {
  const user = await getUserInfo()
  const role = toUserRole(user?.role)

  return role ? (
    <NotFoundState homeHref={getDefaultDashboardRoute(role)} homeLabel="Back to your dashboard" />
  ) : (
    <NotFoundState homeHref="/" homeLabel="Go to the home page" />
  )
}

export default DashboardNotFound
