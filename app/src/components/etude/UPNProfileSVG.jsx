import React from 'react';

const UPNProfileSVG = ({
    type = "upn",
    label = "UPN",
    subLabel = "Inférieur",
    isTechnicalPlan = true,
    // UPN Specific
    total = 1131,
    left = 200, middle = 731, diam = 10,
    mid_left = 20, mid_middle = 1014, p2_h = 50,
    l2 = 90, m2a = 363, m2b = 324, m2c = 324, r2 = 30,
    // Bobine & Circuit Specific
    width = 248, centralWidth = 80, height = 168,
    // Circuit Specific
    windowH = 672.5, d1 = 324, d2 = 324, d3 = 201
}) => {
    const v_pad = 200;
    const v_width = 800;
    const viewWidth = v_width + 2 * v_pad;
    const v_scale = v_width / (type === 'bobine' ? width : 1131);

    const renderArrow = (x1, y1, x2, y2) => (
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" markerStart="url(#arrowhead)" markerEnd="url(#arrowhead-rev)" />
    );

    const renderHole = (cx, cy, r = 10) => (
        <g>
            <circle cx={cx} cy={cy} r={r} stroke="black" fill="none" strokeWidth="1.5" />
            <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} stroke="black" strokeWidth="0.5" />
            <line x1={cx} y1={cy - 14} x2={cx} y2={cy + 14} stroke="black" strokeWidth="0.5" />
        </g>
    );

    const renderExtension = (x, y1, y2) => (
        <line x1={x} y1={y1} x2={x} y2={y2} stroke="#718096" strokeWidth="0.5" />
    );

    if (type === 'bobine') {
        // Use fixed visual constants for the drawing to keep BT/MT shapes identical
        const visualWidth = 248;
        const visualHeight = 168;
        const visualCentralWidth = 80;

        const v_scale_bobine = v_width / (visualWidth * 1.3);
        const v_h = visualHeight * v_scale_bobine;
        const v_cw = visualCentralWidth * v_scale_bobine;
        const v_totalW = visualWidth * v_scale_bobine;
        const v_r = (visualHeight / 2) * v_scale_bobine;

        const startX = v_pad + (v_width - v_totalW) / 2;
        const centerY = 280;

        return (
            <svg viewBox={`0 0 ${viewWidth} 850`} width="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <marker id="arrowhead" markerWidth="14" markerHeight="10" refX="0" refY="5" orient="auto"><polygon points="0 0, 14 5, 0 10" fill="black" /></marker>
                    <marker id="arrowhead-rev" markerWidth="14" markerHeight="10" refX="14" refY="5" orient="auto"><polygon points="14 0, 0 5, 14 10" fill="black" /></marker>
                </defs>

                <text x="5" y="60" fontFamily="Arial" fontSize="42" fontWeight="bold" fill="#2d3748">{label}</text>

                <g transform={`translate(${startX}, ${centerY})`}>
                    {/* The Oblong Shape */}
                    <path d={`
                        M ${v_r},0 
                        L ${v_r + v_cw},0 
                        A ${v_r},${v_r} 0 0 1 ${v_r + v_cw},${v_h} 
                        L ${v_r},${v_h} 
                        A ${v_r},${v_r} 0 0 1 ${v_r},0 
                        Z
                    `} fill="none" stroke="black" strokeWidth="4" />

                    {/* Vertical lines */}
                    <line x1={v_r} y1="0" x2={v_r} y2={v_h} stroke="black" strokeWidth="2" />
                    <line x1={v_r + v_cw} y1="0" x2={v_r + v_cw} y2={v_h} stroke="black" strokeWidth="2" />
                    <line x1={v_r + v_cw / 2} y1="0" x2={v_r + v_cw / 2} y2={v_h} stroke="black" strokeWidth="2" />

                    {/* Annotations Extension Lines */}
                    {/* Height */}
                    <line x1={v_r} y1="0" x2="-60" y2="0" stroke="#718096" strokeWidth="1.5" />
                    <line x1={v_r} y1={v_h} x2="-60" y2={v_h} stroke="#718096" strokeWidth="1.5" />
                    {renderArrow(-50, 0, -50, v_h)}
                    <text x="-80" y={v_h / 2} textAnchor="middle" fontSize="38" fontWeight="bold" transform={`rotate(-90, -80, ${v_h / 2})`}>{height}</text>

                    {/* Central Width */}
                    <line x1={v_r} y1="0" x2={v_r} y2="-100" stroke="#718096" strokeWidth="1.5" />
                    <line x1={v_r + v_cw} y1="0" x2={v_r + v_cw} y2="-100" stroke="#718096" strokeWidth="1.5" />
                    {renderArrow(v_r, -85, v_r + v_cw, -85)}
                    <text x={v_r + v_cw / 2} y="-115" textAnchor="middle" fontSize="38" fontWeight="bold">{centralWidth}</text>

                    {/* Total Width */}
                    <line x1="0" y1={v_h / 2} x2="0" y2="-180" stroke="#718096" strokeWidth="1.5" />
                    <line x1={v_totalW} y1={v_h / 2} x2={v_totalW} y2="-180" stroke="#718096" strokeWidth="1.5" />
                    {renderArrow(0, -165, v_totalW, -165)}
                    <text x={v_totalW / 2} y="-200" textAnchor="middle" fontSize="38" fontWeight="bold">{width}</text>
                </g>
            </svg>
        );
    }

    if (type === 'circuit') {
        // FIXED GEOMETRY CONSTANTS (Using initial defaults)
        const visW = 1100;
        const visH = 832.5;
        const visWH = 672.5;
        const visD1 = 350;
        const visD2 = 350;
        const visD3 = 250;

        const v_scale_cs = v_width / (visW * 1.2);
        const v_tw = visW * v_scale_cs;
        const v_th = visH * v_scale_cs;
        const v_wh = visWH * v_scale_cs;
        const v_yh = (v_th - v_wh) / 2; // Yoke height
        const v_lw = v_yh * 2; // Limb width (assuming symmetric)
        const v_d1 = visD1 * v_scale_cs;
        const v_d2 = visD2 * v_scale_cs;
        const v_d3 = visD3 * v_scale_cs;

        const startX = v_pad + (v_width - v_tw) / 2;
        const centerY = 240; // Balanced vertical position

        // Centers of 4 vertical members
        const x_col = [
            v_lw / 2,
            v_lw / 2 + v_d1,
            v_lw / 2 + v_d1 + v_d2,
            v_lw / 2 + v_d1 + v_d2 + v_d3
        ];

        return (
            <svg viewBox={`0 0 ${viewWidth} 1070`} width="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="black" /></marker>
                    <marker id="arrowhead-rev" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="10 0, 0 3.5, 10 7" fill="black" /></marker>
                </defs>

                <text x="5" y="80" fontFamily="Arial" fontSize="22" fontWeight="bold" fill="#2d3748">{label}</text>

                <g transform={`translate(${startX}, ${centerY})`}>
                    {/* Outer Frame */}
                    <rect x="0" y="0" width={v_tw} height={v_th} fill="none" stroke="black" strokeWidth="2" />

                    {/* Inner Windows */}
                    {[0, 1, 2].map(i => {
                        const winX = x_col[i] + v_lw / 2;
                        const winW = x_col[i + 1] - x_col[i] - v_lw;
                        if (winW <= 0) return null;
                        return (
                            <rect key={i} x={winX} y={v_yh} width={winW} height={v_wh} fill="none" stroke="black" strokeWidth="2" />
                        );
                    })}

                    {/* Joints and separation lines */}
                    {[0, 1, 2, 3].map(i => (
                        <g key={i}>
                            <line x1={x_col[i] - v_lw / 2} y1={v_yh} x2={x_col[i]} y2="0" stroke="black" strokeWidth="1" />
                            <line x1={x_col[i] + v_lw / 2} y1={v_yh} x2={x_col[i]} y2="0" stroke="black" strokeWidth="1" />
                            <line x1={x_col[i] - v_lw / 2} y1={v_th - v_yh} x2={x_col[i]} y2={v_th} stroke="black" strokeWidth="1" />
                            <line x1={x_col[i] + v_lw / 2} y1={v_th - v_yh} x2={x_col[i]} y2={v_th} stroke="black" strokeWidth="1" />
                            <line x1={x_col[i]} y1="0" x2={x_col[i]} y2={v_th} stroke="#718096" strokeWidth="1" strokeDasharray="5,5" />
                        </g>
                    ))}

                    {/* Holes as shown in pic (centered on windows) */}
                    <circle cx={x_col[0]} cy={v_th / 2} r="6" fill="white" stroke="black" strokeWidth="1" />
                    {[0, 1, 2].map(i => {
                        const winCenterX = (x_col[i] + x_col[i + 1]) / 2;
                        return (
                            <g key={i}>
                                <circle cx={winCenterX} cy={20} r="6" fill="white" stroke="black" strokeWidth="1" />
                                <circle cx={winCenterX} cy={v_th - 20} r="6" fill="white" stroke="black" strokeWidth="1" />
                            </g>
                        );
                    })}

                    {/* Annotations Right (Total Height) */}
                    <line x1={v_tw + 10} y1="0" x2={v_tw + 180} y2="0" stroke="#718096" strokeWidth="1.5" />
                    <line x1={v_tw + 10} y1={v_th} x2={v_tw + 180} y2={v_th} stroke="#718096" strokeWidth="1.5" />
                    {renderArrow(v_tw + 160, 0, v_tw + 160, v_th)}
                    <text x={v_tw + 195} y={v_th / 2} textAnchor="middle" fontSize="34" fontWeight="bold" transform={`rotate(90, ${v_tw + 195}, ${v_th / 2})`}>{height}</text>

                    {/* Height Label (Window Height) */}
                    <line x1={v_tw + 10} y1={v_yh} x2={v_tw + 80} y2={v_yh} stroke="#718096" strokeWidth="1.5" />
                    <line x1={v_tw + 10} y1={v_th - v_yh} x2={v_tw + 80} y2={v_th - v_yh} stroke="#718096" strokeWidth="1.5" />
                    {renderArrow(v_tw + 70, v_yh, v_tw + 70, v_th - v_yh)}
                    <text x={v_tw + 105} y={v_th / 2} textAnchor="middle" fontSize="34" fontWeight="bold" transform={`rotate(90, ${v_tw + 105}, ${v_th / 2})`}>{windowH}</text>

                    {/* Annotations Left */}
                    <line x1="-10" y1="0" x2="-100" y2="0" stroke="#718096" strokeWidth="1.5" />
                    <line x1="-10" y1={v_th / 2} x2="-100" y2={v_th / 2} stroke="#718096" strokeWidth="1.5" />
                    <line x1="-10" y1={v_th} x2="-100" y2={v_th} stroke="#718096" strokeWidth="1.5" />
                    {renderArrow(-90, 0, -90, v_th / 2)}
                    {renderArrow(-90, v_th / 2, -90, v_th)}
                    <text x="-120" y={v_th / 4} textAnchor="middle" fontSize="30" fontWeight="bold" transform={`rotate(-90, -120, ${v_th / 4})`}>{height / 2}</text>
                    <text x="-120" y={(3 * v_th) / 4} textAnchor="middle" fontSize="30" fontWeight="bold" transform={`rotate(-90, -120, ${(3 * v_th) / 4})`}>{height / 2}</text>

                    {/* Annotations Bottom */}
                    <line x1="0" y1={v_th + 10} x2="0" y2={v_th + 180} stroke="#718096" strokeWidth="1.5" />
                    <line x1={v_tw} y1={v_th + 10} x2={v_tw} y2={v_th + 180} stroke="#718096" strokeWidth="1.5" />
                    {renderArrow(0, v_th + 170, v_tw, v_th + 170)}
                    <text x={v_tw / 2} y={v_th + 205} textAnchor="middle" fontSize="36" fontWeight="bold">{width}</text>

                    {x_col.slice(0, -1).map((x, i) => {
                        const nextX = x_col[i + 1];
                        return (
                            <g key={i}>
                                <line x1={x} y1={v_th + 10} x2={x} y2={v_th + 120} stroke="#718096" strokeWidth="1.5" />
                                <line x1={nextX} y1={v_th + 10} x2={nextX} y2={v_th + 120} stroke="#718096" strokeWidth="1.5" />
                                {renderArrow(x, v_th + 110, nextX, v_th + 110)}
                                <text x={(x + nextX) / 2} y={v_th + 145} textAnchor="middle" fontSize="30" fontWeight="bold">{[d1, d2, d3][i]}</text>
                            </g>
                        );
                    })}

                    {/* Top Intervals (Half-limb spacings) */}
                    {[
                        { start: x_col[0], end: x_col[0] + (x_col[1] - x_col[0]) / 2, val: d1 / 2 },
                        { start: x_col[0] + (x_col[1] - x_col[0]) / 2, end: x_col[1], val: d1 / 2 },
                        { start: x_col[1], end: x_col[1] + (x_col[2] - x_col[1]) / 2, val: d2 / 2 },
                        { start: x_col[1] + (x_col[2] - x_col[1]) / 2, end: x_col[2], val: d2 / 2 },
                        { start: x_col[2], end: x_col[2] + (x_col[3] - x_col[2]) / 2, val: d3 / 2 },
                        { start: x_col[2] + (x_col[3] - x_col[2]) / 2, end: x_col[3], val: d3 / 2 }
                    ].map((seg, i) => (
                        <g key={i}>
                            <line x1={seg.start} y1="-10" x2={seg.start} y2="-120" stroke="#718096" strokeWidth="1.5" />
                            <line x1={seg.end} y1="-10" x2={seg.end} y2="-120" stroke="#718096" strokeWidth="1.5" />
                            {renderArrow(seg.start, -110, seg.end, -110)}
                            <text
                                x={(seg.start + seg.end) / 2}
                                y="-135"
                                textAnchor="middle"
                                fontSize="25"
                                fontWeight="bold"
                            >
                                {seg.val}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>
        );
    }

    const v_total = v_width;
    const v_p1_l = (200 / 1131) * v_total;
    const v_p1_m = (731 / 1131) * v_total;

    const v_p2_l = (97 / 1131) * v_total;
    const v_p2_m = (937 / 1131) * v_total;

    const v_p3_l = (90 / 1131) * v_total;
    const v_p3_m2a = (363 / 1131) * v_total;
    const v_p3_m2b = (324 / 1131) * v_total;
    const v_p3_m2c = (324 / 1131) * v_total;

    const isSup = subLabel?.toLowerCase().includes('supérieur');

    return (
        <svg viewBox={`0 0 ${viewWidth} 880`} width="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="black" /></marker>
                <marker id="arrowhead-rev" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="10 0, 0 3.5, 10 7" fill="black" /></marker>
            </defs>

            <text x="5" y="80" fontFamily="Arial" fontSize="22" fontWeight="bold" fill="#2d3748">{label} {subLabel}</text>

            {/* --- PROFILE 1 (Haut) --- */}
            <g transform={`translate(${v_pad}, 40)`}>
                <rect x="0" y="20" width={v_total} height="70" stroke="black" fill="none" strokeWidth="1.5" />
                <line x1="0" y1="80" x2={v_total} y2="80" stroke="black" strokeWidth="1" strokeDasharray="5,3" />

                {isSup ? (
                    // 4 Holes Schema
                    [0, v_p3_m2a, v_p3_m2a + v_p3_m2b, v_p3_m2a + v_p3_m2b + v_p3_m2c].map((x, i) => {
                        const px = v_p3_l + x;
                        return (
                            <g key={i}>
                                {renderHole(px, 55)}
                                {renderExtension(px, 55, 130)}
                                {i === 0 && (
                                    <g>
                                        <path d={`M ${px},55 L ${px + 40},10 L ${px + 150},10`} fill="none" stroke="black" strokeWidth="1.2" markerStart="url(#arrowhead-rev)" />
                                        <text x={px + 45} y="5" fontSize="16" fontWeight="bold">4x Ø {diam}</text>
                                    </g>
                                )}
                            </g>
                        );
                    })
                ) : (
                    // 2 Holes Schema
                    [v_p1_l, v_p1_l + v_p1_m].map((px, i) => (
                        <g key={i}>
                            {renderHole(px, 55)}
                            {renderExtension(px, 55, 130)}
                            {i === 0 && (
                                <g>
                                    <path d={`M ${px},55 L ${px + 40},10 L ${px + 150},10`} fill="none" stroke="black" strokeWidth="1.2" markerStart="url(#arrowhead-rev)" />
                                    <text x={px + 45} y="5" fontSize="16" fontWeight="bold">2x Ø {diam}</text>
                                </g>
                            )}
                        </g>
                    ))
                )}

                {renderExtension(0, 90, 220)}
                {renderExtension(v_total, 90, 220)}

                {isSup ? (
                    <>
                        {renderArrow(0, 120, v_p3_l, 120)}
                        <text x={v_p3_l / 2} y="115" textAnchor="middle" fontSize="16" fontWeight="bold">90</text>

                        {renderArrow(v_p3_l, 120, v_p3_l + v_p3_m2a, 120)}
                        <text x={v_p3_l + v_p3_m2a / 2} y="115" textAnchor="middle" fontSize="16" fontWeight="bold">363</text>

                        {renderArrow(v_p3_l + v_p3_m2a, 120, v_p3_l + v_p3_m2a + v_p3_m2b, 120)}
                        <text x={v_p3_l + v_p3_m2a + v_p3_m2b / 2} y="115" textAnchor="middle" fontSize="16" fontWeight="bold">324</text>

                        {renderArrow(v_p3_l + v_p3_m2a + v_p3_m2b, 120, v_p3_l + v_p3_m2a + v_p3_m2b + v_p3_m2c, 120)}
                        <text x={v_p3_l + v_p3_m2a + v_p3_m2b + v_p3_m2c / 2} y="115" textAnchor="middle" fontSize="16" fontWeight="bold">324</text>

                        {renderArrow(v_p3_l + v_p3_m2a + v_p3_m2b + v_p3_m2c, 120, v_total, 120)}
                        <text x={(v_p3_l + v_p3_m2a + v_p3_m2b + v_p3_m2c + v_total) / 2} y="115" textAnchor="middle" fontSize="16" fontWeight="bold">30</text>
                    </>
                ) : (
                    <>
                        {renderArrow(0, 120, v_p1_l, 120)}
                        <text x={v_p1_l / 2} y="115" textAnchor="middle" fontSize="16" fontWeight="bold">{left}</text>
                        {renderArrow(v_p1_l, 120, v_p1_l + v_p1_m, 120)}
                        <text x={v_p1_l + v_p1_m / 2} y="115" textAnchor="middle" fontSize="16" fontWeight="bold">{middle}</text>
                    </>
                )}
                {renderArrow(0, 200, v_total, 200)}
                <text x={v_total / 2} y="195" textAnchor="middle" fontSize="16" fontWeight="bold">{total}</text>
            </g>

            {/* --- PROFILE 2 (Milieu) --- */}
            <g transform={`translate(${v_pad}, 320)`}>
                <g transform="translate(-100, 0)">
                    <path d="M 50,0 L 20,0 L 20,130 L 50,130 L 50,125 L 28,115 L 28,15 L 50,5 Z" fill="none" stroke="black" strokeWidth="1.5" />
                    <text x="35" y="-25" fontSize="14" fontWeight="bold" textAnchor="middle">23</text>
                    {renderArrow(20, -15, 50, -15)}
                    <text x="80" y="65" fontSize="14" fontWeight="bold" transform="rotate(-90 80,65)" textAnchor="middle">140</text>
                    {renderArrow(65, 0, 65, 130)}
                </g>

                <rect x="0" y="0" width={v_total} height="130" stroke="black" fill="none" strokeWidth="1.5" />
                <line x1="0" y1="10" x2={v_total} y2="10" stroke="black" />
                <line x1="0" y1="120" x2={v_total} y2="120" stroke="black" />

                {renderHole(v_p2_l, 65)}
                {renderHole(v_p2_l + v_p2_m, 65)}

                {renderExtension(0, 130, 220)}
                {renderExtension(v_p2_l, 65, 220)}
                {renderExtension(v_p2_l + v_p2_m, 65, 220)}
                {renderExtension(v_total, 130, 220)}

                <g>
                    <path d={`M ${v_p2_l},65 L ${v_p2_l + 40},110 L ${v_p2_l + 180},110`} fill="none" stroke="black" strokeWidth="1.2" markerStart="url(#arrowhead-rev)" />
                    <text x={v_p2_l + 45} y="105" fontSize="16" fontWeight="bold">2x 14</text>
                </g>

                {renderArrow(0, 180, v_p2_l, 180)}
                <text x={v_p2_l / 2} y="175" textAnchor="middle" fontSize="16" fontWeight="bold">{mid_left}</text>
                {renderArrow(v_p2_l, 180, v_p2_l + v_p2_m, 180)}
                <text x={v_p2_l + v_p2_m / 2} y="175" textAnchor="middle" fontSize="16" fontWeight="bold">{mid_middle}</text>

                <line x1={v_total + 10} y1="65" x2={v_total + 35} y2="65" stroke="#718096" strokeWidth="0.5" />
                <line x1={v_total + 10} y1="130" x2={v_total + 35} y2="130" stroke="#718096" strokeWidth="0.5" />
                {renderArrow(v_total + 25, 65, v_total + 25, 130)}
                <text x={v_total + 45} y="103" fontSize="16" fontWeight="bold">{p2_h}</text>
            </g>

            {/* --- PROFILE 3 (Bas) --- */}
            <g transform={`translate(${v_pad}, 640)`}>
                <rect x="0" y="0" width={v_total} height="70" stroke="black" fill="none" strokeWidth="1.5" />
                <line x1="0" y1="15" x2={v_total} y2="15" stroke="black" strokeWidth="1" strokeDasharray="5,3" />

                {(isSup ? [50, 50 + 1031] :
                    [0, 363, 363 + 324, 363 + 324 + 324]).map((x, i) => {
                        const vx = isSup ? (x / 1131) * v_total : v_p3_l + (x / 1131) * v_total;
                        const label_val = isSup ? (i === 0 ? 50 : 1031) : (i === 0 ? l2 : (i === 1 ? m2a : (i === 2 ? m2b : m2c)));
                        return (
                            <g key={i}>
                                {renderHole(vx, 45)}
                                {renderExtension(vx, 45, 120)}
                                {i === 0 && (
                                    <g>
                                        <path d={`M ${vx},45 L ${vx + 40},-10 L ${vx + 150},-10`} fill="none" stroke="black" strokeWidth="1.2" markerStart="url(#arrowhead-rev)" />
                                        <text x={vx + 45} y="-15" fontSize="16" fontWeight="bold">{isSup ? "2x Ø 14" : "4x Ø 14"}</text>
                                    </g>
                                )}
                            </g>
                        );
                    })}
                {renderExtension(0, 70, 120)}
                {renderExtension(v_total, 70, 120)}

                {isSup ? (
                    <>
                        {renderArrow(0, 100, (50 / 1131) * v_total, 100)}
                        <text x={(25 / 1131) * v_total} y="95" textAnchor="middle" fontSize="16" fontWeight="bold">50</text>
                        {renderArrow((50 / 1131) * v_total, 100, (1081 / 1131) * v_total, 100)}
                        <text x={(565 / 1131) * v_total} y="95" textAnchor="middle" fontSize="16" fontWeight="bold">1031</text>
                    </>
                ) : (
                    <>
                        {renderArrow(0, 100, v_p3_l, 100)}
                        <text x={v_p3_l / 2} y="95" textAnchor="middle" fontSize="16" fontWeight="bold">{l2}</text>

                        {renderArrow(v_p3_l, 100, v_p3_l + v_p3_m2a, 100)}
                        <text x={v_p3_l + v_p3_m2a / 2} y="95" textAnchor="middle" fontSize="16" fontWeight="bold">{m2a}</text>

                        {renderArrow(v_p3_l + v_p3_m2a, 100, v_p3_l + v_p3_m2a + v_p3_m2b, 100)}
                        <text x={v_p3_l + v_p3_m2a + v_p3_m2b / 2} y="95" textAnchor="middle" fontSize="16" fontWeight="bold">{m2b}</text>

                        {renderArrow(v_p3_l + v_p3_m2a + v_p3_m2b, 100, v_p3_l + v_p3_m2a + v_p3_m2b + v_p3_m2c, 100)}
                        <text x={v_p3_l + v_p3_m2a + v_p3_m2b + v_p3_m2c / 2} y="95" textAnchor="middle" fontSize="16" fontWeight="bold">{m2c}</text>

                        {renderArrow(v_p3_l + v_p3_m2a + v_p3_m2b + v_p3_m2c, 100, v_total, 100)}
                        <text x={(v_p3_l + v_p3_m2a + v_p3_m2b + v_p3_m2c + v_total) / 2} y="95" textAnchor="middle" fontSize="16" fontWeight="bold">{r2}</text>
                    </>
                )}
            </g>
        </svg>
    );
};

export default UPNProfileSVG;
