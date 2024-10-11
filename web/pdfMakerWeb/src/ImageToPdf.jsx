import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useDropzone } from 'react-dropzone';
import './ImageToPdf.css';

const ImageToPDF = () => {
  const [images, setImages] = useState([]);
  const [pdfName, setPdfName] = useState('converted.pdf');
  const [pageSize, setPageSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [margin, setMargin] = useState('no-margin');

  const onDrop = (acceptedFiles) => {
    const imageFiles = acceptedFiles.map((file) => URL.createObjectURL(file));
    setImages(imageFiles);
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      format: pageSize,
      orientation: orientation,
    });

    const promises = images.map((image) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = image;

        img.onload = () => {
          const imgWidth = img.width;
          const imgHeight = img.height;
          const pageWidth = orientation === 'portrait' ? doc.internal.pageSize.getWidth() : doc.internal.pageSize.getHeight();
          const pageHeight = orientation === 'portrait' ? doc.internal.pageSize.getHeight() : doc.internal.pageSize.getWidth();

          let scaledWidth, scaledHeight;
          
          if (pageSize === 'fit') {
            scaledWidth = pageWidth;
            scaledHeight = pageHeight;
          } else {
            const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
            scaledWidth = imgWidth * ratio;
            scaledHeight = imgHeight * ratio;
          }

          resolve({ image, scaledWidth, scaledHeight, imgWidth, imgHeight });
        };
      });
    });

    Promise.all(promises).then((imageDataArray) => {
      imageDataArray.forEach((imageData, index) => {
        const { image, scaledWidth, scaledHeight, imgWidth, imgHeight } = imageData;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        if (index > 0) {
          doc.addPage();
        }

        const marginValue = margin === 'small-margin' ? 10 : 0;

        doc.addImage(
          image,
          'JPEG',
          (pageWidth - scaledWidth) / 2 + marginValue,
          (pageHeight - scaledHeight) / 2 + marginValue,
          Math.min(scaledWidth, pageWidth - 2 * marginValue),
          Math.min(scaledHeight, pageHeight - 2 * marginValue)
        );
      });

      doc.save(pdfName);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
  });

  return (
    <div className="container">
      <div className="left-side">
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

        <input
          type="text"
          value={pdfName}
          onChange={(e) => setPdfName(e.target.value)}
          placeholder="Enter PDF name"
          className="pdf-name-input"
        />

        <button
          className={`generate-btn ${images.length === 0 ? 'disabled' : ''}`}
          onClick={generatePDF}
          disabled={images.length === 0}
        >
          Generate PDF
        </button>
      </div>

      <div className="right-side">
        <h3>Settings</h3>
        <div className="setting">
          <label>Page Size:</label>
          <select value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
            <option value="fit">Fit to Page</option>
          </select>
        </div>

        <div className="setting">
          <label>Orientation:</label>
          <select value={orientation} onChange={(e) => setOrientation(e.target.value)}>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        <div className="setting">
          <label>Margin:</label>
          <select value={margin} onChange={(e) => setMargin(e.target.value)}>
            <option value="no-margin">No Margin</option>
            <option value="small-margin">Small Margin</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ImageToPDF;
