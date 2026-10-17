"use client"

import PlatformSettingsForm from "@/components/modules/Platform/PlatformSettingsForm"
import ErrorState from "@/components/shared/state/ErrorState"
import LoadingBlock from "@/components/shared/state/LoadingBlock"
import { platformSettingsQuery } from "@/queries/platform.queries"
import { useQuery } from "@tanstack/react-query"

/**
 * How this installation is set up. Every value here is read by something, and
 * the screen says by what. Mail credentials are shown, not edited: they live in
 * the server's environment, so this reports whether email works and what is missing.
 */
const PlatformSettings = () => {
  const { data, isPending, isFetching, refetch } = useQuery(platformSettingsQuery())

  const settings = data?.data

  if (isPending) return <LoadingBlock height="h-96" rounded />

  // Only when nothing ever arrived: a failed background refetch keeps the form.
  if (!settings) {
    return (
      <ErrorState
        className="rounded-xl border border-dashed"
        message="The platform settings did not load."
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    )
  }

  // Keyed on when the server last changed, so a background refetch never
  // overwrites something half-typed, and a real save reseeds the form.
  return <PlatformSettingsForm key={settings.updated_at} settings={settings} />
}

export default PlatformSettings
