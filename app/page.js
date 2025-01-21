"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Upload, Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import Papa from "papaparse";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// Add these new imports
import PaginationControls from "../components/PaginationControls";
import DownloadControls from "../components/DownloadControls";
import ProgressBar from "../components/ProgressBar";

const BarcodePreview = dynamic(() => import("../components/BarcodePreview"), {
  ssr: false,
});

export default function Home() {
  const [barcodeData, setBarcodeData] = useState([]);
  const [settings, setSettings] = useState({
    width: 1,
    height: 30,
    fontSize: 14,
    margin: 10,
    rows: 5,
    cols: 2,
    format: "CODE128"
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(true);
  const previewRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        complete: (results) => {
          const codes = results.data.flat().filter(Boolean);
          setBarcodeData(codes);
        },
      });
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (barcodeData.length > 0) {
      const itemsPerPage = settings.rows * settings.cols;
      const calculatedTotalPages = Math.ceil(barcodeData.length / itemsPerPage);
      setTotalPages(calculatedTotalPages);
    } else {
      setTotalPages(1);
    }
  }, [barcodeData, settings.rows, settings.cols]);

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    
    setLoading(true);
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Generate PDF for each page
      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        if (pageNum > 0) {
          pdf.addPage();
        }
        
        // Change to the correct page
        setCurrentPage(pageNum);
        
        // Wait for the page to render
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(previewRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
        });

        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

        // Update progress
        setProgress(((pageNum + 1) / totalPages) * 100);
      }

      pdf.save('barcodes.pdf');
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleCancelDownload = () => {
    setLoading(false);
  };

  const handleToggleText = () => {
    setShowText(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div 
        className="bg-white rounded-xl shadow-lg mx-auto border-2" 
        style={{ 
          maxWidth: '90vw',
          minHeight: '95vh',
          borderColor: 'rgb(0,185,174)',
          backgroundColor: 'rgb(0,185,174,0.01)'
        }}
      >
        {/* Title Bar */}
        <div className="p-4 ">
          <h1 className="text-2xl font-bold text-gray-800">
            Bulk Barcode Generator
          </h1>
        </div>

        <div className="flex flex-col md:flex-row" style={{ height: 'calc(95vh - 60px)' }}>
          {/* Left Panel - adjust maxHeight */}
          <div className="w-full md:w-[320px] border-r border-gray-200 overflow-y-auto" 
               style={{ maxHeight: 'calc(95vh - 60px)' }}>
            {/* Upload Section */}
            <div className="p-6 border-b border-gray-200">
              <Button variant="outline" className="w-full bg-white hover:bg-gray-50">
                <label className="cursor-pointer flex items-center gap-2 w-full justify-center">
                  <Upload className="h-4 w-4" />
                  Upload CSV
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </Button>
            </div>

            {/* Settings Section */}
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Barcode Settings</h2>
              </div>

              <div className="space-y-5">
                {/* Barcode Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Barcode Type</Label>
                  <Select
                    value={settings.format}
                    onValueChange={(value) =>
                      setSettings((s) => ({ ...s, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select barcode type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CODE128">Code 128 (General purpose)</SelectItem>
                      <SelectItem value="EAN13">EAN-13 (13 digits)</SelectItem>
                      <SelectItem value="EAN8">EAN-8 (8 digits)</SelectItem>
                      <SelectItem value="EAN5">EAN-5 (5 digits)</SelectItem>
                      <SelectItem value="EAN2">EAN-2 (2 digits)</SelectItem>
                      <SelectItem value="UPC">UPC (12 digits)</SelectItem>
                      <SelectItem value="CODE39">Code 39 (Alphanumeric)</SelectItem>
                      <SelectItem value="ITF14">ITF-14 (14 digits)</SelectItem>
                      <SelectItem value="MSI">MSI (Numeric)</SelectItem>
                      <SelectItem value="pharmacode">Pharmacode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Other settings controls */}
                <div className="space-y-2">
                  <Label>Barcode Width</Label>
                  <Slider
                    value={[settings.width]}
                    min={1}
                    max={3}
                    step={0.1}
                    onValueChange={([width]) =>
                      setSettings((s) => ({ ...s, width }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Barcode Height</Label>
                  <Slider
                    value={[settings.height]}
                    min={30}
                    max={150}
                    onValueChange={([height]) =>
                      setSettings((s) => ({ ...s, height }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Slider
                    value={[settings.fontSize]}
                    min={8}
                    max={16}
                    onValueChange={([fontSize]) =>
                      setSettings((s) => ({ ...s, fontSize }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Margin</Label>
                  <Slider
                    value={[settings.margin]}
                    min={5}
                    max={15}
                    onValueChange={([margin]) =>
                      setSettings((s) => ({ ...s, margin }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rows per Page</Label>
                  <Input
                    type="number"
                    value={settings.rows}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        rows: Math.min(12, Math.max(1, parseInt(e.target.value) || 1)),
                      }))
                    }
                    min={1}
                    max={12}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Columns per Page</Label>
                  <Input
                    type="number"
                    value={settings.cols}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        cols: Math.min(4, Math.max(1, parseInt(e.target.value) || 1)),
                      }))
                    }
                    min={1}
                    max={4}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - adjust maxHeight */}
          <div className="flex-1 flex flex-col p-4" 
               style={{ maxHeight: 'calc(95vh - 60px)' }}>
            {/* Controls Bar */}
            <div className="mb-6 flex justify-between items-center pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrevPage={handlePrevPage}
                  onNextPage={handleNextPage}
                />
                <label className="flex items-center space-x-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={showText}
                    onChange={handleToggleText}
                    className="rounded border-gray-300"
                  />
                  <span>Show Text</span>
                </label>
              </div>
              <DownloadControls
                onPrint={handlePrint}
                onDownloadPDF={handleDownloadPDF}
                onCancelDownload={handleCancelDownload}
                loading={loading}
              />
            </div>

            {/* Progress Bar */}
            {loading && <ProgressBar progress={progress} />}

            {/* Preview Area - removed overflow and adjusted container */}
            <div className="flex-1 flex items-center justify-center py-2">
              {barcodeData.length > 0 ? (
                <BarcodePreview 
                  barcodeData={barcodeData} 
                  settings={settings}
                  currentPage={currentPage}
                  showText={showText}
                  ref={previewRef}
                />
              ) : (
                <div className="w-[595px] h-[600px] border-2 border-[rgb(0,185,174)] rounded-lg flex flex-col items-center justify-center bg-[rgb(0,185,174,0.05)]">
                  <Upload className="h-12 w-12 text-[rgb(0,185,174)] mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Upload CSV to Generate Barcodes
                  </p>
                  <p className="text-sm text-gray-500">
                    Preview will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}