import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PosterStepSettingsProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  uploadedImage: File | null;
  isLoading?: boolean;
  error?: string | null;
}

const orientations = ["Horizontal", "Vertical", "Square"];

const backgroundColors = [
  { name: "White", key: "white", color: "#FFFFFF" },
  { name: "Red", key: "red", color: "#FF6F61" },
  { name: "Beige (Recommended)", key: "beige", color: "#EFE7DD" },
  { name: "Light Gray", key: "light_gray", color: "#F3F4F6" },
  { name: "Soft Cream", key: "soft_cream", color: "#FDF6EC" },
  { name: "Modern Blue", key: "modern_blue", color: "#4A90E2" },
  {
    name: "Gradient Ready",
    key: "gradient_ready",
    color: "rgba(255, 255, 255, 0.7)",
  },
];

const productPositionOptions = [
  { value: "left", label: "Left", alignClass: "items-center justify-start" },
  {
    value: "center",
    label: "Center",
    alignClass: "items-center justify-center",
  },
  { value: "right", label: "Right", alignClass: "items-center justify-end" },
  { value: "top", label: "Top", alignClass: "items-start justify-center" },
  { value: "bottom", label: "Bottom", alignClass: "items-end justify-center" },
];

const productPositionGrid: Array<Array<string | null>> = [
  ["left", "top", "right"],
  [null, "center", null],
  [null, "bottom", null],
];

const fontOptions = [
  { key: "effraThin", label: "Effra Thin", weight: "300 weight", value: 300 },
  {
    key: "effraRegular",
    label: "Effra Regular",
    weight: "400 weight",
    value: 400,
  },
  { key: "effraBold", label: "Effra Bold", weight: "700 weight", value: 700 },
];

const imageOptions = [
  {
    key: "ctaPatternIcon",
    label: "CTA Pattern Icon",
    description: "Call-to-action pattern",
  },
  {
    key: "logoBottomLeft",
    label: "Logo Bottom Left",
    description: "Logo placement bottom left",
  },
  {
    key: "logoTopLeft",
    label: "Logo Top Left",
    description: "Logo placement top left",
  },
  {
    key: "logoTopRight",
    label: "Logo Top Right",
    description: "Logo placement top right",
  },
  {
    key: "textBackgroundShape",
    label: "Text Background Shape",
    description: "Background shape for text",
  },
];

// Size options per orientation
const sizeOptions = {
  Horizontal: [
    { label: "HD Display (1920 x 1080)", value: "standard" },
    { label: "Ultra Wide (2560 x 1080)", value: "wide" },
    { label: "Social Media (1200 x 630)", value: "social" },
    { label: "Web Banner (2400 x 800)", value: "banner" },
  ],
  Vertical: [
    { label: "Instagram Story (1080 x 1920)", value: "standard" },
    { label: "Instagram Post (1080 x 1350)", value: "poster" },
    { label: "Pinterest (1000 x 1500)", value: "pinterest" },
    { label: "Portrait (1200 x 1600)", value: "portrait" },
  ],
  Square: [
    { label: "Instagram (1080 x 1080)", value: "standard" },
    { label: "Large Square (1500 x 1500)", value: "large" },
  ],
};

