import React from "react";

const PlateDrawing = ({
  left = 200,
  middle = 731,
  total = 1131
}) => {
  return (
    <div className="plate-drawing-wrapper" style={{ margin: '20px 0', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', backgroundColor: '#f7fafc' }}>
      <svg viewBox="0 0 1200 300" width="100%">
        {/* Plate */}
        <rect x="100" y="100" width="900" height="60" stroke="black" fill="none" strokeWidth="2" />

        {/* Holes */}
        <circle cx="250" cy="130" r="8" stroke="black" fill="none" strokeWidth="2" />
        <circle cx="850" cy="130" r="8" stroke="black" fill="none" strokeWidth="2" />

        {/* Left dimension */}
        <line x1="100" y1="200" x2="300" y2="200" stroke="black" strokeWidth="1.5" />
        <text x="180" y="220" fontSize="20" fontWeight="bold" textAnchor="middle">{left}</text>

        {/* Middle dimension */}
        <line x1="300" y1="200" x2="850" y2="200" stroke="black" strokeWidth="1.5" />
        <text x="550" y="220" fontSize="20" fontWeight="bold" textAnchor="middle">{middle}</text>

        {/* Total dimension */}
        <line x1="100" y1="250" x2="1000" y2="250" stroke="black" strokeWidth="1.5" />
        <text x="520" y="270" fontSize="20" fontWeight="bold" textAnchor="middle">{total}</text>
      </svg>
    </div>
  );
};

export default PlateDrawing;
