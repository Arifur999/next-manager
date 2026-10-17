import { describe, expect, it } from "vitest"
import { activeNavHref, activeViewHref, pathOf } from "./navMatch"

const params = (query = "") => new URLSearchParams(query)

describe("pathOf", () => {
  it("drops the query", () => {
    expect(pathOf("/dashboard/chat?type=direct")).toBe("/dashboard/chat")
    expect(pathOf("/dashboard/chat")).toBe("/dashboard/chat")
  })
})

describe("activeNavHref", () => {
  const nav = [
    { href: "/admin/dashboard", exact: true },
    { href: "/admin/dashboard/reports" },
    { href: "/admin/dashboard/leave-calendar" },
    { href: "/admin/dashboard/clients" },
  ]

  it("lights the home entry on the home page only", () => {
    expect(activeNavHref(nav, "/admin/dashboard")).toBe("/admin/dashboard")
    expect(activeNavHref(nav, "/admin/dashboard/business")).toBeNull()
  })

  it("keeps an entry lit on the pages under it", () => {
    expect(activeNavHref(nav, "/admin/dashboard/clients/42")).toBe("/admin/dashboard/clients")
    expect(activeNavHref(nav, "/admin/dashboard/reports/sales")).toBe("/admin/dashboard/reports")
  })

  it("respects path segments, not string prefixes", () => {
    expect(activeNavHref([{ href: "/dashboard/leave" }], "/dashboard/leave-settings")).toBeNull()
  })

  it("picks the deepest entry when two hold the page", () => {
    const nested = [{ href: "/a" }, { href: "/a/b" }]
    expect(activeNavHref(nested, "/a/b/c")).toBe("/a/b")
  })

  it("ignores the query: the views of a page are tabs, not entries", () => {
    const withQuery = [{ href: "/admin/dashboard/projects?mine=true" }]
    expect(activeNavHref(withQuery, "/admin/dashboard/projects")).toBe("/admin/dashboard/projects?mine=true")
  })

  it("uses a wider activePath when given", () => {
    const reports = [{ href: "/admin/dashboard/reports/clients", activePath: "/admin/dashboard/reports" }]
    expect(activeNavHref(reports, "/admin/dashboard/reports/sales")).toBe("/admin/dashboard/reports/clients")
  })
})

describe("activeViewHref", () => {
  const clients = [
    "/admin/dashboard/clients",
    "/admin/dashboard/clients?status=active",
    "/admin/dashboard/clients?status=archived",
  ]

  it("lights the unfiltered tab when no owned key is set", () => {
    expect(activeViewHref(clients, "/admin/dashboard/clients", params())).toBe("/admin/dashboard/clients")
  })

  it("lights the tab whose filter the URL carries", () => {
    expect(activeViewHref(clients, "/admin/dashboard/clients", params("status=active"))).toBe(
      "/admin/dashboard/clients?status=active",
    )
  })

  it("is not thrown by paging or search", () => {
    expect(
      activeViewHref(clients, "/admin/dashboard/clients", params("status=archived&page=3&search=acme")),
    ).toBe("/admin/dashboard/clients?status=archived")
    expect(activeViewHref(clients, "/admin/dashboard/clients", params("page=2"))).toBe("/admin/dashboard/clients")
  })

  it("lights nothing for a filter no tab offers", () => {
    expect(activeViewHref(clients, "/admin/dashboard/clients", params("status=lost"))).toBeNull()
  })

  it("reads a status name with a space however it was encoded", () => {
    const tasks = ["/admin/dashboard/tasks", "/admin/dashboard/tasks?status=In review"]
    expect(activeViewHref(tasks, "/admin/dashboard/tasks", params("status=In%20review"))).toBe(
      "/admin/dashboard/tasks?status=In review",
    )
    expect(activeViewHref(tasks, "/admin/dashboard/tasks", params("status=In+review"))).toBe(
      "/admin/dashboard/tasks?status=In review",
    )
  })

  it("tells tabs on different keys apart", () => {
    const chat = ["/dashboard/chat", "/dashboard/chat?unread=true", "/dashboard/chat?type=direct"]
    expect(activeViewHref(chat, "/dashboard/chat", params("type=direct"))).toBe("/dashboard/chat?type=direct")
    expect(activeViewHref(chat, "/dashboard/chat", params("unread=true"))).toBe("/dashboard/chat?unread=true")
  })

  it("compares tabs on different paths by path", () => {
    const services = ["/admin/dashboard/services", "/admin/dashboard/services/categories"]
    expect(activeViewHref(services, "/admin/dashboard/services/categories", params())).toBe(
      "/admin/dashboard/services/categories",
    )
    expect(activeViewHref(services, "/admin/dashboard/services/42", params())).toBeNull()
  })
})
