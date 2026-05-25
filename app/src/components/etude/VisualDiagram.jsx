import React, { useState, useRef, useEffect } from 'react';

/**
 * A truly interactive 3D Visualizer using CSS 3D Transforms.
 * Allows the user to rotate the core profile from all angles.
 */
const TransformerVisualizer = ({ L = 0, b1 = 0, A = 0, B = 0 }) => {
    const [rotation, setRotation] = useState({ x: -20, y: 35 });
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // Physical dimensions (scaled for display)
    const radius = Math.max(parseFloat(b1) || 20, 5);
    const straightL = Math.max(parseFloat(L) || 40, 0);
    const height = 100; // The "length" of the core leg in 3D
    const scale = 1.2; // Visual scale

    const handleMouseDown = (e) => {
        setIsDragging(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastMousePos.current.x;
        const deltaY = e.clientY - lastMousePos.current.y;

        setRotation(prev => ({
            x: prev.x - deltaY * 0.5,
            y: prev.y + deltaX * 0.5
        }));

        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    // Styles
    const containerStyle = {
        width: '750px',
        height: '550px',
        perspective: '2000px',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        background: 'radial-gradient(circle at center, #0f172a 0%, #000000 100%)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(59, 130, 246, 0.1)',
        position: 'relative',
        overflow: 'hidden'
    };

    const sceneStyle = {
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
    };

    // Shared oblong shape parameters
    const drawRadius = radius * scale;
    const drawL = straightL * scale;
    const halfL = drawL / 2;
    const halfH = height / 2;

    const OblongFace = ({ offsetZ, color, opacity = 1, border = false }) => (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: `${drawL + drawRadius * 2}px`,
            height: `${drawRadius * 2}px`,
            transform: `translate(-50%, -50%) translateZ(${offsetZ}px)`,
            backgroundColor: color,
            borderRadius: `${drawRadius}px`,
            opacity: opacity,
            border: border ? '2px solid rgba(59, 130, 246, 0.5)' : 'none',
            boxSizing: 'border-box',
            pointerEvents: 'none'
        }} />
    );

    const MeasureLabel = ({ text, style, transform }) => (
        <div style={{
            position: 'absolute',
            padding: '2px 6px',
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 'bold',
            borderRadius: '4px',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            ...style,
            transform: `translate(-50%, -50%) ${transform}`
        }}>
            {text}
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={containerStyle} onMouseDown={handleMouseDown}>
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    zIndex: 10,
                    pointerEvents: 'none'
                }}>
                    <div style={{ color: '#60a5fa', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Vue 3D Interactive</div>
                    <div style={{ color: '#475569', fontSize: '10px' }}>Glissez pour faire pivoter</div>
                </div>

                <div style={sceneStyle}>
                    {/* Interior "Slices" to create volume */}
                    {[...Array(10)].map((_, i) => (
                        <OblongFace
                            key={i}
                            offsetZ={-halfH + (i * (height / 9))}
                            color={i === 0 || i === 9 ? '#94a3b8' : '#64748b'}
                            opacity={0.9}
                            border={i === 0 || i === 9}
                        />
                    ))}

                    {/* Side Panels */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: `${drawL}px`,
                        height: `${height}px`,
                        background: 'linear-gradient(to right, #64748b, #94a3b8)',
                        transform: `translate(-50%, -50%) translateY(${-drawRadius}px) rotateX(90deg)`,
                        border: '1px solid rgba(255,255,255,0.2)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: `${drawL}px`,
                        height: `${height}px`,
                        background: 'linear-gradient(to right, #64748b, #94a3b8)',
                        transform: `translate(-50%, -50%) translateY(${drawRadius}px) rotateX(90deg)`,
                        border: '1px solid rgba(255,255,255,0.2)',
                        pointerEvents: 'none'
                    }} />

                    {/* --- MEASURES --- */}

                    {/* Measure L (Length) */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: `${drawL}px`,
                        height: '1px',
                        borderTop: '1px dashed #60a5fa',
                        transform: `translate(-50%, -50%) translateY(${-drawRadius - 2}px) translateZ(${halfH}px)`,
                        pointerEvents: 'none'
                    }}>
                        <div style={{ position: 'absolute', left: 0, height: '6px', width: '1px', background: '#60a5fa', top: '-3px' }} />
                        <div style={{ position: 'absolute', right: 0, height: '6px', width: '1px', background: '#60a5fa', top: '-3px' }} />
                    </div>

                    {/* Measure Diameter (b1 * 2) */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '1px',
                        height: `${drawRadius * 2}px`,
                        borderLeft: '1px dashed #f87171',
                        transform: `translate(-50%, -50%) translateX(${halfL + drawRadius + 2}px) translateZ(${halfH}px)`,
                        pointerEvents: 'none'
                    }}>
                        <div style={{ position: 'absolute', top: 0, width: '6px', height: '1px', background: '#f87171', left: '-3px' }} />
                        <div style={{ position: 'absolute', bottom: 0, width: '6px', height: '1px', background: '#f87171', left: '-3px' }} />
                    </div>
                    <MeasureLabel text={`Ø: ${b1 * 2}`} transform={`translateX(${halfL + drawRadius + 6}px) translateZ(${halfH}px)`} style={{ color: '#f87171' }} />

                    {/* Measure Height (Core Leg) */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '1px',
                        height: `${height}px`,
                        borderLeft: '1px dashed #34d399',
                        transform: `translate(-50%, -50%) translateX(${-halfL - drawRadius - 2}px) rotateY(-90deg) rotateX(-90deg)`,
                        pointerEvents: 'none'
                    }}>
                        <div style={{ position: 'absolute', top: 0, width: '6px', height: '1px', background: '#34d399', left: '-3px' }} />
                        <div style={{ position: 'absolute', bottom: 0, width: '6px', height: '1px', background: '#34d399', left: '-3px' }} />
                    </div>
                    <MeasureLabel text={`H: ${height}`} transform={`translateX(${-halfL - drawRadius - 4}px) translateY(0) rotateY(0)`} style={{ color: '#34d399' }} />

                    {/* Glowing Core Indicators */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '2px',
                        height: `${height + 20}px`,
                        backgroundColor: '#3b82f6',
                        boxShadow: '0 0 15px #3b82f6',
                        transform: `translate(-50%, -50%) translateX(${halfL + drawRadius}px)`,
                        opacity: 0.4
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '2px',
                        height: `${height + 20}px`,
                        backgroundColor: '#3b82f6',
                        boxShadow: '0 0 15px #3b82f6',
                        transform: `translate(-50%, -50%) translateX(${-halfL - drawRadius}px)`,
                        opacity: 0.4
                    }} />
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); setRotation({ x: -20, y: 35 }); }}
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '8px 15px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        zIndex: 20,
                        transition: 'background 0.3s'
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                >
                    Réinitialiser
                </button>
            </div>

            <div style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-around',
                fontSize: '11px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase' }}>Largeur (X)</div>
                    <div style={{ color: '#60a5fa', fontWeight: 'bold' }}>{(parseFloat(L) + parseFloat(b1) * 2 || 0).toFixed(1)} mm</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase' }}>Rayon (b1)</div>
                    <div style={{ color: '#f87171', fontWeight: 'bold' }}>{b1} mm</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#64748b', fontSize: '9px', textTransform: 'uppercase' }}>Hauteur Act.</div>
                    <div style={{ color: '#34d399', fontWeight: 'bold' }}>{height} cm</div>
                </div>
            </div>
        </div>
    );
};

export default TransformerVisualizer;
