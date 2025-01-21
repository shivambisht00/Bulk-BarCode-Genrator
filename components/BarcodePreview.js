import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PaginationControls from "./PaginationControls";
import DownloadControls from "./DownloadControls";
import ProgressBar from "./ProgressBar";
import BarcodeGrid from "./BarcodeGrid";

// A4 size constants
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 3.7795275591;
const A4_WIDTH = Math.floor(A4_WIDTH_MM * MM_TO_PX);
const A4_HEIGHT = Math.floor(A4_HEIGHT_MM * MM_TO_PX);
const PAGE_MARGIN = 20;

export default function BarcodePreview({ barcodeData, settings }) {
  const previewRef = useRef(null);
  const [processedPages, setProcessedPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [adjustedSettings, setAdjustedSettings] = useState(settings);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(true);
  const barcodeRefs = useRef({});
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const maxBarcodeWidth = A4_WIDTH - 2 * PAGE_MARGIN;
    const maxBarcodeHeight = A4_HEIGHT - 2 * PAGE_MARGIN;
    const newSettings = {
      ...settings,
      width: Math.min(settings.width, maxBarcodeWidth / 2), // Divide by 2 due to barcode internal multiplier
      height: Math.min(settings.height, maxBarcodeHeight),
    };
    setAdjustedSettings(newSettings);

    // Process barcodes into pages with proper wrapping
    const pages = [];
    let currentPage = [];
    let currentRow = 0;
    let currentCol = 0;

    barcodeData.forEach((code) => {
      // Check if we need to start a new row
      if (currentCol >= settings.cols) {
        currentCol = 0;
        currentRow++;
      }

      // Check if we need to start a new page
      if (currentRow >= settings.rows) {
        pages.push(currentPage);
        currentPage = [];
        currentRow = 0;
        currentCol = 0;
      }

      // Add barcode to current page
      currentPage.push(code);
      currentCol++;
    });

    // Add the last page if it has any barcodes
    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    setProcessedPages(pages);
  }, [barcodeData, settings]);

  const handleDownloadPDF = async () => {
    setLoading(true);
    abortControllerRef.current = new AbortController(); // Create a new AbortController
    const { signal } = abortControllerRef.current;

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [A4_WIDTH, A4_HEIGHT],
      });

      for (let i = 0; i < processedPages.length; i++) {
        if (signal.aborted) {
          throw new Error("Download cancelled");
        }
        if (i > 0) {
          pdf.addPage();
        }
        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
        });
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH, A4_HEIGHT);
        setProgress(((i + 1) / processedPages.length) * 100); // Update progress
      }

      pdf.save("barcodes.pdf");
    } catch (error) {
      if (error instanceof Error && error.message === "Download cancelled") {
        console.log("Download cancelled");
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
      setProgress(0); // Reset progress
      abortControllerRef.current = null; // Reset AbortController
    }
  };

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Cancel the download
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalPages = processedPages.length;

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const handleToggleText = () => {
    setShowText((prev) => !prev);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
        />
        <DownloadControls
          onPrint={handlePrint}
          onDownloadPDF={handleDownloadPDF}
          onCancelDownload={handleCancelDownload} // Pass cancel handler
          loading={loading}
        />
      </div>

      <div className="flex justify-end">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showText}
            onChange={handleToggleText}
          />
          <span>Show Text</span>
        </label>
      </div>

      {loading && <ProgressBar progress={progress} />}

      <div 
        ref={previewRef} 
        id="preview-container"
        className="relative bg-white shadow-lg mx-auto overflow-hidden print:shadow-none"
        style={{
          width: `${A4_WIDTH}px`,
          height: `${A4_HEIGHT}px`,
          padding: `${PAGE_MARGIN}px`,
        }}
      >
        {processedPages[currentPage] && (
          <BarcodeGrid
            barcodes={processedPages[currentPage]}
            settings={adjustedSettings}
            barcodeRefs={barcodeRefs}
            showText={showText} // Pass showText prop
          />
        )}
      </div>
    </div>
  );
}