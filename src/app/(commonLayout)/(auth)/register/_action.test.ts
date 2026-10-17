import { beforeEach, describe, expect, it, vi } from "vitest"
import { register, signIn } from "@/services/auth.services"
import type { IUser } from "@/types/user.types"
import { registerAction } from "./_action"

vi.mock("@/services/auth.services", () => ({ register: vi.fn(), signIn: vi.fn() }))
vi.mock("@/lib/logger", () => ({ logger: { warn: vi.fn() }, errorFields: () => ({}) }))

const form = {
    organization_name: "Northwind Studio",
    full_name: "Rina Das",
    email: "rina@northwind.com",
    phone: "",
    password: "welcome12",
}

const admin: IUser = {
    id: "u1",
    email: form.email,
    full_name: form.full_name,
    role: "admin",
    status: "active",
    email_verified: true,
}

describe("registerAction", () => {
    beforeEach(() => {
        vi.mocked(register).mockReset()
        vi.mocked(signIn).mockReset()
    })

    it("signs the new admin in with the password they chose and sends them to their dashboard", async () => {
        vi.mocked(register).mockResolvedValue({ success: true, message: "Created", data: admin })
        vi.mocked(signIn).mockResolvedValue({ success: true, message: "Signed in", data: { user: admin } })

        const result = await registerAction(form)

        expect(signIn).toHaveBeenCalledWith({ email: form.email, password: form.password })
        expect(result).toMatchObject({ success: true, data: { destination: "/admin/dashboard" } })
    })

    it("reports the workspace as created when the sign-in after it is refused", async () => {
        vi.mocked(register).mockResolvedValue({ success: true, message: "Created", data: admin })
        vi.mocked(signIn).mockResolvedValue({ success: false, message: "Too many attempts", data: null })

        expect(await registerAction(form)).toMatchObject({ success: true, data: { destination: "/login?email=rina%40northwind.com" } })
    })

    it("reports the workspace as created when the sign-in after it cannot reach the API", async () => {
        vi.mocked(register).mockResolvedValue({ success: true, message: "Created", data: admin })
        vi.mocked(signIn).mockRejectedValue(new TypeError("fetch failed"))

        expect(await registerAction(form)).toMatchObject({ success: true, data: { destination: "/login?email=rina%40northwind.com" } })
    })

    it("passes the server's refusal on and never tries to sign in", async () => {
        vi.mocked(register).mockResolvedValue({
            success: false,
            message: "An account with this email already exists",
            data: admin,
        })

        expect(await registerAction(form)).toEqual({
            success: false,
            message: "An account with this email already exists",
        })
        expect(signIn).not.toHaveBeenCalled()
    })

    it("refuses an invalid form before calling the API", async () => {
        const result = await registerAction({ ...form, organization_name: "" })

        expect(result).toMatchObject({ success: false, message: "Enter your company name" })
        expect(register).not.toHaveBeenCalled()
    })
})
