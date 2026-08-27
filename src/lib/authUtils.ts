export type UserRole = "SUPER_ADMIN" | "OWNER" | "MANAGER" | "STAFF" | "ACCOUNTANT";

export const authRoles = ["/login", "/register", "/forgot-password", "/reset-password"];

export const isAuthRoute = (pathname: string) => authRoles.some((route) => route === pathname);

export type RouteConfig = {
    exact: string[];
    pattern: RegExp[];
};

// Route ownership as data, resolved by one function. Never scatter
// `if (role !== "OWNER")` through pages - a rule that lives in two places is a
// rule that will disagree with itself.
export const commonProtectedRoutes: RouteConfig = {
    exact: ["/my-profile", "/change-password"],
    pattern: [],
};

export const ownerProtectedRoutes: RouteConfig = {
    exact: [],
    pattern: [/^\/admin\/dashboard/],
};

export const staffProtectedRoutes: RouteConfig = {
    exact: [],
    pattern: [/^\/dashboard/],
};

export const isRouteMatches = (pathname: string, routes: RouteConfig) => {
    if (routes.exact.includes(pathname)) {
        return true;
    }
    return routes.pattern.some((pattern) => pattern.test(pathname));
};

export type RouteOwner = "OWNER" | "STAFF" | "COMMON" | null;

export const getRouteOwner = (pathname: string): RouteOwner => {
    if (isRouteMatches(pathname, commonProtectedRoutes)) return "COMMON";
    if (isRouteMatches(pathname, ownerProtectedRoutes)) return "OWNER";
    if (isRouteMatches(pathname, staffProtectedRoutes)) return "STAFF";
    return null; // public
};

// super_admin, owner and manager all administer a workspace, so they share the
// admin area. Collapsing them here keeps the route table from growing a branch
// per role.
export const toRouteOwner = (role: UserRole): "OWNER" | "STAFF" => {
    if (role === "SUPER_ADMIN" || role === "OWNER" || role === "MANAGER") return "OWNER";
    return "STAFF";
};

export const getDefaultDashboardRoute = (role: UserRole) => {
    return toRouteOwner(role) === "OWNER" ? "/admin/dashboard" : "/dashboard";
};

export const isValidRedirectForRole = (redirectPath: string, role: UserRole) => {
    const routeOwner = getRouteOwner(redirectPath);

    if (routeOwner === null || routeOwner === "COMMON") return true;

    return routeOwner === toRouteOwner(role);
};
