import { Settings, Image, Grid3x3 } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  iconBg: string;
}

function FeatureCard({
  icon,
  title,
  description,
  features,
  iconBg,
}: FeatureCardProps) {
  return (
    <Card className="bg-white rounded-2xl border border-gray-100 h-full flex flex-col">
      <CardHeader className="pb-4">
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center mb-4`}
        >
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: <Settings className="w-6 h-6 text-white" />,
      iconBg: "bg-green-500",
      title: "Smart AI Processing",
      description:
        "7-step pipeline with Gemini 2.5 Flash for intelligent conte...",
      features: [
        "Audio transcription with AI",
        "Multi-language copy generation",
        "Smart image optimization",
      ],
    },
    {
      icon: <Image className="w-6 h-6 text-white" />,
      iconBg: "bg-red-500",
      title: "Studio-Quality Images",
      description:
        "Transform product photos into professional marketing vis...",
      features: [
        "Professional photoshoot effects",
        "4K resolution upscaling",
        "Background removal & blending",
      ],
    },
    {
      icon: <Grid3x3 className="w-6 h-6 text-white" />,
      iconBg: "bg-blue-900",
      title: "Multiple Designs",
      description: "Generate 3 unique design variations for every poster",
      features: [
        "HTML-based designs",
        "Validation scoring",
        "Export in multiple formats",
      ],
    },
  ];

  return (
    <div className="w-full max-w-screen-xl mx-auto mt-16 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Powerful Features
        </h2>
        <p className="text-gray-500 text-center sm:text-left">
          Everything you need to create stunning posters
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4 md:gap-x-6">
        {features.map((feature, index) => (
          <div key={index} className="flex h-full">
            <FeatureCard {...feature} />
          </div>
        ))}
      </div>
    </div>
  );
}

