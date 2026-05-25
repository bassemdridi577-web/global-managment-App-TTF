import React, { useState, useMemo } from 'react';
import { FaTrash, FaChevronDown, FaChevronUp, FaBoxOpen, FaHistory, FaBolt } from 'react-icons/fa';

/**
 * StudyListModal Component
 * Groups studies by puissance and allows expanding/collapsing to see versions.
 */
const StudyListModal = ({ isOpen, onClose, studies, onLoadStudy, onDeleteStudy }) => {
    const [expandedGroups, setExpandedGroups] = useState({});

    // Group studies by power rating
    const groupedStudies = useMemo(() => {
        const groups = {};
        studies.forEach(study => {
            const p = (study.puissance || study.donneesTransfo?.puissance || 'N/A').toString();
            if (!groups[p]) groups[p] = [];
            groups[p].push(study);
        });

        // Sort versions within each group (descending by updated date or version num)
        Object.keys(groups).forEach(p => {
            groups[p].sort((a, b) => {
                const vA = parseInt((a.donneesTransfo?.version || a.version || '0').replace(/\D/g, '')) || 0;
                const vB = parseInt((b.donneesTransfo?.version || b.version || '0').replace(/\D/g, '')) || 0;
                return vB - vA; // Newest version first
            });
        });

        return groups;
    }, [studies]);

    const toggleGroup = (puissance) => {
        setExpandedGroups(prev => ({
            ...prev,
            [puissance]: !prev[puissance]
        }));
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="study-modal" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px', borderRadius: '10px' }}>
                            <FaHistory size={20} color="white" />
                        </div>
                        <h3>Études enregistrées</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body" style={{ backgroundColor: '#fcfcfd' }}>
                    {studies.length === 0 ? (
                        <div className="no-studies" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                            <FaBoxOpen size={50} color="#cbd5e0" />
                            <p>Aucune étude enregistrée</p>
                        </div>
                    ) : (
                        <div className="study-list-grouped" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {Object.entries(groupedStudies)
                                .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
                                .map(([puissance, versions]) => {
                                    const isExpanded = expandedGroups[puissance];
                                    const isSingle = versions.length === 1;
                                    const singleStudy = versions[0];

                                    return (
                                        <div key={puissance} className="puissance-group" style={{
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            backgroundColor: 'white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}>
                                            {/* Power Header */}
                                            <div
                                                className="group-header"
                                                onClick={() => isSingle ? onLoadStudy(singleStudy) : toggleGroup(puissance)}
                                                style={{
                                                    padding: '16px 20px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    backgroundColor: isExpanded ? '#f8faff' : 'white',
                                                    transition: 'all 0.2s ease',
                                                    borderBottom: (isExpanded && !isSingle) ? '1px solid #edf2f7' : 'none'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        backgroundColor: '#ebf8ff',
                                                        color: '#3182ce',
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        <FaBolt size={14} />
                                                    </div>
                                                    <div>
                                                        <strong style={{ fontSize: '1.1rem', color: '#2d3748' }}>{puissance} kVA</strong>
                                                        {isSingle ? (
                                                            <div style={{ fontSize: '0.8rem', color: '#718096', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                <span>{singleStudy.donneesTransfo?.version || singleStudy.version || 'V1'}</span>
                                                                <span style={{ color: '#cbd5e0' }}>•</span>
                                                                <span>{singleStudy.donneesTransfo?.typeConducteur === 'CU' ? 'Cuivre' : 'Aluminium'}</span>
                                                                <span style={{ color: '#cbd5e0' }}>•</span>
                                                                <span>{new Date(singleStudy.updatedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        ) : (
                                                            <div style={{ fontSize: '0.8rem', color: '#718096' }}>{versions.length} version(s) disponible(s)</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {isSingle ? (
                                                    <button
                                                        className="btn-delete-study"
                                                        onClick={(e) => { e.stopPropagation(); onDeleteStudy(singleStudy.id); }}
                                                        style={{
                                                            opacity: 0.6,
                                                            transition: 'all 0.2s ease',
                                                            padding: '10px',
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                ) : (
                                                    isExpanded ? <FaChevronUp color="#a0aec0" /> : <FaChevronDown color="#a0aec0" />
                                                )}
                                            </div>

                                            {/* Versions List */}
                                            {isExpanded && !isSingle && (
                                                <div className="versions-container" style={{
                                                    backgroundColor: '#ffffff',
                                                    padding: '8px'
                                                }}>
                                                    {versions.map(study => (
                                                        <div key={study.id} className="version-item" style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '12px 16px',
                                                            borderRadius: '8px',
                                                            marginBottom: '4px',
                                                            transition: 'all 0.15s ease',
                                                            border: '1px solid transparent'
                                                        }}>
                                                            <div className="version-info"
                                                                onClick={() => onLoadStudy(study)}
                                                                style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                                <div className="version-info"
                                                                    onClick={() => onLoadStudy(study)}
                                                                    style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#4a5568', fontWeight: '500' }}>
                                                                    <span>{study.donneesTransfo?.version || study.version || 'V1'}</span>
                                                                    <span style={{ color: '#cbd5e0' }}>•</span>
                                                                    <span>{study.donneesTransfo?.typeConducteur === 'CU' ? 'Cuivre' : 'Aluminium'}</span>
                                                                    <span style={{ color: '#cbd5e0' }}>•</span>
                                                                    <span style={{ fontSize: '0.85rem', color: '#718096' }}>{new Date(study.updatedAt).toLocaleDateString()}</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                className="btn-delete-study"
                                                                onClick={(e) => { e.stopPropagation(); onDeleteStudy(study.id); }}
                                                                style={{
                                                                    opacity: 0.6,
                                                                    transition: 'all 0.2s ease',
                                                                    padding: '10px',
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .version-item:hover {
                    background-color: #f7fafc !important;
                    border-color: #edf2f7 !important;
                }
                .version-item:hover .version-info div:first-child {
                    background-color: #ebf8ff !important;
                    color: #3182ce !important;
                    border-color: #bee3f8 !important;
                }
                .group-header:hover {
                    background-color: #f8faff !important;
                }
                .btn-delete-study:hover {
                    opacity: 1 !important;
                    color: #e53e3e !important;
                }
            ` }} />
        </>
    );
};

export default StudyListModal;
