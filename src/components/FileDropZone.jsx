import { useState } from 'react';

/**
 * Componente de zona de arrastar e soltar arquivos
 * Suporta upload por clique ou drag & drop
 */
const FileDropZone = ({ onFileSelect, accept = '.ofx,.csv' }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-all
        ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        id="file-input"
        className="hidden"
      />

      <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-4">
        {isDragging ? (
          <>
            <div className="text-6xl">📂</div>
            <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
              Solte o arquivo aqui
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl">📁</div>
            <div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Arraste um arquivo ou clique para selecionar
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Formatos aceitos: OFX, CSV
              </p>
            </div>
            <button
              type="button"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Selecionar Arquivo
            </button>
          </>
        )}
      </label>
    </div>
  );
};

export default FileDropZone;
