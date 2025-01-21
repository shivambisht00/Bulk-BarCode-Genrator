"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Upload, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Papa from "papaparse";

const BarcodePreview = dynamic(() => import("@/components/BarcodePreview"), {
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Barcode Generator</h1>
          <div className="flex gap-4">
            <Button variant="outline">
              <label className="cursor-pointer flex items-center gap-2">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <Card className="p-6 space-y-6 h-fit">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Customize Barcodes</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Barcode Type</Label>
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
          </Card>

          <div className="space-y-4">
            {barcodeData.length > 0 ? (
              <BarcodePreview barcodeData={barcodeData} settings={settings} />
            ) : (
              <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  Upload a CSV file to generate barcodes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}