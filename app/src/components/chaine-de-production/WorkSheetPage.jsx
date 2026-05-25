import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';  // Correct path to api instance
import '../chaine-de-production/BasicWorkSheetModal.css'; // Reuse existing CSS

const WorkSheetPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [saveStatus, setSaveStatus] = useState('idle');

    // Fetch existing images
    useEffect(() => {
        const fetchImages = async () => {
            try {
                // We need to fetch the specific production step 'CuveContainer' for this transformer/productionLineId
                // Assuming the backend has an endpoint or we filter from a list
                const response = await api.get(`/production-steps/${id}`);

                // Note: Actual data structure depends on your backend response.
                // Assuming response.data is an array of steps or a specific object.
                // If the endpoint returns all steps for the ID:
                const steps = response.data;
                const cuveStep = steps.find(s => s.stepName === 'CuveContainer');

                if (cuveStep && cuveStep.data && cuveStep.data.workSheetImages) {
                    // Normalize data
                    const normalizedImages = cuveStep.data.workSheetImages.map(img => {
                        if (typeof img === 'string') {
                            return { src: img, name: '' };
                        }
                        return img;
                    });
                    setImages(normalizedImages);
                }
            } catch (err) {
                console.error("Error fetching worksheet images:", err);
                setError("Impossible de charger les images.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchImages();
        }
    }, [id]);

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            // We likely need to fetch the current state first to not overwrite other fields in CuveContainer
            // Or if the backend supports patching just this field.
            // For safety, let's assume we need to patch specifically.

            // However, typical pattern seen in this app is posting the full step data.
            // Since we might not have the full CuveContainer data here, we should fetch it first if we haven't stored it.

            const response = await api.get(`/production-steps/${id}`);
            const steps = response.data;
            const cuveStep = steps.find(s => s.stepName === 'CuveContainer');

            const currentData = cuveStep ? cuveStep.data : {};
            const updatedData = { ...currentData, workSheetImages: images };

            await api.post('/production-steps', {
                productionLineId: id,
                stepName: 'CuveContainer',
                data: updatedData
            });
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
            console.error("Error saving worksheet images:", err);
            setSaveStatus('error');
        }
    };

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
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            processFiles(newFiles);
        }
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    if (loading) return <div className="p-4">Chargement...</div>;

    return (
        <div className="worksheet-page-container" style={{ padding: '20px', maxWidth: '1200px', margin: '40px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ margin: 0 }}>Fiche de travail - Contrôle Chaudronnerie</h1>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    ← Retour
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="worksheet-content" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div
                    className="upload-section"
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            const newFiles = Array.from(e.dataTransfer.files);
                            processFiles(newFiles);
                        }
                    }}
                >
                    <label htmlFor="worksheet-upload" className="upload-label">
                        <span className="upload-icon">📁</span>
                        <span>Cliquez pour ajouter, glissez-déposez ou <strong>Ctrl+V</strong> pour coller des images</span>
                        <div className="upload-hint">Formats supportés : PNG, JPG, JPEG • Vous pouvez ajouter plusieurs photos</div>
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

                <div className="d-flex justify-content-end mt-4">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                    >
                        {saveStatus === 'saving' ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                    {saveStatus === 'success' && <span className="text-success ms-2 align-self-center">Enregistré!</span>}
                    {saveStatus === 'error' && <span className="text-danger ms-2 align-self-center">Erreur!</span>}
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
    );
};

export default WorkSheetPage;
