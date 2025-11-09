import {
  Home,
  Image,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Edit2,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePosterStore } from "@/stores";
import { useJobsInfinite } from "@/queries/use-jobs-infinite";
import type { Job } from "@/types";
import { useEffect, useRef, useCallback } from "react";

interface SidebarProps {
  className?: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ className, isCollapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { addPoster } = usePosterStore();
  const observerTarget = useRef<HTMLDivElement>(null);
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useJobsInfinite();

  const isActive = (path: string) => location.pathname === path;

  // infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element || !hasNextPage) {
      return;
    }

    const scrollContainer = element.parentElement;
    const observer = new IntersectionObserver(handleObserver, {
      root: scrollContainer ?? null,
      threshold: 0.1,
      rootMargin: "0px 0px 160px 0px",
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver, hasNextPage]);

  // Flatten all pages into a single array of jobs
  const allJobs = data?.pages.flatMap((page) => page.data) ?? [];
  const filteredJobs = allJobs.filter(
    (job) => job.status === "completed" && job.transcription?.trim()
  );

  const handleCreateNewPoster = () => {
    // Create a new poster with "Untitled" title
    addPoster({
      title: "Untitled",
      status: "draft",
    });

    // Navigate to create poster page
    navigate("/create-poster");
  };

  // Get poster title from CTA (prefer en, fallback to ar)
  const getPosterTitle = (job: Job) => {
    const transcription = job.transcription?.trim() ?? "";
    return transcription.length > 80
      ? `${transcription.slice(0, 80)}…`
      : transcription;
  };

  const getNavigationPath = (job: Job) => {
    return job.status === "completed" ? `/gallery/${job.id}` : "/create-poster";
  };

  return (
    <aside
      className={cn(
        "border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-20" : "w-60",
        className
      )}
      style={{ backgroundColor: "var(--background-secondary, #F9F9F9)" }}
    >
      <div className="p-6 flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "justify-center w-full"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-[#0B2242] flex items-center justify-center flex-shrink-0">
            <Logo />
          </div>
        </div>
        {!isCollapsed && (
          <Button
            onClick={onToggle}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 h-8 w-8"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* expand button when collapsed */}
      {isCollapsed && (
        <Button
          onClick={onToggle}
          variant="outline"
          size="icon"
          className="absolute -right-3 top-8 w-6 h-6 bg-white rounded-full border hover:text-white border-gray-200 shadow-sm hover:shadow-md"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 hover:text-white" />
        </Button>
      )}

      {/* navigation */}
      <nav className={cn("px-4 space-y-1", isCollapsed && "px-2")}>
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
            isActive("/")
              ? "text-gray-900 bg-white"
              : "text-gray-600 hover:bg-white",
            isCollapsed && "justify-center"
          )}
          title="Home"
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && "Home"}
        </Link>
        <Link
          to="/gallery"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
            isActive("/gallery")
              ? "text-gray-900 bg-white"
              : "text-gray-600 hover:bg-white",
            isCollapsed && "justify-center"
          )}
          title="Gallery"
        >
          <Image className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && "Gallery"}
        </Link>
        <Link
          to="/prompts"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
            isActive("/prompts")
              ? "text-gray-900 bg-white"
              : "text-gray-600 hover:bg-white",
            isCollapsed && "justify-center"
          )}
          title="Prompts"
        >
          <FileText className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && "Prompts"}
        </Link>
        <Link
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
            isActive("/settings")
              ? "text-gray-900 bg-white"
              : "text-gray-600 hover:bg-white",
            isCollapsed && "justify-center"
          )}
          title="Settings"
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && "Settings"}
        </Link>
      </nav>

      {/* generated poster section */}
      {!isCollapsed && (
        <div className="mt-2 px-4 flex-1">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Generated Poster
            </h3>
          </div>

          <button
            onClick={handleCreateNewPoster}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-white rounded-xl mb-2"
          >
            <Edit2 className="w-4 h-4" />
            Create new poster
          </button>

          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-300px)]">
            {isLoading && (
              <>
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="px-3 py-2.5">
                    <Skeleton className="h-5 w-full rounded bg-gray-200" />
                  </div>
                ))}
              </>
            )}
            {isError && (
              <p className="text-xs text-red-400 px-3 py-2">
                Error loading posters
              </p>
            )}
            {filteredJobs.map((job) => {
              const title = getPosterTitle(job);
              const path = getNavigationPath(job);
              const isActiveJob =
                location.pathname === `/gallery/${job.id}` ||
                (location.pathname === "/create-poster" &&
                  job.status !== "completed");

              return (
                <Link
                  key={job.id}
                  to={path}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-sm rounded-xl truncate block transition-colors",
                    isActiveJob
                      ? "text-gray-900 bg-white"
                      : "text-gray-600 hover:bg-white"
                  )}
                  title={title}
                >
                  {title}
                </Link>
              );
            })}

            {/* intersection observer target for infinite scroll */}
            {hasNextPage && <div ref={observerTarget} className="h-4" />}

            {/* loading more indicator */}
            {hasNextPage && isFetchingNextPage && (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`loading-${index}`} className="px-3 py-2.5">
                    <Skeleton className="h-5 w-full rounded bg-gray-200" />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
