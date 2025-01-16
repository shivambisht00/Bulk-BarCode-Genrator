import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="w-full">
      <Progress value={progress} />
    </div>
  );
}