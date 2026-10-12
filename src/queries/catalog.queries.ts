// One queryOptions per read; pages prefetch with the same builders components use.
import { queryOptions } from "@tanstack/react-query"
import { queryKeys } from "@/lib/queryKeys"
import { getService, getServiceCategories, getServiceTemplates, getServices } from "@/services/catalog.services"

export const serviceDetailQuery = (id: string) =>
  queryOptions({ queryKey: queryKeys.services.detail(id), queryFn: () => getService(id) })

export const serviceCategoriesQuery = () =>
  queryOptions({ queryKey: queryKeys.serviceCategories.list(), queryFn: () => getServiceCategories() })

export const serviceTemplatesQuery = () =>
  queryOptions({ queryKey: queryKeys.serviceTemplates.list(), queryFn: () => getServiceTemplates() })

export const servicesListQuery = (queryString = "") =>
  queryOptions({ queryKey: queryKeys.services.list(queryString), queryFn: () => getServices(queryString) })
