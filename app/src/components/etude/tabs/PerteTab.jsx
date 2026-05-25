import React from 'react';

const PerteTable = ({ title, data, sectionKey, handleChange }) => {
    return (
        <div className="thermique-block" style={{ marginBottom: '20px', flex: 1 }}>
            <h3 style={{
                backgroundColor: '#f1f5f9',
                padding: '12px',
                borderBottom: '2px solid #e53e3e',
                margin: '0',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2d3748'
            }}>
                {title}
            </h3>
            <table className="donnees-table thermique-table" style={{ fontSize: '13px' }}>
                <thead>
                    <tr>
                        <th style={{ color: '#e53e3e' }}>Puissances</th>
                        <th style={{ color: '#e53e3e' }}>P0</th>
                        <th style={{ color: '#e53e3e' }}>I0</th>
                        <th style={{ color: '#e53e3e' }}>Pcc</th>
                        <th style={{ color: '#e53e3e' }}>Ucc</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, idx) => (
                        <tr key={idx}>
                            <td>
                                <input
                                    type="text"
                                    value={row.puissance}
                                    onChange={(e) => handleChange(sectionKey, idx, 'puissance', e.target.value)}
                                    className="no-style-input"
                                    style={{ textAlign: 'center', color: '#3182ce', fontWeight: 'bold' }}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={row.p0}
                                    onChange={(e) => handleChange(sectionKey, idx, 'p0', e.target.value)}
                                    className="no-style-input"
                                    style={{ textAlign: 'center' }}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={row.i0}
                                    onChange={(e) => handleChange(sectionKey, idx, 'i0', e.target.value)}
                                    className="no-style-input"
                                    style={{ textAlign: 'center' }}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={row.pcc}
                                    onChange={(e) => handleChange(sectionKey, idx, 'pcc', e.target.value)}
                                    className="no-style-input"
                                    style={{ textAlign: 'center' }}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={row.ucc}
                                    onChange={(e) => handleChange(sectionKey, idx, 'ucc', e.target.value)}
                                    className="no-style-input"
                                    style={{ textAlign: 'center' }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const PerteTab = ({ donneesPerte, handlePerteChange }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '20px', padding: '10px', alignItems: 'flex-start' }}>
            <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <PerteTable
                    title="24KV"
                    data={donneesPerte.kv24}
                    sectionKey="kv24"
                    handleChange={handlePerteChange}
                />
            </div>
            <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <PerteTable
                    title="36KV"
                    data={donneesPerte.kv36}
                    sectionKey="kv36"
                    handleChange={handlePerteChange}
                />
            </div>
            <div style={{ flex: '1', minWidth: '300px', maxWidth: '400px' }}>
                <PerteTable
                    title="Mono"
                    data={donneesPerte.mono}
                    sectionKey="mono"
                    handleChange={handlePerteChange}
                />
            </div>
        </div>
    );
};

export default PerteTab;
