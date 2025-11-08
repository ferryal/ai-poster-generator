import { useState, useMemo } from "react";
import { PosterCard, PosterListItem } from "@/components/poster";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Grid3x3, List, Loader2 } from "lucide-react";
import { useJobs } from "@/queries";
import { useFavoritesStore } from "@/stores";
import { jobsApi } from "@/api/endpoints";
import { useToast } from "@/hooks/use-toast";
import { formatTimestamp } from "@/lib/utils";

export function GalleryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

  const { data, isLoading, error } = useJobs({
    page: currentPage,
    limit: 10,
  });

  const { toggleFavorite, isFavorite, getFavorites } = useFavoritesStore();
  const { toast } = useToast();

  const jobs = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const filteredJobs = useMemo(() => {
    if (activeTab === "favorites") {
      const favoriteIds = getFavorites();
      return jobs.filter((job) => favoriteIds.includes(job.id));
    }
    return jobs;
  }, [jobs, activeTab, getFavorites]);

  const handleDownload = async (id: string, format: "png" | "html") => {
    try {
      const job = jobs.find((j) => j.id === id);
      if (!job) {
        toast({
          title: "Poster not found",
          description: "We couldn't find the poster you tried to download.",
          variant: "destructive",
        });
        return;
      }

      if (format === "png") {
        const response = await jobsApi.downloadPoster(id, 1);

        const link = document.createElement("a");
        link.href = response.downloadUrl;
        link.download = response.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Download started",
          description: "Your poster PNG is downloading.",
        });
      } else if (format === "html") {
        const results = await jobsApi.getJobResults(id);
        const firstDesign = results.results.designs[0];

        if (!firstDesign?.html) {
          toast({
            title: "No HTML available",
            description: "This poster does not have HTML content to download.",
            variant: "destructive",
          });
          return;
        }

        const blob = new Blob([firstDesign.html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${
          job.originalImage?.originalFilename || "poster"
        }-variant-1.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Download started",
          description: "Your poster HTML file is downloading.",
        });
      }
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while downloading.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = (id: string) => {
    const wasFavorite = isFavorite(id);
    toggleFavorite(id);

    toast({
      title: wasFavorite ? "Removed from favorites" : "Added to favorites",
      description: wasFavorite
        ? "Poster removed from your favorites."
        : "Poster saved to your favorites.",
    });
  };

  return (
    // <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Gallery</h1>
        <p className="text-gray-500 text-sm">
          Browse your AI-generated poster collection
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "all" | "favorites")}
          className="w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All Posters</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search and View Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search anything..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
            <Button
              onClick={() => setViewMode("grid")}
              variant={viewMode === "grid" ? "outline" : "ghost"}
              size="icon"
              className={`p-2 h-auto w-auto rounded-xl ${
                viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
              title="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "outline" : "ghost"}
              size="icon"
              className={`p-2 h-auto w-auto rounded-xl ${
                viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#0B2242] animate-spin mb-4" />
          <p className="text-gray-500">Loading your posters...</p>
        </div>
      )}

      {/* error state */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-red-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-700 mb-4">
            {error instanceof Error
              ? error.message
              : "Failed to load gallery. Please try again."}
          </p>
          <Button onClick={() => setCurrentPage(1)}>Try Again</Button>
        </div>
      )}

      {/* empty state */}
      {!isLoading && !error && filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-700 mb-2">
            {activeTab === "favorites" ? "No favorites yet" : "No posters yet"}
          </p>
          <p className="text-gray-500 text-sm">
            {activeTab === "favorites"
              ? "Star your favorite posters to see them here!"
              : "Create your first poster to get started!"}
          </p>
        </div>
      )}
      {!isLoading && !error && filteredJobs.length > 0 && (
        <>
          {/* grid view */}
          {viewMode === "grid" && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredJobs.map((job) => (
                <PosterCard
                  key={job.id}
                  id={job.id}
                  title={
                    job.originalImage?.originalFilename || "Untitled Poster"
                  }
                  image={job.originalImage?.url || ""}
                  timestamp={formatTimestamp(job.createdAt)}
                  variants={job.designCount || 0}
                  isFavorite={isFavorite(job.id)}
                  onDownload={handleDownload}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}

          {/* list view */}
          {viewMode === "list" && (
            <div className="flex flex-col gap-3">
              {filteredJobs.map((job) => (
                <PosterListItem
                  key={job.id}
                  id={job.id}
                  title={
                    job.originalImage?.originalFilename || "Untitled Poster"
                  }
                  image={job.originalImage?.url || ""}
                  timestamp={formatTimestamp(job.createdAt)}
                  variants={job.designCount || 0}
                  isFavorite={isFavorite(job.id)}
                  onDownload={handleDownload}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}

          {/* pagination */}
          {totalPages > 1 && activeTab === "all" && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className={
                        currentPage === pageNum
                          ? "bg-[#0B2242] text-white hover:bg-[#0B2242]/90"
                          : ""
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
