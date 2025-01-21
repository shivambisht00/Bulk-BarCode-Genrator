import { Button } from "@/components/ui/button";
import { Download, Printer, X } from "lucide-react";

export default function DownloadControls({
  onPrint,
  onDownloadPDF,
  onCancelDownload,
  loading,
}) {
  return (
    <div className="flex gap-4">
      <Button variant="outline" onClick={onPrint}>
        <Printer className="h-4 w-4 mr-2" />
        Print
      </Button>
      <Button onClick={onDownloadPDF} disabled={loading}>
        <Download className="h-4 w-4 mr-2" />
        {loading ? "Downloading..." : "Download PDF"}
      </Button>
      {loading && (
        <Button variant="outline" onClick={onCancelDownload}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      )}
    </div>
  );
}