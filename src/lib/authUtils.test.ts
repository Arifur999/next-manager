import { describe, expect, it } from "vitest";
import { safeRedirect } from "./authUtils";

describe("safeRedirect", () => {
    it.each(["//evil.example", "/\\evil.example", "https://evil.example", "evil.example", "/\\/evil.example"])(
        "rejects off-site target %s",
        (raw) => {
            expect(safeRedirect(raw, "admin")).toBe("/admin/dashboard");
        },
    );

    it.each(["/.//evil.example", "/..//evil.example", "/%2e//evil.example", "/a/..//evil.example/admin"])(
        "rejects %s, which normalises to a protocol-relative URL",
        (raw) => {
            expect(safeRedirect(raw, "admin")).toBe("/admin/dashboard");
        },
    );

    it("rejects auth routes", () => {
        expect(safeRedirect("/login", "admin")).toBe("/admin/dashboard");
    });

    it("rejects areas the role cannot open", () => {
        expect(safeRedirect("/platform", "admin")).toBe("/admin/dashboard");
    });

    it("keeps a reachable path with its query", () => {
        expect(safeRedirect("/admin/dashboard/clients?status=active", "sales")).toBe(
            "/admin/dashboard/clients?status=active",
        );
    });

    it("sends the platform owner to the console page they asked for", () => {
        expect(safeRedirect("/platform/plans", "super_admin")).toBe("/platform/plans");
    });

    it("falls back on a missing redirect", () => {
        expect(safeRedirect(null, "operations")).toBe("/dashboard");
    });
});
