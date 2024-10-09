import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useDropzone } from 'react-dropzone';
import './ImageToPdf.css'; 

const ImageToPDF = () => {
  const [images, setImages] = useState([]);

  const onDrop = (acceptedFiles) => {
    const imageFiles = acceptedFiles.map((file) => URL.createObjectURL(file));
    setImages(imageFiles);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

  
    const promises = images.map((image) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = image;

        img.onload = () => {
          const imgWidth = img.width;
          const imgHeight = img.height;
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();

        
          const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
          const scaledWidth = imgWidth * ratio;
          const scaledHeight = imgHeight * ratio;

    
          resolve({ image, scaledWidth, scaledHeight });
        };
      });
    });

    Promise.all(promises).then((imageDataArray) => {
      imageDataArray.forEach((imageData, index) => {
        const { image, scaledWidth, scaledHeight } = imageData;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        if (index > 0) {
          doc.addPage();
        }

        doc.addImage(
          image,
          'JPEG',
          (pageWidth - scaledWidth) / 2,
          (pageHeight - scaledHeight) / 2, 
          scaledWidth,
          scaledHeight
        );
      });

   
      doc.save('converted.pdf');
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  return (
    <div className="container">
      <h2 className="title">Convert Images to PDF</h2>

      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <p className="dropzone-text">Drag & drop images here, or click to select images</p>
      </div>

      <div className="image-preview">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`upload-${index}`}
            className="preview-image"
          />
        ))}
      </div>

      <button
        className={`generate-btn ${images.length === 0 ? 'disabled' : ''}`}
        onClick={generatePDF}
        disabled={images.length === 0} 
      >
        Generate PDF
      </button>
    </div>
  );
};

export default ImageToPDF;
