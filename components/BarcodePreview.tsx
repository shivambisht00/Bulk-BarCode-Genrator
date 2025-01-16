"use client";

import { useRef, useState, useEffect } from "react";
import Barcode from "react-barcode";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import generatePDF from "react-to-pdf";
import type { BarcodeFormat } from "@/app/page";

interface BarcodePreviewProps {
  barcodeData: string[];
  settings: {
    width: number;
    height: number;
    fontSize: number;
    margin: number;
    rows: number;
    cols: number;
    format: BarcodeFormat;
  };
}

// A4 size in millimeters
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
// Convert to pixels (1mm = 3.7795275591 pixels at 96 DPI)
const MM_TO_PX = 3.7795275591;
const A4_WIDTH = Math.floor(A4_WIDTH_MM * MM_TO_PX);
const A4_HEIGHT = Math.floor(A4_HEIGHT_MM * MM_TO_PX);
const PAGE_MARGIN = 20; // 20px margin

export default function BarcodePreview({ barcodeData, settings }: BarcodePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [adjustedSettings, setAdjustedSettings] = useState(settings);
  const [processedPages, setProcessedPages] = useState<string[][]>([]);
  const [barcodeRefs] = useState<{ [key: string]: HTMLDivElement | null }>({});

  // Calculate maximum dimensions and organize barcodes into pages
  useEffect(() => {
    const availableWidth = A4_WIDTH - (PAGE_MARGIN * 2);
    const availableHeight = A4_HEIGHT - (PAGE_MARGIN * 2);
    const maxBarcodeWidth = Math.floor((availableWidth / settings.cols) - (settings.margin * 2));
    const maxBarcodeHeight = Math.floor((availableHeight / settings.rows) - (settings.margin * 2) - settings.fontSize);

    // Adjust settings to fit within page
    const newSettings = {
      ...settings,
      width: Math.min(settings.width, maxBarcodeWidth / 2), // Divide by 2 due to barcode internal multiplier
      height: Math.min(settings.height, maxBarcodeHeight),
    };
    setAdjustedSettings(newSettings);

    // Process barcodes into pages with proper wrapping
    const pages: string[][] = [];
    let currentPage: string[] = [];
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

  const handleDownloadPDF = () => {
    if (previewRef.current) {
      generatePDF(() => previewRef.current, {
        filename: "barcodes.pdf",
      });
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handlePrevPage}
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
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

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
          <div
            className="grid h-full"
            style={{
              gridTemplateColumns: `repeat(${adjustedSettings.cols}, 1fr)`,
              gridAutoRows: `minmax(0, 1fr)`,
              gap: '16px',
            }}
          >
            {processedPages[currentPage].map((code, index) => (
              <div
                key={`${code}-${index}`}
                ref={(el) => barcodeRefs[`${code}-${index}`] = el}
                className="flex items-center justify-center overflow-hidden"
                style={{ 
                  padding: `${adjustedSettings.margin}px`,
                }}
              >
                <Barcode
                  value={code}
                  width={adjustedSettings.width}
                  height={adjustedSettings.height}
                  fontSize={adjustedSettings.fontSize}
                  margin={0}
                  format={adjustedSettings.format}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}