import { forwardRef, useState, useEffect, useRef } from "react";
import BarcodeGrid from "./BarcodeGrid";

// A4 size constants
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PX = 3.7795275591;
const A4_WIDTH = Math.floor(A4_WIDTH_MM * MM_TO_PX);
const A4_HEIGHT = Math.floor(A4_HEIGHT_MM * MM_TO_PX);
const PAGE_MARGIN = 20;

// Modify these constants to scale down the preview
const PREVIEW_SCALE = 0.72; // Increased from 0.65 to 0.72 for better visibility
const A4_PREVIEW_WIDTH = Math.floor(A4_WIDTH * PREVIEW_SCALE);
const A4_PREVIEW_HEIGHT = Math.floor(A4_HEIGHT * PREVIEW_SCALE);
const PREVIEW_MARGIN = Math.floor(PAGE_MARGIN * PREVIEW_SCALE);

const BarcodePreview = forwardRef(({ barcodeData, settings, currentPage, showText }, ref) => {
  const [processedPages, setProcessedPages] = useState([]);
  const [adjustedSettings, setAdjustedSettings] = useState(settings);
  const barcodeRefs = useRef({});

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

    // After processing pages, update parent component
    if (pages.length > 0) {
      // This will help parent component know how many pages there are
      setProcessedPages(pages);
    }
  }, [barcodeData, settings]);

  return (
    <div 
      ref={ref}
      id="preview-container"
      className="relative bg-white shadow-lg mx-auto print:shadow-none"
      style={{
        width: `${A4_PREVIEW_WIDTH}px`,
        height: `${A4_PREVIEW_HEIGHT}px`,
        maxWidth: '90vw',
        maxHeight: '85vh',
        padding: `${PREVIEW_MARGIN}px`,
        transform: `scale(${PREVIEW_SCALE})`,
        transformOrigin: 'center center',
      }}
    >
      {processedPages[currentPage] && (
        <BarcodeGrid
          barcodes={processedPages[currentPage]}
          settings={{
            ...adjustedSettings,
            width: adjustedSettings.width * PREVIEW_SCALE,
            height: adjustedSettings.height * PREVIEW_SCALE,
            fontSize: adjustedSettings.fontSize * PREVIEW_SCALE,
            margin: adjustedSettings.margin * PREVIEW_SCALE,
          }}
          barcodeRefs={barcodeRefs}
          showText={showText}
        />
      )}
    </div>
  );
});

BarcodePreview.displayName = 'BarcodePreview';
export default BarcodePreview;