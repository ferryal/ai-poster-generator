import { useState, useEffect, useRef } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import { PromptCard } from "@/components/prompt";
import { cn } from "@/lib/utils";
import { useUpdatePrompt } from "@/mutations";
import { usePrompts } from "@/queries";

export function PromptsPage() {
  const { data, isLoading, isError, error } = usePrompts();
  const { mutateAsync: updatePrompt } = useUpdatePrompt();
  const [activeIndex, setActiveIndex] = useState(0);
  const contentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (data?.prompts && data.prompts.length > 0) {
      setActiveIndex(0);
    }
  }, [data?.prompts]);

  const handleEdit = async (id: string, updatedTemplate: string) => {
    await updatePrompt({
      id,
      data: {
        template: updatedTemplate,
      },
    });
  };

  const handlePromptClick = (index: number, promptId: string) => {
    setActiveIndex(index);
    const element = contentRefs.current[promptId];
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">
          Prompt Management
        </h1>
        <p className="text-gray-600 text-sm">View and manage your AI prompts</p>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center flex-1">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading prompts...</p>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center flex-1">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-gray-900 font-semibold mb-2">
            Failed to load prompts
          </p>
          <p className="text-gray-600 text-sm">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      )}

      {!isLoading && !isError && data?.prompts && data.prompts.length > 0 && (
        <div className="flex flex-1 overflow-hidden">
          {/* left sidebar - prompt list */}
          <div className="w-56 bg-white overflow-y-auto">
            <div className="py-4">
              {data.prompts.map((prompt, index) => (
                <button
                  key={prompt._id}
                  onClick={() => handlePromptClick(index, prompt._id)}
                  className={cn(
                    "w-full px-6 py-3 text-left transition-colors",
                    "hover:bg-gray-100 rounded-2xl",
                    activeIndex === index
                      ? "bg-gray-100 border-blue-600 text-gray-900 font-medium rounded-2xl"
                      : "text-gray-700"
                  )}
                >
                  {prompt.name}
                </button>
              ))}
            </div>
          </div>

          {/* right content - prompt details */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-full mx-auto px-8 py-4 space-y-6 pr-0">
              {data.prompts.map((prompt) => (
                <div
                  key={prompt._id}
                  ref={(el) => {
                    contentRefs.current[prompt._id] = el;
                  }}
                >
                  <PromptCard prompt={prompt} onEdit={handleEdit} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading &&
        !isError &&
        (!data?.prompts || data.prompts.length === 0) && (
          <div className="flex flex-col items-center justify-center flex-1">
            <p className="text-gray-900 font-semibold mb-2">No prompts found</p>
            <p className="text-gray-600 text-sm">No prompts available</p>
          </div>
        )}
    </div>
  );
}
