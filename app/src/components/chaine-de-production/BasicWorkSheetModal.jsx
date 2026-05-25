import React, { useState, useEffect } from 'react';
import './BasicWorkSheetModal.css';

const BasicWorkSheetModal = ({ isOpen, onClose, onSave, initialImages = [] }) => {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (isOpen) {
            // Normalize data: ensure all items are objects { src, name }
            const normalizedImages = (initialImages || []).map(img => {
                if (typeof img === 'string') {
                    return { src: img, name: '' };
                }
                return img;
            });
            setImages(normalizedImages);
        }
    }, [isOpen, initialImages]);

    const processFiles = (files) => {
        const newImages = [];
        let processedCount = 0;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newImages.push({ src: reader.result, name: '' });
                processedCount++;
                if (processedCount === files.length) {
                    setImages(prev => [...prev, ...newImages]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const handleNameChange = (index, newName) => {
        setImages(prev => prev.map((img, i) =>
            i === index ? { ...img, name: newName } : img
        ));
    };

    useEffect(() => {
        const handlePaste = (e) => {
            if (!isOpen) return;

            const items = e.clipboardData?.items;
            if (!items) return;

            const newFiles = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) newFiles.push(file);
                }
            }

            if (newFiles.length > 0) {
                e.preventDefault();
                processFiles(newFiles);
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [isOpen]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            processFiles(newFiles);
        }
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        onSave(images);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content worksheet-modal">
                <div className="modal-header">
                    <h3>Feuille de travail</h3>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <div className="upload-section">
                        <label htmlFor="worksheet-upload" className="upload-label">
                            <span className="upload-icon">📁</span>
                            <span>Cliquez pour ajouter, glissez-déposez ou <strong>Ctrl+V</strong> pour coller des images</span>
                            <div className="upload-hint">Formats supportés : PNG, JPG, JPEG</div>
                        </label>
                        <input
                            id="worksheet-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                    </div>

                    <div className="images-grid">
                        {images.map((imgData, index) => (
                            <div key={index} className="image-preview-card">
                                <div className="image-container">
                                    <img
                                        src={imgData.src}
                                        alt={imgData.name || `Worksheet ${index + 1}`}
                                        onClick={() => setSelectedImage(imgData.src)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <button
                                        className="remove-image-btn"
                                        onClick={() => handleRemoveImage(index)}
                                        title="Supprimer l'image"
                                    >
                                        &times;
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    className="image-name-input"
                                    placeholder="Nom de l'image (optionnel)"
                                    value={imgData.name || ''}
                                    onChange={(e) => handleNameChange(index, e.target.value)}
                                    // Prevent closing/zooming when clicking input
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        ))}
                        {images.length === 0 && (
                            <div className="no-images-placeholder">
                                Aucune image pour le moment.
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
                        <button className="btn btn-primary" onClick={handleSave}>Enregistrer</button>
                    </div>
                </div>

                {/* Image Zoom Modal */}
                {selectedImage && (
                    <div className="image-zoom-overlay" onClick={() => setSelectedImage(null)}>
                        <div className="image-zoom-content">
                            <img src={selectedImage} alt="Zoomed View" />
                            <button className="close-zoom-btn" onClick={() => setSelectedImage(null)}>&times;</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BasicWorkSheetModal;
