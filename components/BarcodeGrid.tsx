import Barcode from "react-barcode";

interface BarcodeGridProps {
  barcodes: string[];
  settings: {
    format: "CODE39" | "CODE128" | "CODE128A" | "CODE128B" | "CODE128C" | "EAN13" | "EAN8" | "EAN5" | "EAN2" | "UPC" | "UPCE" | "ITF14" | "ITF" | "MSI" | "MSI10" | "MSI11" | "MSI1010" | "MSI1110" | "pharmacode" | "codabar" | "GenericBarcode" | undefined;
    width: number;
    height: number;
    fontSize: number;
    margin: number;
    cols: number;
  };
  barcodeRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  showText: boolean; // Add showText prop
}

export default function BarcodeGrid({
  barcodes,
  settings,
  barcodeRefs,
  showText, // Destructure showText prop
}: BarcodeGridProps) {
  return (
    <div
      className="grid h-full"
      style={{
        gridTemplateColumns: `repeat(${settings.cols}, 1fr)`,
        gridAutoRows: `minmax(0, 1fr)`,
        gap: '16px',
      }}
    >
      {barcodes.map((code, index) => (
        <div
          key={`${code}-${index}`}
          ref={(el) => (barcodeRefs.current[`${code}-${index}`] = el)}
          className="flex flex-col items-center justify-center overflow-hidden"
          style={{ 
            padding: `${settings.margin}px`,
          }}
        >
          <Barcode
            value={code}
            width={settings.width}
            height={settings.height}
            fontSize={settings.fontSize}
            format={settings.format}
            displayValue={showText} // Use showText prop
          />
        </div>
      ))}
    </div>
  );
}