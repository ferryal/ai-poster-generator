import { CloudUpload, Plus, Mic, ArrowRight, X } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PosterStepUploadProps {
  onNext: (imageFile: File, audioFile: File) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function PosterStepUpload({
  onNext,
  isLoading,
  error,
}: PosterStepUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  console.log(audioBlob);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAudioInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAudioFile(files[0]);
      setAudioBlob(null); // Clear any recorded audio
    }
  };

  const handleClickAudioUpload = () => {
    audioInputRef.current?.click();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        setAudioBlob(audioBlob);

        // Convert blob to file
        const audioFile = new File(
          [audioBlob],
          `recording-${Date.now()}.webm`,
          { type: "audio/webm" }
        );
        setAudioFile(audioFile);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      alert("Failed to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    setAudioBlob(null);
  };

  const handleNext = () => {
    if (selectedFile && audioFile) {
      onNext(selectedFile, audioFile);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Combined Upload Area and Input in One Card */}
      <Card
        className="rounded-[20px] p-1 border-0"
        style={{
          backgroundColor: "var(--background-secondary, #F9F9F9)",
          boxShadow:
            "0px 0px 0px 3px #F6F6F6, 0px 2px 4px 0px rgba(0, 0, 0, 0.12)",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* upload area */}
        <div
          className={`
            relative rounded-2xl text-center transition-colors mb-6 cursor-pointer
            ${isDragging ? "bg-blue-50" : ""}
            ${previewUrl ? "p-8" : "p-24"}
          `}
          onClick={handleClickUpload}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {previewUrl ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-64 rounded-lg shadow-md"
              />
              <p className="text-sm text-gray-600">{selectedFile?.name}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
              >
                Change Image
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <CloudUpload className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  Upload your product image
                </h3>
                <p className="text-sm text-gray-500">
                  Drag and drop your file here or click to browse. Supports JPG
                  & PNG up to 10 MB.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Audio Upload/Recording Area */}
        <div className="relative">
          <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 p-2 shadow-sm">
            {/* Hidden audio file input */}
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mp3,audio/m4a,audio/wav,audio/webm,audio/mpeg"
              className="hidden"
              onChange={handleAudioInputChange}
            />

            {/* Audio Upload Button */}
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 hover:bg-gray-50 rounded-lg"
              onClick={handleClickAudioUpload}
              title="Upload audio file"
            >
              <Plus className="w-5 h-5 text-brand-primary" />
            </Button>

            {/* Audio Status Display */}
            <div className="flex-1 min-w-0">
              {audioFile ? (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-900 truncate">
                    {audioFile.name}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 flex-shrink-0 hover:bg-red-50 rounded-lg"
                    onClick={handleRemoveAudio}
                  >
                    <X className="w-2 h-2 text-red-500" />
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {isRecording
                    ? "Recording... Click mic to stop"
                    : "Upload audio file or record with microphone"}
                </p>
              )}
            </div>

            {/* Microphone Recording Button */}
            <Button
              variant="ghost"
              size="icon"
              className={`w-10 h-10 hover:bg-gray-50 ${
                isRecording ? "bg-red-50" : ""
              }`}
              onClick={isRecording ? stopRecording : startRecording}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              <Mic
                className={`w-5 h-5 ${
                  isRecording
                    ? "text-red-500 animate-pulse"
                    : "text-brand-primary"
                }`}
              />
            </Button>

            {/* Next Button */}
            <Button
              onClick={handleNext}
              disabled={!selectedFile || !audioFile || isLoading}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background:
                  "radial-gradient(49.46% 73.61% at 52.2% 100%, #3F6AA6 0%, #0B2242 100%)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow:
                  "0px 12px 8px 8px rgba(227, 227, 227, 0.12), 0px 0px 0px 1px #0A1B33",
              }}
            >
              {isLoading ? "Creating..." : "Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
