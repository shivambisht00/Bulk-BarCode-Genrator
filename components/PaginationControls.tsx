import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={onPrevPage}
        disabled={currentPage === 0}
        size="sm"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button
        variant="outline"
        onClick={onNextPage}
        disabled={currentPage === totalPages - 1}
        size="sm"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}