import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";

export default function DownloadControls({
  onPrint,
  onDownloadPDF,
  onCancelDownload,
  loading,
}) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
      <Button variant="outline" onClick={onPrint} className="flex-1 sm:flex-none">
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button onClick={onDownloadPDF} disabled={loading} className="flex-1 sm:flex-none">
        <Download className="h-4 w-4 mr-2" />
        {loading ? "Downloading..." : "Download PDF"}
      </Button>
      {loading && (
        <Button variant="outline" onClick={onCancelDownload} className="flex-1 sm:flex-none">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      )}
    </div>
  );
}