export function PosterStepSettings({
  settings,
  onSettingsChange,
  onNext,
  onPrevious,
  uploadedImage,
  isLoading,
  error,
}: PosterStepSettingsProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Generate preview URL when component mounts or uploadedImage changes
  useEffect(() => {
    if (uploadedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(uploadedImage);
    }
  }, [uploadedImage]);

  const handleOrientationChange = (orientation: string) => {
    // Reset size to "standard" when orientation changes
    onSettingsChange({ ...settings, orientation, size: "standard" });
  };

  const handleBackgroundColorChange = (colorKey: string) => {
    onSettingsChange({ ...settings, backgroundColor: colorKey });
  };

  const handleFontToggle = (font: string) => {
    onSettingsChange({
      ...settings,
      fonts: {
        ...settings.fonts,
        [font]: !settings.fonts[font],
      },
    });
  };

  const handleImageToggle = (image: string) => {
    onSettingsChange({
      ...settings,
      images: {
        ...settings.images,
        [image]: !settings.images[image],
      },
    });
  };

  const fonts = settings.fonts || {};
  const images = settings.images || {};

  const areAllFontsSelected = fontOptions.every(
    (option) => !!fonts[option.key]
  );
  const areAllImagesSelected = imageOptions.every(
    (option) => !!images[option.key]
  );

  const handleFontSelectAll = (select: boolean) => {
    const nextFonts = { ...fonts };
    fontOptions.forEach((option) => {
      nextFonts[option.key] = select;
    });

    onSettingsChange({
      ...settings,
      fonts: nextFonts,
    });
  };

  const handleImageSelectAll = (select: boolean) => {
    const nextImages = { ...images };
    imageOptions.forEach((option) => {
      nextImages[option.key] = select;
    });

    onSettingsChange({
      ...settings,
      images: nextImages,
    });
  };

  const productPositionClass =
    productPositionOptions.find(
      (option) => option.value === settings.productPosition
    )?.alignClass || "items-center justify-center";

  const hasSmartPadding =
    settings.smartPadding ?? settings.minimalPadding ?? false;
  const posterPaddingClass = hasSmartPadding ? "p-6" : "p-10";

  const titleFontWeight = fonts.effraBold
    ? 700
    : fonts.effraRegular
    ? 600
    : fonts.effraThin
    ? 300
    : 700;
  const bodyFontWeight = fonts.effraRegular
    ? 400
    : fonts.effraThin
    ? 300
    : fonts.effraBold
    ? 600
    : 400;

  const fontFamily = "'Effra', 'Helvetica Neue', 'Arial', 'sans-serif'";

  const showDefaultLogo =
    !images.logoTopLeft && !images.logoTopRight && !images.logoBottomLeft;

  return (
    <div className="max-w-6xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Side - Settings */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6">
              {/* Language */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">
                  Language
                </Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) =>
                    onSettingsChange({ ...settings, language: value })
                  }
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Orientation */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">
                  Orientation
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {orientations.map((orientation) => {
                    const isActive = settings.orientation === orientation;
                    return (
                      <Button
                        key={orientation}
                        type="button"
                        variant={isActive ? "default" : "outline"}
                        onClick={() => handleOrientationChange(orientation)}
                        className={cn(
                          "rounded-xl py-3 text-sm font-semibold transition-all",
                          isActive
                            ? "bg-[#0B2242] text-white hover:bg-[#0B2242]/90"
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                        )}
                      >
                        {orientation}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">
                  Size
                </Label>
                <Select
                  value={settings.size}
                  onValueChange={(value) =>
                    onSettingsChange({ ...settings, size: value })
                  }
                >
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizeOptions[
                      settings.orientation as keyof typeof sizeOptions
                    ].map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Position & Background Color */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">
                      Product Position
                    </Label>
                    <p className="text-xs text-gray-500">
                      Choose how your product is framed inside the poster.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-[160px]">
                    {productPositionGrid.flatMap((row, rowIndex) =>
                      row.map((cell, cellIndex) => {
                        if (!cell) {
                          return (
                            <div
                              key={`empty-${rowIndex}-${cellIndex}`}
                              aria-hidden
                              className="w-[51px] h-[17px] rounded-xl border border-gray-100 bg-gray-50"
                            />
                          );
                        }

                        const option = productPositionOptions.find(
                          (item) => item.value === cell
                        );

                        if (!option) {
                          return null;
                        }

                        const isActive = settings.productPosition === cell;

                        return (
                          <button
                            key={cell}
                            type="button"
                            onClick={() =>
                              onSettingsChange({
                                ...settings,
                                productPosition: cell,
                              })
                            }
                            title={option.label}
                            aria-pressed={isActive}
                            className={cn(
                              "w-[51px] h-[17px] rounded-xl border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B2242]/40",
                              isActive
                                ? "border-[#0B2242] bg-[#0B2242]/5 shadow-sm"
                                : "border-gray-200 bg-gray-50 hover:border-gray-300"
                            )}
                          />
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">
                    Background Color
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {backgroundColors.map((bgColor) => (
                      <button
                        key={bgColor.key}
                        onClick={() => handleBackgroundColorChange(bgColor.key)}
                        className={cn(
                          "w-8 h-8 rounded border-2 transition-all",
                          settings.backgroundColor === bgColor.key
                            ? "border-[#0B2242] ring-2 ring-[#0B2242] ring-offset-2"
                            : "border-gray-300"
                        )}
                        style={{ backgroundColor: bgColor.color }}
                        title={bgColor.name}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Smart Minimal Padding */}
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
                <div>
                  <Label className="text-sm font-semibold text-gray-900">
                    Smart Minimal Padding
                  </Label>
                  <p className="text-xs text-gray-500">
                    Automatically balance spacing for a clean look.
                  </p>
                </div>
                <Switch
                  checked={hasSmartPadding}
                  onCheckedChange={(checked) =>
                    onSettingsChange({ ...settings, smartPadding: checked })
                  }
                />
              </div>
            </div>
            {/* </div> */}

            {/* Fonts */}
            {/* <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"> */}
            <div className="flex flex-wrap items-start justify-between gap-4 mt-4 mb-2">
              <div>
                <Label className="text-sm font-semibold text-gray-900">
                  Fonts
                </Label>
                <p className="text-xs text-gray-500">
                  Selected fonts will be available to the AI and reflected in
                  the preview.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleFontSelectAll(!areAllFontsSelected)}
                className="h-auto rounded-full px-3 py-1 text-xs font-semibold text-[#0B2242] hover:bg-[#0B2242]/5"
              >
                {areAllFontsSelected ? "Clear All" : "Select All"}
              </Button>
            </div>
            <div className="grid gap-2">
              {fontOptions.map((option) => {
                const isActive = !!fonts[option.key];
                const checkboxId = `font-${option.key}`;
                return (
                  <label
                    key={option.key}
                    htmlFor={checkboxId}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition-all",
                      isActive
                        ? "border-[#0B2242] bg-[#0B2242]/5 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={checkboxId}
                        checked={isActive}
                        onCheckedChange={() => handleFontToggle(option.key)}
                        className="h-4 w-4 border-gray-300 data-[state=checked]:border-[#0B2242] data-[state=checked]:bg-[#0B2242]"
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {option.weight}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
            {/* </div> */}

            {/* Images & Icons */}
            {/* <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4"> */}
            <div className="flex flex-wrap items-start justify-between gap-4 mt-4 mb-2">
              <div>
                <Label className="text-sm font-semibold text-gray-900">
                  Images & Icons
                </Label>
                <p className="text-xs text-gray-500">
                  Selected assets will be available to the AI and mirrored in
                  the preview.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleImageSelectAll(!areAllImagesSelected)}
                className="h-auto rounded-full px-3 py-1 text-xs font-semibold text-[#0B2242] hover:bg-[#0B2242]/5"
              >
                {areAllImagesSelected ? "Clear All" : "Select All"}
              </Button>
            </div>
            <div className="grid gap-2">
              {imageOptions.map((option) => {
                const isActive = !!images[option.key];
                const checkboxId = `image-${option.key}`;
                return (
                  <label
                    key={option.key}
                    htmlFor={checkboxId}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition-all",
                      isActive
                        ? "border-[#0B2242] bg-[#0B2242]/5 shadow-sm"
                        : "border-gray-200 hover-border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={checkboxId}
                        checked={isActive}
                        onCheckedChange={() => handleImageToggle(option.key)}
                        className="h-4 w-4 border-gray-300 data-[state=checked]:border-[#0B2242] data-[state=checked]:bg-[#0B2242]"
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className="space-y-6">
          <div className="lg:sticky lg:top-1 space-y-4">
            <Card className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <Label className="block text-sm font-semibold text-gray-900">
                Preview
              </Label>
              <div
                className="relative mx-auto w-full overflow-hidden rounded-[32px] border border-gray-200 shadow-inner transition-all"
                style={{
                  backgroundColor:
                    backgroundColors.find(
                      (c) => c.key === settings.backgroundColor
                    )?.color || "#EFE7DD",
                  aspectRatio:
                    settings.orientation === "Horizontal"
                      ? "16/9"
                      : settings.orientation === "Square"
                      ? "1/1"
                      : "9/16",
                  maxWidth: "360px",
                }}
              >
                {images.ctaPatternIcon && (
                  <div className="pointer-events-none absolute inset-x-6 top-6 h-20 rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md" />
                )}

                {showDefaultLogo && (
                  <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                    Logo
                  </div>
                )}

                {images.logoTopLeft && (
                  <div className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                    Logo
                  </div>
                )}
                {images.logoTopRight && (
                  <div className="absolute right-6 top-6 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                    Logo
                  </div>
                )}
                {images.logoBottomLeft && (
                  <div className="absolute bottom-6 left-6 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                    Logo
                  </div>
                )}

                <div
                  className={cn(
                    "relative flex h-full w-full flex-col gap-6",
                    posterPaddingClass
                  )}
                >
                  <div
                    className={cn(
                      "relative flex flex-1 transition-all",
                      productPositionClass
                    )}
                  >
                    <div className="flex max-w-[70%] items-center justify-center">
                      {uploadedImage && previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Product preview"
                          className="max-h-full max-w-full rounded-3xl object-contain"
                        />
                      ) : (
                        <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white/60 text-xs font-semibold text-gray-500">
                          Product Image
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative transition-all">
                    {images.textBackgroundShape && (
                      <div className="absolute inset-0 rounded-3xl bg-white/75 backdrop-blur-sm" />
                    )}
                    <div
                      className={cn(
                        "relative space-y-3",
                        images.textBackgroundShape ? "rounded-3xl p-5" : ""
                      )}
                    >
                      <h4
                        className="text-lg text-gray-900"
                        style={{ fontFamily, fontWeight: titleFontWeight }}
                      >
                        Lorem Ipsum
                      </h4>
                      <p
                        className="text-xs leading-relaxed text-gray-600"
                        style={{ fontFamily, fontWeight: bodyFontWeight }}
                      >
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Quisque egesim, venenatis mollis ac, rutrum lectus
                        magna.
                      </p>
                      <button
                        className="w-full rounded-xl bg-[#0B2242] py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
                        style={{ fontFamily }}
                      >
                        CTA Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center text-xs text-gray-500">
                {settings.orientation} ·{" "}
                {sizeOptions[
                  settings.orientation as keyof typeof sizeOptions
                ].find((s) => s.value === settings.size)?.label ||
                  settings.size}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-gray-200">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          onClick={onNext}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 text-white disabled:opacity-50"
          style={{
            background:
              "radial-gradient(49.46% 73.61% at 52.2% 100%, #3F6AA6 0%, #0B2242 100%)",
          }}
        >
          {isLoading ? "Uploading..." : "Generate"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
