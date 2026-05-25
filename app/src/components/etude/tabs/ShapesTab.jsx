import React, { useState, useEffect, useRef } from 'react';
import UPNProfileSVG from '../UPNProfileSVG';
import ReactDOMServer from 'react-dom/server';
import { FaCode, FaTimes, FaCheck, FaLock, FaCube, FaUpload, FaTrash } from 'react-icons/fa';
import { FIXED_SHAPES } from '../EtudeConstants';
import ThreeDViewer from '../ThreeDViewer';

const SECRET_CODE = "TTF2026#";

const SVGModal = ({ isOpen, onClose, onSave, initialCode, title }) => {
    const [tempCode, setTempCode] = useState(initialCode);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 9999, display: 'flex',
            alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                backgroundColor: '#ffffff', width: '90%', maxWidth: '1000px', height: '80vh',
                borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '20px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc'
                }}>
                    <h3 style={{ margin: 0, color: '#1a202c', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaCode color="#3182ce" /> Éditeur SVG : {title}
                    </h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#a0aec0' }}>
                        <FaTimes />
                    </button>
                </div>

                {/* Modal Content */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
                    {/* Editor Side */}
                    <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0' }}>
                        <div style={{ padding: '10px 15px', backgroundColor: '#1a202c', color: '#63b3ed', fontSize: '12px', fontWeight: 'bold' }}>
                            CODE SOURCE (SVG)
                        </div>
                        <textarea
                            value={tempCode}
                            onChange={(e) => setTempCode(e.target.value)}
                            spellCheck="false"
                            style={{
                                flex: 1, width: '100%', padding: '20px', fontFamily: '"Fira Code", monospace',
                                fontSize: '13px', border: 'none', resize: 'none', backgroundColor: '#2d3748',
                                color: '#e2e8f0', outline: 'none', lineHeight: '1.6'
                            }}
                        />
                    </div>

                    {/* Preview Side */}
                    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f1f5f9' }}>
                        <div style={{ padding: '10px 15px', backgroundColor: '#cbd5e0', color: '#4a5568', fontSize: '12px', fontWeight: 'bold' }}>
                            PRÉVISUALISATION
                        </div>
                        <div style={{
                            flex: 1, padding: '30px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', overflow: 'auto'
                        }}>
                            <div style={{
                                width: '100%', maxWidth: '100%', backgroundColor: 'white',
                                padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                            }} dangerouslySetInnerHTML={{ __html: tempCode }} />
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div style={{
                    padding: '20px 25px', borderTop: '1px solid #e2e8f0', display: 'flex',
                    justifyContent: 'flex-end', gap: '15px', backgroundColor: '#f8fafc'
                }}>
                    <button onClick={onClose} style={{
                        padding: '10px 25px', borderRadius: '8px', border: '1px solid #cbd5e0',
                        backgroundColor: 'white', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                        Annuler
                    </button>
                    <button onClick={() => onSave(tempCode)} style={{
                        padding: '10px 25px', borderRadius: '8px', border: 'none',
                        backgroundColor: '#3182ce', color: 'white', fontWeight: 'bold',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 6px rgba(49, 130, 206, 0.2)'
                    }}>
                        <FaCheck /> Appliquer les changements
                    </button>
                </div>
            </div>
        </div>
    );
};

const ShapePreviewModal = ({ isOpen, onClose, shape, title }) => {
    if (!isOpen || !shape) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 10000, display: 'flex',
            alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)',
            padding: '40px'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white', width: '95%', maxWidth: '1200px', maxHeight: '90vh',
                borderRadius: '20px', display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)', overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div style={{
                    padding: '20px 30px', borderBottom: '1px solid #e2e8f0', display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc'
                }}>
                    <h2 style={{ margin: 0, color: '#1a202c', fontSize: '1.5rem' }}>
                        Aperçu Détaillé : {title}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '28px', color: '#a0aec0', transition: 'color 0.2s' }}>
                        <FaTimes />
                    </button>
                </div>

                {/* Modal Content - Large Preview */}
                <div style={{
                    flex: 1, padding: '40px', overflow: 'auto', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff'
                }}>
                    <div style={{ width: '100%', maxWidth: '1000px' }}>
                        {shape.meshData ? (
                            <ThreeDViewer fileUrl={shape.meshData} fileType={shape.meshType} height="600px" />
                        ) : shape.isManual ? (
                            <div dangerouslySetInnerHTML={{ __html: shape.svgText }} />
                        ) : (
                            <UPNProfileSVG
                                {...shape}
                                label={shape.label}
                                subLabel={shape.subLabel}
                                p1_l={shape.left} p1_m={shape.middle} p1_diam={shape.diam}
                                p2_l={shape.mid_left} p2_m={shape.mid_middle} p2_h={shape.p2_h || 50}
                                p3_l={shape.l2} p3_m1={shape.m2a} p3_m2={shape.m2b} p3_m3={shape.m2c} p3_r={shape.r2}
                            />
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div style={{ padding: '15px 30px', textAlign: 'center', backgroundColor: '#f8fafc', color: '#718096', fontSize: '14px', borderTop: '1px solid #e2e8f0' }}>
                    Cliquez en dehors du cadre pour fermer cet aperçu
                </div>
            </div>
        </div>
    );
};

