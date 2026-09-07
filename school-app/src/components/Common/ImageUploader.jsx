import React, { useRef } from 'react';
import { Upload, Image, X } from 'lucide-react';

export const ImageUploader = ({
  value,
  onChange,
  label = 'Profile Avatar / Photo',
  aspectRatio = 'square' // 'square' | 'wide'
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, SVG, WebP).');
      return;
    }

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onChange(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-slate-700">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
        
        {/* Preview Thumbnail */}
        <div className="relative shrink-0 group">
          {value ? (
            <div className={`overflow-hidden rounded-2xl border-2 border-white shadow-md bg-white ${
              aspectRatio === 'wide' ? 'w-24 h-16' : 'w-16 h-16'
            }`}>
              <img
                src={value}
                alt="Uploaded preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className={`rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 ${
              aspectRatio === 'wide' ? 'w-24 h-16' : 'w-16 h-16'
            }`}>
              <Image className="w-6 h-6" />
            </div>
          )}

          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              title="Remove image"
              className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-xs transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Upload Action */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>{value ? 'Change Image' : 'Select Image File'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400">
            JPG, PNG, WebP, GIF or SVG up to 5MB (automatically formatted and saved)
          </p>
        </div>

      </div>
    </div>
  );
};
