import { Progress } from "@/components/ui/progress";

export default function ProgressBar({ progress }) {
  return (
    <div className="w-full">
      <Progress value={progress} />
    </div>
  );
}