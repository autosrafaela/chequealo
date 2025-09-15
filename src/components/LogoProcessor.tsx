import React, { useEffect, useState } from 'react';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import chequealoLogo from '@/assets/chequealo-final-logo.png';

export const LogoProcessor: React.FC = () => {
  const [processedLogoUrl, setProcessedLogoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processLogo = async () => {
      setIsProcessing(true);
      try {
        // Load the original logo
        const response = await fetch(chequealoLogo);
        const blob = await response.blob();
        
        // Convert to image element
        const imageElement = await loadImage(blob);
        
        // Remove background
        const processedBlob = await removeBackground(imageElement);
        
        // Create URL for the processed image
        const url = URL.createObjectURL(processedBlob);
        setProcessedLogoUrl(url);
        
        // Download the processed image
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chequealo-logo-transparent.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } catch (error) {
        console.error('Error processing logo:', error);
      } finally {
        setIsProcessing(false);
      }
    };

    processLogo();
  }, []);

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <p>Procesando logo... Esto puede tomar unos segundos.</p>
        </div>
      </div>
    );
  }

  if (processedLogoUrl) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md">
          <h3 className="text-lg font-semibold mb-4">Logo procesado</h3>
          <img src={processedLogoUrl} alt="Logo sin fondo" className="mb-4 max-w-full h-auto" />
          <p className="text-sm text-gray-600 mb-4">
            El logo se ha descargado automáticamente. Reemplaza el archivo en src/assets/ con la nueva versión.
          </p>
          <button 
            onClick={() => setProcessedLogoUrl(null)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return null;
};