const ShapesTab = ({ shapes, handleShapesChange, etudeData = {} }) => {
    const [shapeList, setShapeList] = useState(FIXED_SHAPES);
    const lastSyncRef = useRef('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [editingModal, setEditingModal] = useState(null); // { id, title, currentCode }
    const [previewShape, setPreviewShape] = useState(null); // the whole shape object
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newShapeLabel, setNewShapeLabel] = useState('');

    // Sync from parent prop
    useEffect(() => {
        if (shapes && shapes !== lastSyncRef.current) {
            try {
                const parsed = JSON.parse(shapes);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const mergedFixed = FIXED_SHAPES.map(fixed => {
                        const saved = parsed.find(p => p.id === fixed.id);
                        return saved ? { ...fixed, ...saved } : fixed;
                    });
                    const customShapes = parsed.filter(p => !FIXED_SHAPES.some(f => f.id === p.id));
                    setShapeList([...mergedFixed, ...customShapes]);
                }
            } catch (e) {
                console.warn("Could not parse shapes JSON", e);
            }
            lastSyncRef.current = shapes;
        }
    }, [shapes]);

    // Handle automated values for 'couvercle' (Cuve)
    useEffect(() => {
        const hCuve = etudeData.cuveEtRefroidissement?.hauteurCuve || '';
        const hOnde = etudeData.cuveEtRefroidissement?.hauteurOnde || '';

        if (hCuve || hOnde) {
            setShapeList(prev => prev.map(shape => {
                if (shape.id === 'couvercle' && shape.isManual && shape.svgText) {
                    let newSvg = shape.svgText;
                    let changed = false;
                    if (hCuve) {
                        const hCuveRegex = /(<tspan[^>]*id="tspan18"[^>]*>)\s*[^<]*\s*(<\/tspan>)/g;
                        if (hCuveRegex.test(newSvg)) {
                            newSvg = newSvg.replace(hCuveRegex, `$1${hCuve}$2`);
                            changed = true;
                        }
                    }
                    if (hOnde) {
                        const hOndeRegex = /(<tspan[^>]*id="tspan19"[^>]*>)\s*[^<]*\s*(<\/tspan>)/g;
                        if (hOndeRegex.test(newSvg)) {
                            newSvg = newSvg.replace(hOndeRegex, `$1${hOnde}$2`);
                            changed = true;
                        }
                    }
                    return changed ? { ...shape, svgText: newSvg } : shape;
                }
                return shape;
            }));
        }
    }, [etudeData.cuveEtRefroidissement?.hauteurCuve, etudeData.cuveEtRefroidissement?.hauteurOnde]);

    const pushUpdates = (newList) => {
        const dataStr = JSON.stringify(newList);
        if (dataStr !== shapes) {
            lastSyncRef.current = dataStr;
            handleShapesChange(dataStr);
        }
    };

    const updateShape = (id, field, value) => {
        const newList = shapeList.map(s => s.id === id ? { ...s, [field]: value } : s);
        setShapeList(newList);
        pushUpdates(newList);
    };

    const handleUnlockManual = (callback) => {
        if (isAuthorized) {
            callback();
            return;
        }
        const code = window.prompt("Entrez le code d'autorisation (JWT_SECRET) :");
        if (code === SECRET_CODE) {
            setIsAuthorized(true);
            callback();
        } else {
            alert("Code incorrect.");
        }
    };

    const openSVGEditor = (shape) => {
        handleUnlockManual(() => {
            let code = shape.svgText;
            if (!shape.svgText) {
                code = ReactDOMServer.renderToStaticMarkup(<UPNProfileSVG {...shape} />);
            }
            setEditingModal({ id: shape.id, title: `${shape.label} ${shape.subLabel}`, currentCode: code });
        });
    };

    const handleSaveSVG = (newCode) => {
        const newList = shapeList.map(s => s.id === editingModal.id ? { ...s, isManual: true, svgText: newCode } : s);
        setShapeList(newList);
        pushUpdates(newList);
        setEditingModal(null);
    };

    const disableManualMode = (id) => {
        const newList = shapeList.map(s => s.id === id ? { ...s, isManual: false } : s);
        setShapeList(newList);
        pushUpdates(newList);
    };

    const handleMeshUpload = (id, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const newList = shapeList.map(s => s.id === id ? { ...s, meshData: data, meshType: file.name.split('.').pop().toLowerCase() } : s);
            setShapeList(newList);
            pushUpdates(newList);
        };
        reader.readAsDataURL(file);
    };

    const removeMesh = (id) => {
        const newList = shapeList.map(s => s.id === id ? { ...s, meshData: null, meshType: null } : s);
        setShapeList(newList);
        pushUpdates(newList);
    };

    const addCustomShape = () => {
        if (!newShapeLabel.trim()) return;
        const newId = `custom-${Date.now()}`;
        const newShape = {
            id: newId,
            type: 'raw',
            label: newShapeLabel.trim(),
            subLabel: '(Composant)',
            isManual: true,
            isCustom: true,
            svgText: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;"><rect x="10" y="10" width="80" height="80" fill="rgba(49, 130, 206, 0.05)" stroke="#3182ce" stroke-width="1" stroke-dasharray="4" rx="10"/></svg>'
        };
        const newList = [...shapeList, newShape];
        setShapeList(newList);
        pushUpdates(newList);
        setNewShapeLabel('');
        setIsAddModalOpen(false);
    };

    const deleteShape = (id) => {
        if (window.confirm("Supprimer cette forme de l'étude ?")) {
            const newList = shapeList.filter(s => s.id !== id);
            setShapeList(newList);
            pushUpdates(newList);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '30px', 
            padding: '15px',
            gridColumn: '1 / -1', // Force full width in the parent grid
            width: '100%'
        }}>
            {/* Design Premium Header */}
            <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                backgroundColor: 'white', padding: '24px 35px', 
                borderRadius: '24px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)',
                border: '1px solid #f1f5f9', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', backgroundColor: '#3182ce' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <h3 style={{ color: '#0f172a', margin: 0, fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.02em' }}>
                        Gestion des Plans de Forme
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', backgroundColor: '#f1f5f9', padding: '4px 12px', borderRadius: '30px', textTransform: 'uppercase' }}>
                            2D SVG Support
                        </span>
                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#cbd5e0' }} />
                        <span style={{ fontSize: '11px', color: '#3182ce', fontWeight: '800', backgroundColor: '#ebf8ff', padding: '4px 12px', borderRadius: '30px', textTransform: 'uppercase' }}>
                            3D Engine Active
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        style={{
                            padding: '14px 28px', backgroundColor: '#3182ce', color: 'white', border: 'none', 
                            borderRadius: '16px', cursor: 'pointer', fontWeight: '800', display: 'flex', 
                            alignItems: 'center', gap: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 12px 20px -5px rgba(49, 130, 206, 0.4)', fontSize: '14px'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(49, 130, 206, 0.5)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 12px 20px -5px rgba(49, 130, 206, 0.4)';
                        }}
                    >
                        <FaCube size={18} /> Ajouter une Forme
                    </button>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '700' }}>Formats supportés</div>
                        <div style={{ fontSize: '11px', color: '#475569', fontWeight: '900' }}>SVG • STL • GLB</div>
                    </div>
                </div>
            </div>

            {/* Forced Two-Column Grid for Better Space Utilization */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '20px', 
                width: '100%' 
            }}>
                {shapeList.map((shape) => (
                    <div key={shape.id} style={{
                        backgroundColor: 'white', borderRadius: '24px', padding: '0',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
                        border: '1px solid #f1f5f9', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        height: 'fit-content'
                    }} onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 20px 35px -10px rgba(0, 0, 0, 0.08)';
                    }} onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)';
                    }}>
                        {/* Compact Integrated Header */}
                        <div style={{ 
                            padding: '16px 20px', borderBottom: '1px solid #f8fafc', 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: '#fcfdfe'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ 
                                    width: '36px', height: '36px', borderRadius: '10px', 
                                    backgroundColor: shape.meshData ? '#f0fff4' : '#ebf8ff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: shape.meshData ? '#38a169' : '#3182ce',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    {shape.meshData ? <FaCube size={18} /> : <FaCode size={16} />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
                                        {shape.label}
                                    </h4>
                                    <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase' }}>
                                        {shape.subLabel || 'Standard'}
                                    </span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {shape.isCustom && (
                                    <button onClick={() => deleteShape(shape.id)} style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', backgroundColor: '#fff5f5', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaTrash size={10} />
                                    </button>
                                )}
                                <label style={{ padding: '6px 10px', fontSize: '9px', borderRadius: '8px', backgroundColor: '#ffffff', color: '#475569', cursor: 'pointer', fontWeight: '800', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FaUpload size={10} /> 3D
                                    <input type="file" accept=".stl,.glb,.gltf" style={{ display: 'none' }} onChange={(e) => handleMeshUpload(shape.id, e.target.files[0])} />
                                </label>
                                <button onClick={() => openSVGEditor(shape)} style={{ padding: '6px 10px', fontSize: '9px', borderRadius: '8px', backgroundColor: shape.isManual ? '#ebf8ff' : '#ffffff', color: shape.isManual ? '#3182ce' : '#475569', cursor: 'pointer', fontWeight: '800', border: '1px solid', borderColor: shape.isManual ? '#bee3f8' : '#e2e8f0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FaCode size={10} /> SVG
                                </button>
                            </div>
                        </div>

                        {/* Dense Content Side-by-Side */}
                        <div style={{ padding: '15px', display: 'flex', gap: '15px', height: '380px' }}>
                            {/* Parameters panel */}
                            {!shape.isManual && shape.type !== 'raw' && (
                                <div style={{ 
                                    width: '150px', display: 'flex', flexDirection: 'column', gap: '10px',
                                    padding: '12px', backgroundColor: '#f8fafc', borderRadius: '16px',
                                    border: '1px solid #f1f5f9', flexShrink: 0
                                }}>
                                    <div style={{ fontSize: '8px', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.1em', textAlign: 'center' }}>UNIT mm</div>
                                    <div style={{ display: 'grid', gap: '8px', overflowY: 'auto' }}>
                                        {Object.entries(shape).map(([key, val]) => {
                                            if (['id', 'type', 'label', 'subLabel', 'isManual', 'svgText', 'meshData', 'meshType', 'isCustom', 'total', 'r2', 'p2_h'].includes(key)) return null;
                                            return (
                                                <div key={key}>
                                                    <label style={{ display: 'block', fontSize: '8px', fontWeight: '800', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase' }}>{key.replace('_', ' ')}</label>
                                                    <input 
                                                        type="number" 
                                                        value={val} 
                                                        onChange={(e) => updateShape(shape.id, key, e.target.value)} 
                                                        style={{ width: '100%', padding: '6px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: '700', color: '#334155' }} 
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Viewport panel */}
                            <div style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{
                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: '#fbfcfd', borderRadius: '18px', border: '1px solid #f1f5f9',
                                    overflow: 'hidden', cursor: 'zoom-in'
                                }} onClick={() => setPreviewShape(shape)}>
                                    {shape.meshData ? (
                                        <>
                                            <ThreeDViewer fileUrl={shape.meshData} fileType={shape.meshType} height="100%" />
                                            <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(15, 23, 42, 0.7)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '8px', fontWeight: '900' }}>3D RENDERING</div>
                                            <button onClick={(e) => { e.stopPropagation(); removeMesh(shape.id); }} style={{ position: 'absolute', top: '10px', right: '10px', width: '24px', height: '24px', borderRadius: '6px', border: 'none', backgroundColor: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes size={8} /></button>
                                        </>
                                    ) : (shape.isManual || shape.type === 'raw') ? (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                                            <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: shape.svgText || '' }} />
                                        </div>
                                    ) : (
                                        <div style={{ transform: 'scale(0.8)', transformOrigin: 'center' }}>
                                            <UPNProfileSVG {...shape} isTechnicalPlan={true}
                                                p1_l={shape.left} p1_m={shape.middle} p1_diam={shape.diam}
                                                p2_l={shape.mid_left} p2_m={shape.mid_middle} p2_h={shape.p2_h || 50}
                                                p3_l={shape.l2} p3_m1={shape.m2a} p3_m2={shape.m2b} p3_m3={shape.m2c} p3_r={shape.r2}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div style={{ fontSize: '8px', color: '#cbd5e0', textAlign: 'center', padding: '5px', fontWeight: '900', letterSpacing: '0.1em' }}>DRAWING ENGINE</div>
                            </div>
                        </div>

                        {/* Reset button for manual mode */}
                        {shape.isManual && shape.type !== 'raw' && (
                            <div style={{ padding: '8px 15px', backgroundColor: '#fbfcfd', borderTop: '1px solid #f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => disableManualMode(shape.id)} style={{ padding: '4px 10px', fontSize: '8px', borderRadius: '8px', border: '1px solid #fee2e2', backgroundColor: '#fff', color: '#ef4444', fontWeight: '800' }}>RÉINITIALISER AUTO</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Standard Modals */}
            <SVGModal
                isOpen={!!editingModal}
                onClose={() => setEditingModal(null)}
                onSave={handleSaveSVG}
                initialCode={editingModal?.currentCode || ''}
                title={editingModal?.title || ''}
            />

            <ShapePreviewModal
                isOpen={!!previewShape}
                onClose={() => setPreviewShape(null)}
                shape={previewShape}
                title={previewShape ? `${previewShape.label} ${previewShape.subLabel}` : ''}
            />

            {/* Premium Add Form Modal */}
            {isAddModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(15, 23, 42, 0.85)', zIndex: 10001, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(15px)'
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '50px', borderRadius: '40px',
                        width: '520px', boxShadow: '0 40px 80px -15px rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255,255,255,0.2)', position: 'relative'
                    }}>
                        <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><FaTimes size={20} /></button>
                        
                        <div style={{ display: 'flex', gap: '25px', alignItems: 'center', marginBottom: '40px' }}>
                            <div style={{ 
                                width: '64px', height: '64px', borderRadius: '20px', 
                                backgroundColor: '#ebf8ff', color: '#3182ce', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 15px 25px -5px rgba(49, 130, 206, 0.15)'
                            }}>
                                <FaCube size={32} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '-0.03em' }}>Nouvelle Forme</h3>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '15px', fontWeight: '600' }}>Créez un nouvel élément 2D ou 3D</p>
                            </div>
                        </div>
                        
                        <div style={{ marginBottom: '40px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: '#475569', marginBottom: '15px', letterSpacing: '0.15em' }}>
                                IDENTIFIANT DE LA PIÈCE
                            </label>
                            <input 
                                type="text" 
                                value={newShapeLabel} 
                                onChange={(e) => setNewShapeLabel(e.target.value)}
                                placeholder="ex: Support Bobine, Traverse..."
                                style={{ 
                                    width: '100%', padding: '22px 30px', borderRadius: '22px', 
                                    border: '2px solid #f1f5f9', outline: 'none', fontSize: '18px',
                                    fontWeight: '800', color: '#0f172a', transition: 'all 0.3s',
                                    backgroundColor: '#f8fafc', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)'
                                }}
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && addCustomShape()}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button 
                                onClick={() => setIsAddModalOpen(false)}
                                style={{ 
                                    flex: 1, padding: '18px', borderRadius: '22px', border: 'none', 
                                    backgroundColor: '#f1f5f9', color: '#475569', cursor: 'pointer',
                                    fontWeight: '800', fontSize: '16px', transition: 'all 0.2s'
                                }}
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={addCustomShape}
                                style={{ 
                                    flex: 2, padding: '18px', borderRadius: '22px', border: 'none', 
                                    backgroundColor: '#3182ce', color: 'white', fontWeight: '900', 
                                    cursor: 'pointer', fontSize: '16px', boxShadow: '0 15px 30px -5px rgba(49, 130, 206, 0.4)',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2b6cb0'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3182ce'}
                            >
                                Valider la création
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShapesTab;
