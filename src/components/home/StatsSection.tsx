import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface StatCardProps {
  value: string;
  label: string;
  isLast?: boolean;
}

function StatCard({ value, label, isLast }: StatCardProps) {
  return (
    <>
      <div className="text-center py-6">
        <div
          className="text-3xl font-bold mb-1 bg-clip-text text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #1C57A8 0%, #12386C 34.75%, #1C57A8 100%)",
          }}
        >
          {value}
        </div>
        <div
          className="text-sm"
          style={{
            color: "var(--Text-Secondary, #83888B)",
          }}
        >
          {label}
        </div>
      </div>
      {!isLast && <Separator orientation="vertical" className="h-auto" />}
    </>
  );
}

export function StatsSection() {
  const stats = [
    { value: "10K+", label: "Posters Created" },
    { value: "95%", label: "Success Rate" },
    { value: "30s", label: "Avg. Processing" },
    { value: "4K", label: "Resolution" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mt-16">
      <Card
        className="rounded-3xl p-0 px-6 border-0"
        style={{
          backgroundColor: "var(--background-secondary, #F9F9F9)",
          border: "1px solid var(--background-tertiary, #F1F2F4)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between p-2 gap-0">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              value={stat.value}
              label={stat.label}
              isLast={index === stats.length - 1}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

