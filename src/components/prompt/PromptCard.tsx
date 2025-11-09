import { Copy, Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Prompt } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (id: string, updatedTemplate: string) => void | Promise<void>;
}

export function PromptCard({ prompt, onEdit }: PromptCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState(prompt.template);
  const [isSaving, setIsSaving] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.template);
      toast({
        title: "Copied!",
        description: "Prompt template copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="rounded-xl p-2"
      style={{
        background: "var(--Background-Secondary, #F9F9F9)",
        border: "1px solid var(--Background-Tertiary, #F1F2F4)",
      }}
    >
      <div className="flex items-start justify-between gap-4 py-2 px-2">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {prompt.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-[#83888B]">
            <span>ID: {prompt._id}</span>
            <span>Last updated {formatDate(prompt.updatedAt)}</span>
          </div>
        </div>

        {!isEditing && (
          <Button
            onClick={() => {
              setEditedTemplate(prompt.template);
              setIsEditing(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white text-sm transition-all hover:scale-105 active:scale-95 shrink-0 h-auto"
            style={{
              background:
                "radial-gradient(49.46% 73.61% at 52.2% 100%, #3F6AA6 0%, #0B2242 100%)",
              border: "1px solid #FFFFFF14",
              boxShadow: "0px 12px 8px 8px #E3E3E31F, 0px 0px 0px 1px #0A1B33",
            }}
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        )}
      </div>

      {/* template content */}
      <div
        className="relative group rounded-xl p-4"
        style={{
          background: "var(--Background-Primary, #FFFFFF)",
          border: "1px solid var(--Background-Tertiary, #F1F2F4)",
          boxShadow: "0px 2px 4px 0px #00000014",
        }}
      >
        {!isEditing ? (
          <>
            <div className="text-[#83888B] text-sm leading-relaxed whitespace-pre-wrap pr-8">
              {prompt.template}
            </div>

            <Button
              onClick={handleCopy}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Copy template"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <Textarea
              value={editedTemplate}
              onChange={(event) => setEditedTemplate(event.target.value)}
              className="min-h-[200px] resize-vertical text-sm"
              placeholder="Update prompt template..."
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setEditedTemplate(prompt.template);
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    setIsSaving(true);
                    await onEdit(prompt._id, editedTemplate);
                    toast({
                      title: "Prompt updated",
                      description: "Template has been updated successfully.",
                    });
                    setIsEditing(false);
                  } catch (error) {
                    toast({
                      title: "Update failed",
                      description:
                        error instanceof Error
                          ? error.message
                          : "An error occurred while updating the prompt.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving || editedTemplate.trim().length === 0}
              >
                {isSaving ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
