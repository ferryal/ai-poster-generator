import { useQuery } from "@tanstack/react-query";

import { settingsApi, queryKeys } from "@/api";
import { QUERY_CONFIG } from "@/api/config";

export function usePosterPresets() {
  return useQuery({
    queryKey: queryKeys.settings.posterPresets(),
    queryFn: () => settingsApi.getPosterPresets(),
    staleTime: QUERY_CONFIG.STALE_TIME,
    retry: QUERY_CONFIG.RETRY,
  });
}

