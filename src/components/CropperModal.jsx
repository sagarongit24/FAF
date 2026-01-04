import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";

/**
 * Create a cropped blob with a fixed output size.
 * @param {string} imageSrc dataURL
 * @param {object} cropPixels { x, y, width, height }
 * @param {number} outW final width
 * @param {number} outH final height
 * @returns {Promise<Blob>}
 */
async function getCroppedBlob(imageSrc, cropPixels, outW, outH) {
  const image = await new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
  });

  // Draw the cropped area to an offscreen canvas at target size
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");

  // params: image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
  ctx.drawImage(
    image,
    cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height,
    0, 0, outW, outH
  );

  return await new Promise((res) =>
    canvas.toBlob((b) => res(b), "image/jpeg", 0.92)
  );
}

/**
 * Modal cropper
 * Props:
 *  - src: dataURL of selected file
 *  - onCancel: () => void
 *  - onDone: (blob) => void
 *  - aspect: number (default 5/4)
 *  - outW/outH: final dimensions (default 1500x1200 ~ 5:4)
 */
export default function CropperModal({
  src,
  onCancel,
  onDone,
  aspect = 5 / 4,
  outW = 1500,
  outH = 1200,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.2);
  const [areaPixels, setAreaPixels] = useState(null);
  const [working, setWorking] = useState(false);

  const onComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!areaPixels) return;
    setWorking(true);
    try {
      const blob = await getCroppedBlob(src, areaPixels, outW, outH);
      onDone(blob);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="cropper-backdrop" role="dialog" aria-modal="true">
      <div className="cropper-modal">
        <div className="cropper-viewport">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
            cropShape="rect"
            showGrid={false}
            objectFit="cover"
            restrictPosition={true}
          />
        </div>

        <div className="cropper-controls">
          <label>
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
          </label>

          <div className="cropper-actions">
            <button className="btn" onClick={onCancel} disabled={working}>
              Cancel
            </button>
            <button className="btn primary" onClick={handleSave} disabled={working}>
              {working ? "Saving…" : "Save Crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
