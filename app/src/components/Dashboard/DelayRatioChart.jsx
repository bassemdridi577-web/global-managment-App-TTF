import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DelayRatioChart = ({ total, delayed, inProgressOnTime, finishedOnTime }) => {
    const data = [
        { name: 'Retards', value: delayed || 0 },
        { name: 'En cours', value: inProgressOnTime || 0 },
        { name: 'À Temps', value: finishedOnTime || 0 }
    ];

    const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // Red (Danger), Orange (Warning), Green (Success)

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        if (percent === 0) return null;
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="700">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        innerRadius={40}
                        dataKey="value"
                        paddingAngle={2}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => [`${value} transformateurs`, '']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span style={{ color: '#475569', fontWeight: 500 }}>{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DelayRatioChart;
