// One queryOptions per read. Pages prefetch with these and components read the
// same ones, so server and browser can never disagree on a key.
import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { getClient, getClientFinancials, getClientLinks, getClients, getLeadPipeline, getLeadSources } from "@/services/crm.services"

export const clientDetailQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.clients.detail(id), queryFn: () => getClient(id) })

export const clientFinancialsQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.clientFinancials.detail(id), queryFn: () => getClientFinancials(id) })

export const clientLinksListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.clientLinks.list(queryString), queryFn: () => getClientLinks(queryString) })

export const clientsListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.clients.list(queryString), queryFn: () => getClients(queryString) })

export const leadPipelineQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.leads.list(queryString), queryFn: () => getLeadPipeline(queryString) })

export const leadSourcesQuery = () =>
  queryOptions({ queryKey: queryKeys.leadSources.list(), queryFn: () => getLeadSources() })
