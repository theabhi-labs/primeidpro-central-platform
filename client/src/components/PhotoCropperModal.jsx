import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Crop, RotateCw, ZoomIn, ZoomOut, Check, Palette, Sparkles } from 'lucide-react';

const PhotoCropperModal = ({ isOpen, onClose, imageSrc, template, onConfirm }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const canvasRef = useRef(null);

  const bgColors = [
    { label: 'White (Standard)', value: '#FFFFFF', hex: 'bg-white text-slate-900' },
    { label: 'Light Blue', value: '#D4E6F1', hex: 'bg-[#D4E6F1] text-slate-900' },
    { label: 'Light Grey', value: '#E5E7EB', hex: 'bg-[#E5E7EB] text-slate-900' },
    { label: 'Original', value: 'ORIGINAL', hex: 'bg-slate-700 text-white' }
  ];

  const targetRatio = template?.aspectRatio || 35 / 45;

  const handleApply = () => {
    onConfirm({
      cropSettings: {
        zoom,
        rotation,
        aspectRatio: targetRatio
      },
      backgroundColor
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customize Photo Crop & Background" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Interactive Preview Canvas / Container */}
        <div className="relative w-full h-80 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
          {/* Target Crop Mask Overlay */}
          <div
            className="relative border-2 border-indigo-500 rounded-lg shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-200"
            style={{
              aspectRatio: `${targetRatio}`,
              height: '85%',
              backgroundColor: backgroundColor === 'ORIGINAL' ? 'transparent' : backgroundColor
            }}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Crop preview"
                className="max-w-none transition-transform duration-150 select-none pointer-events-none"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              />
            ) : (
              <div className="text-xs text-slate-500">No Image Loaded</div>
            )}

            {/* Passport Head Guidelines */}
            <div className="absolute inset-0 border border-indigo-400/40 rounded pointer-events-none">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-28 h-36 border border-dashed border-indigo-400/50 rounded-full"></div>
              <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-indigo-400/30"></div>
            </div>
          </div>
        </div>

        {/* Controls: Zoom & Rotate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Zoom Level: {zoom.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Rotation: {rotation}°
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Background Color Selector */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            AI Background Replacement Color
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {bgColors.map((bg) => (
              <button
                key={bg.value}
                type="button"
                onClick={() => setBackgroundColor(bg.value)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  backgroundColor === bg.value
                    ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-lg shadow-indigo-950/50'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className={`w-4 h-4 rounded-full border border-slate-600 ${bg.hex}`}></span>
                <span>{bg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={Check} onClick={handleApply}>
            Apply Settings
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PhotoCropperModal;
