import Barcode from "react-barcode";

export default function BarcodeGrid({
  barcodes,
  settings,
  barcodeRefs,
  showText
}) {
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
            displayValue={showText}
          />
        </div>
      ))}
    </div>
  );
}