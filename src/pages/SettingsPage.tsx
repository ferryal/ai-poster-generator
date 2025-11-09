import { AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { usePosterPresets } from "@/queries";

export function SettingsPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePosterPresets();

  const presets = data?.presets;

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Poster Settings
          </h1>
          <p className="text-gray-600 text-sm">
            Review the available poster presets used across the application.
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading poster presets...</p>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-gray-900 font-semibold">Failed to load presets</p>
          <p className="text-gray-600 text-sm">
            {error instanceof Error ? error.message : "An unexpected error occurred."}
          </p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      )}

      {!isLoading && !isError && presets && (
        <div className="space-y-8 pb-12">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Poster Sizes
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Available dimensions grouped by orientation and usage type.
            </p>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              {presets.sizes.map((size) => (
                <Card key={size.key} className="p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {size.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {size.orientation}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {size.key}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    {size.dimensions.width} × {size.dimensions.height}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Background Colors
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Preset color palette for generated posters.
            </p>
            <div className="flex flex-wrap gap-2">
              {presets.backgroundColors.map((color) => (
                <span
                  key={color}
                  className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-700 capitalize"
                >
                  {color.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Use Cases
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Recommended templates mapped to their display labels.
              </p>
              <div className="space-y-2">
                {Object.entries(presets.useCases).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {label}
                    </span>
                    <span className="text-xs uppercase tracking-wide text-gray-500">
                      {key.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Product Positions
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Available placements for product renders within poster layouts.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {presets.positions.map((position) => (
                  <Card
                    key={position}
                    className="p-3 text-center text-sm font-medium text-gray-900 border border-gray-200 capitalize"
                  >
                    {position}
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

