import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { UploadCloud, Image as ImageIcon, X, File as FileIcon } from 'lucide-react';

const GalleryUpload = ({ onUpload, maxFiles = 5 }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxFiles
  });

  const removeFile = (name) => {
    setFiles(files.filter(file => file.name !== name));
  };

  const handleConfirm = () => {
    if (onUpload && files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-[#0EA5E9] bg-[#0EA5E9]/10' : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'}`}
      >
        <input {...getInputProps()} />
        <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-[#0EA5E9]' : 'text-slate-400'}`} />
        <p className="text-white font-medium text-lg mb-2">
          {isDragActive ? t('upload.dropHere', 'Drop images here') : t('upload.dragDrop', 'Drag & drop images here')}
        </p>
        <p className="text-slate-400 text-sm">
          {t('upload.orClick', 'or click to browse from gallery')}
        </p>
        <p className="text-slate-500 text-xs mt-4">
          {t('upload.limits', 'JPEG, PNG up to 10MB. Max {{max}} files.', { max: maxFiles })}
        </p>
      </div>

      {files.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          <h4 className="text-white font-medium mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#0EA5E9]" />
            {t('upload.selectedFiles', 'Selected Files')} ({files.length}/{maxFiles})
          </h4>
          <ul className="space-y-3">
            {files.map((file) => (
              <li key={file.name} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded bg-slate-800 shrink-0 overflow-hidden">
                    <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-200 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleConfirm}
              className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
            >
              {t('upload.processImages', 'Process Images')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryUpload;
