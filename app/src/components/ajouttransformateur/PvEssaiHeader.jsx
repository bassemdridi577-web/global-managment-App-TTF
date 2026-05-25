import React from 'react';

const PvEssaiHeader = ({
  info,
  onInfoChange,
  language,
  toggleLanguage,
  handleSave,
  handleBack,
  onBackToForm, // Receive the new prop
  // Removed pvDate
  nbPhases,
  typeSource,
  isEditing,
  isBitention,
  showClient, // new prop
  showMission, // new prop
  mtu2_2,
  isPrinter,
  showMatiere, // new prop
  handlePrint,
}) => {
  const [editableDate, setEditableDate] = React.useState('');

  React.useEffect(() => {
    if (info.date) {
      setEditableDate(new Date(info.date).toLocaleString());
    }
  }, [info.date]);

  const languageDisplay = language === 'fr' ? 'français' : 'anglais';
  const displayNbPhases = isBitention ? 3 : nbPhases;

  const handleNumeroChange = (e) => {
    if (onInfoChange) {
      onInfoChange({ ...info, numero: e.target.value });
    }
  };

  const handleClientChange = (e) => {
    if (onInfoChange) {
      onInfoChange({ ...info, client: e.target.value });
    }
  };



  return (
    <>
      {/* Action Buttons (hidden when printing) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }} className="pvessai-printable-actions no-print">
        <span style={{ fontSize: '1rem', color: '#232c65', fontWeight: 500, marginLeft: 4 }}>
          Langue : {languageDisplay}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleLanguage}
            style={{ padding: '8px 18px', fontWeight: 400, borderRadius: 4, border: '1px solid #888', background: '#f5f5f5', cursor: 'pointer', color: '#000000ff', fontSize: '1rem', minWidth: 90 }}
          >
            🌐 Traduire
          </button>
          <button
            onClick={handleSave}
            disabled={isPrinter}
            style={{ padding: '8px 18px', fontWeight: 400, borderRadius: 4, border: '1px solid #888', background: isPrinter ? '#ccc' : '#f5f5f5', cursor: isPrinter ? 'not-allowed' : 'pointer', color: '#000000ff', fontSize: '1rem', minWidth: 90 }}
          >
            {isEditing ? 'Modifier' : 'Sauvegarder'}
          </button>
          <button
            onClick={() => {
              if (handlePrint) {
                handlePrint();
              } else {
                document.body.classList.add('print-pv');
                window.print();
                document.body.classList.remove('print-pv');
              }
            }}
            style={{ padding: '8px 18px', fontWeight: 400, borderRadius: 4, border: '1px solid #888', background: '#f5f5f5', cursor: 'pointer', color: '#000000ff', fontSize: '1rem', minWidth: 90 }}
          >
            Imprimer
          </button>
          {isEditing && !isPrinter && (
            <button
              onClick={onBackToForm}
              style={{ padding: '8px 18px', fontWeight: 400, borderRadius: 4, border: '1px solid #888', background: '#f5f5f5', cursor: 'pointer', color: '#000000ff', fontSize: '1rem', minWidth: 90 }}
            >
              Retour au formulaire
            </button>
          )}
          <button
            onClick={handleBack}
            style={{ padding: '8px 18px', fontWeight: 400, borderRadius: 4, border: '1px solid #888', background: '#f5f5f5', cursor: 'pointer', color: '#000000ff', fontSize: '1rem', minWidth: 90 }}
          >
            Retour
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="pvessai-printable-header" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: '140px', right: '32px', fontWeight: 600, fontSize: '1.1em', color: '#232c65' }}>CE-FOR-20-V0</div>

        <div className="print-header-bottom-row">
          <img src="/tt.jpg" alt="Logo" style={{ display: 'block', height: 90, width: 250, objectFit: 'contain' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <img src="/50001(2).png" alt="ISO 50001" style={{ height: '80px' }} />
            <img src="/45001(2).png" alt="ISO 45001" style={{ height: '80px' }} />
            <img src="/14001(2).png" alt="ISO 14001" style={{ height: '80px' }} />
            <img src="/9001(2).png" alt="ISO 9001" style={{ height: '80px' }} />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div className="pvessai-printable-title">
            {language === 'fr' ? (
              <>Pv d'essai <span style={{ fontWeight: 400 }}>Transformateur</span></>
            ) : (
              <><span style={{ fontWeight: 400 }}>Transformer</span> Test Report</>
            )}
          </div>
          <div className="pvessai-printable-subtitle">
            N°: {info.id} | Date:
            <input
              type="text"
              value={editableDate || ''}
              onChange={(e) => setEditableDate(e.target.value)}
              className="editable-date-input"
              style={{
                border: 'none',
                background: 'transparent',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                color: 'inherit',
                width: 'auto',
                minWidth: '200px',
                padding: '0 4px',
                borderBottom: '1px dashed #ccc'
              }}
            />
            {showMission && `| Mission: ${info.mission}`}
          </div>
        </div>
        {/* Info Table */}
        <table className="info-table" style={{ border: 'none', background: 'none', boxShadow: 'none', textAlign: 'left', marginTop: '20px', width: '100%' }}>
          <tbody>
            <tr>
              <td className="label" style={{ border: 'none', background: 'none', fontSize: '12pt' }}>{language === 'fr' ? 'Marque' : 'Brand'}:</td>
              <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12pt' }}>{info.marque}</td>
              <td className="label" style={{ border: 'none', background: 'none', fontSize: '12pt' }}>{language === 'fr' ? 'Puissance' : 'Power'}:</td>
              <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.power} KVA</td>
              <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Fréquence' : 'Frequency'}:</td>
              <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.frequency} Hz</td>
            </tr>
            <tr>
              <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Numéro de serie' : 'Serial number'}:</td>
              <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <input
                  type="text"
                  value={info.numero || ''}
                  onChange={handleNumeroChange}
                  style={{ border: '1px solid #ccc', padding: '4px', borderRadius: '4px', width: '100%' }}
                />
              </td>
              <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Tension primaire' : 'primary voltage'}:</td>
              <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.mtu1} KV</td>
              <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Nombre de phases' : 'Number of phases'}:</td>
              <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(() => {
                  const type = String(typeSource);
                  if (language === 'fr') {
                    if (isBitention) return `${displayNbPhases} Triphasé (bitention)`;
                    return `${displayNbPhases} ${type}`;
                  } else {
                    let transType = type;
                    if (type === 'Triphasé') transType = 'Three-phase';
                    else if (type === 'Biphasé') transType = 'Two-phase';
                    else if (type === 'Monophasé') transType = 'Single-phase';

                    if (isBitention) return `${displayNbPhases} Three-phase (bitention)`;
                    return `${displayNbPhases} ${transType}`;
                  }
                })()}
              </td>
            </tr>
            <tr>
              {showClient ? (
                <>
                  <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Client' : 'Customer'}:</td>
                  <td style={{ border: 'none', background: 'none', fontSize: '12pt' /* Removed whiteSpace, overflow, textOverflow */ }}>
                    <textarea
                      rows="3" // Added rows attribute
                      value={info.client || ''}
                      onChange={handleClientChange}
                      className="client-textarea-print"
                      style={{ border: '1px solid #ccc', padding: '4px', borderRadius: '4px', width: '100%', resize: 'none' }}
                    ></textarea>
                  </td>
                </>
              ) : (
                <>
                  <td className="label" style={{ border: 'none', background: 'none', fontSize: '12pt' }}>{language === 'fr' ? 'Norme' : 'Standard'}:</td>
                  <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.norme}</td>
                </>
              )}
              <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Intensité Primaire' : 'Primary intensity'}:</td>
              <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.mtu2 ? parseFloat(info.mtu2).toFixed(2) : '0'} A</td>
              <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'nombre de position' : 'Number of positions'}:</td>
              <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.prises}</td>
            </tr>
            <tr>
              {showClient ? (
                <>
                  <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Norme' : 'Standard'}:</td>
                  <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.norme}</td>
                </>
              ) : (
                <>
                  <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Refroidissement' : 'Cooling'}:</td>
                  <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.refroidissement ? info.refroidissement : 'Non renseigné'}</td>
                </>
              )}
              <td className="label" style={{ border: 'none', background: 'none' }}>{isBitention ? (language === 'fr' ? 'Tension primaire (2)' : 'primary voltage (2)') : (language === 'fr' ? 'Tension secondaire (1)' : 'Secondary voltage (1)')}:</td>
              <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isBitention ? `${info.mtU1_2} KV` : `${info.btu2} V`}</td>
              <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Couplage' : 'Connection'}:</td>
              <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.couplage}</td>
            </tr>
            <tr>
              {showClient ? (
                <>
                  <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Refroidissement' : 'Cooling'}:</td>
                  <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{info.refroidissement ? info.refroidissement : 'Non renseigné'}</td>
                </>
              ) : (
                <td colSpan="2" style={{ border: 'none', background: 'none' }}></td>
              )}
              <td className="label" style={{ border: 'none', background: 'none' }}>{isBitention ? (language === 'fr' ? 'Intensité Primaire (2)' : 'Primary intensity (2)') : (language === 'fr' ? 'Intensité secondaire (1)' : 'Secondary Intensity (1)')}:</td>
              <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isBitention ? `${mtu2_2 ? parseFloat(mtu2_2).toFixed(2) : '0'} A` : (info.type === 'Biphasé' ? `${info.mti2_1 ? parseFloat(info.mti2_1).toFixed(2) : '0'} A` : (info.bti2 ? parseFloat(info.bti2).toFixed(2) : '0') + ' A')}</td>
              {showMatiere ? (
                <>
                  <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Enroulement' : 'Winding'}:</td>
                  <td style={{ border: 'none', background: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {(() => {
                      const matiere = info.matiere?.toLowerCase();
                      if (language === 'fr') {
                        if (matiere === 'cuivre') return 'Cuivre';
                        if (matiere === 'aluminium') return 'Aluminium';
                        return info.matiere || 'Non renseigné';
                      } else {
                        if (matiere === 'cuivre') return 'Copper';
                        if (matiere === 'aluminium') return 'Aluminum';
                        return info.matiere || 'Not specified';
                      }
                    })()}
                  </td>
                </>
              ) : (
                <td colSpan="2" style={{ border: 'none', background: 'none' }}></td>
              )}
            </tr>
            {/* Biphasé extra rows */}
            {info.type === 'Biphasé' && (
              <>
                <tr>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Tension secondaire (2)' : 'Secondary voltage (2)'}:</td>
                  <td style={{ border: 'none', background: 'none' }}>{info.btu2_2} V</td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                </tr>
                <tr>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Intensité secondaire (2)' : 'Secondary intensity (2)'}:</td>
                  <td style={{ border: 'none', background: 'none' }}>{info.bti2_2 ? parseFloat(info.bti2_2).toFixed(2) : '0'} A</td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                </tr>
              </>
            )}
            {isBitention && (
              <>
                <tr>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Tension secondaire (1)' : 'Secondary voltage (1)'}:</td>
                  <td style={{ border: 'none', background: 'none' }}>{info.btu2} V</td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                </tr>
                <tr>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td className="label" style={{ border: 'none', background: 'none' }}>{language === 'fr' ? 'Intensité secondaire (1)' : 'Secondary intensity (1)'}:</td>
                  <td style={{ border: 'none', background: 'none' }}>{info.type === 'Biphasé' ? `${info.mti2_1 ? parseFloat(info.mti2_1).toFixed(2) : '0'} A` : (info.bti2 ? parseFloat(info.bti2).toFixed(2) : '0') + ' A'}</td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                  <td style={{ border: 'none', background: 'none' }}></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
        <hr className="pvessai-printable-divider" style={{ width: '100%' }} />
      </div>
    </>
  );
};

export default PvEssaiHeader;