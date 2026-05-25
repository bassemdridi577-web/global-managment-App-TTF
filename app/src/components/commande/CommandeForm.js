import React, { useState, useEffect } from 'react';
import './commandeform.css';
import { useSaveCommande } from './savecommand';

// Simple validation function (customize as needed)
function validate(formData, groups, step) {
  const errors = {};
  if (step === 1) {
    if (!formData.date) errors.date = 'Champ requis';
    if (!formData.garantie) errors.garantie = 'Champ requis';
    if (!formData.client) errors.client = 'Champ requis';
  }
  if (step === 2) {
    groups.forEach((group, i) => {
      if (!group.qte) errors[`qte${i}`] = 'Champ requis';
      if (!group.puissance) errors[`puissance${i}`] = 'Champ requis';
      if (!group.u1) errors[`u1${i}`] = 'Champ requis';
      if (!group.u2) errors[`u2${i}`] = 'Champ requis';
    });
  }
  return errors;
}

export default function CommandeForm({ currentUser, onCommandeAdded, selectedCommande, onCancelEdit }) {
  const [formData, setFormData] = useState({
    date: '',
    garantie: '',
    client: '',
    dateLivraison: '',
    normes: '',
    essai: '',
    matiere: '',
    couplage: '',
    traverseHT: '',
    relaisSecurite: '',
    thermostat: '',
    adAir: '',
    soupapeSecurite: '',
    typeInstallation: ''
  });
  // Start with one group by default
  const [groups, setGroups] = useState([
    { id: Date.now(), qte: '', puissance: '', u1: '', u2: '' }
  ]);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // hook to save commande to backend
  const { save: saveCommandeApi } = useSaveCommande();

  useEffect(() => {
    if (selectedCommande) {
      const { formData: selectedFormData, items } = selectedCommande;
      setFormData({
        ...selectedFormData,
        date: selectedFormData.date ? new Date(selectedFormData.date).toISOString().slice(0, 10) : '',
        dateLivraison: selectedFormData.dateLivraison ? new Date(selectedFormData.dateLivraison).toISOString().slice(0, 10) : '',
      });
      if (items && items.length > 0) {
        setGroups(items);
      }
    } else {
      // Reset form when selectedCommande is null
      setFormData({
        date: '',
        garantie: '',
        client: '',
        dateLivraison: '',
        normes: '',
        essai: '',
        matiere: '',
        couplage: '',
        traverseHT: '',
        relaisSecurite: '',
        thermostat: '',
        adAir: '',
        soupapeSecurite: '',
        typeInstallation: ''
      });
      setGroups([{ id: Date.now(), qte: '', puissance: '', u1: '', u2: '' }]);
    }
  }, [selectedCommande]);

  // Handle next step (validation for step 1)
  const handleNext = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData, groups, 1);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setStep((s) => s + 1);
    }
  };

  // Handle input changes for formData
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input changes for group fields
  const handleGroupChange = (index, field, value) => {
    setGroups((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handlePrev = (e) => {
    e.preventDefault();
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleCancelEdit = () => {
    onCancelEdit();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate step 2 (groups)
    const validationErrors = validate(formData, groups, 2);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // Build payload
    const formDataWithGroups = { ...formData, groups: [...groups], currentUser: currentUser };

    try {
      // call backend API to persist commande
      await saveCommandeApi({
        id: selectedCommande ? selectedCommande.id : null,
        numero: formData.numero || null,
        client: formData.client || null,
        items: formDataWithGroups.groups || [],
        total: formData.total || null,
        formData: formDataWithGroups
      });

      // On success add to local list and reset form
      // notify user
      try { window.alert(selectedCommande ? 'Commande modifiée' : 'Commande enregistrée'); } catch (e) { /* ignore */ }

      if (onCommandeAdded) {
        onCommandeAdded();
      }

      setFormData({
        date: '',
        garantie: '',
        client: '',
        dateLivraison: '',
        normes: '',
        essai: '',
        qte: '',
        matiere: '',
        couplage: '',
        traverseHT: '',
        relaisSecurite: '',
        thermostat: '',
        adAir: '',
        soupapeSecurite: '',
        typeInstallation: ''
      });
      setGroups([{ id: Date.now(), qte: '', puissance: '', u1: '', u2: '' }]);
      setIsSubmitted(true);
      setStep(1);
    } catch (err) {
      // show error on form
      setErrors(prev => ({ ...prev, submit: err.message || 'Save failed' }));
      console.error('Failed to save commande', err);
    }
  };

  return (
    <div className="ajout-transformateur-form-container">
      <div className="ajout-transformateur-form-static">
        <div className="ajout-transformateur-form-row">
          <div className="ajout-transformateur-form-sidebar">
            <img src={process.env.PUBLIC_URL + '/TT2.png'} alt="Tunisie Transformateur Logo" className="ajout-transformateur-form-logo" />
            <h2 className="ajout-transformateur-form-title">{selectedCommande ? 'Modifier Commande' : 'Commande'}</h2>
            <div className="ajout-transformateur-form-subtitle">Ordre De Fabrication</div>
            <div className="ajout-transformateur-form-steps">
              <div className="ajout-transformateur-form-step-section">
                <div className="ajout-transformateur-form-step-header">
                  <span className={step === 1 ? "ajout-transformateur-form-step-circle active" : "ajout-transformateur-form-step-circle"}>{step === 1 ? '1' : <span>&#10003;</span>}</span>
                  <span className={step === 1 ? "ajout-transformateur-form-step-label active" : "ajout-transformateur-form-step-label"}>Information générale</span>
                </div>
                <div className="ajout-transformateur-form-step-divider"></div>
              </div>
              <div className="ajout-transformateur-form-step-section">
                <div className="ajout-transformateur-form-step-header">
                  <span className={step === 2 ? "ajout-transformateur-form-step-circle active" : step > 2 ? "ajout-transformateur-form-step-circle" : "ajout-transformateur-form-step-circle"}>
                    {step > 2 ? <span>&#10003;</span> : '2'}
                  </span>
                  <span className={step === 2 ? "ajout-transformateur-form-step-label active" : "ajout-transformateur-form-step-label"}>Production</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ajout-transformateur-form-content">
            {step === 1 && (
              <form onSubmit={handleNext} noValidate>
                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Date Commande*</label>
                    <input
                      type="date"
                      className={"cmd-form-control " + (errors.date ? "error" : "")}
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
                    />
                    {errors.date && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.date}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Garantie *</label>
                    <input
                      type="text"
                      className={"cmd-form-control " + (errors.garantie ? "error" : "")}
                      name="garantie"
                      placeholder="Entrez la garantie"
                      value={formData.garantie}
                      onChange={handleChange}
                      style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
                    />
                    {errors.garantie && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.garantie}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Client *</label>
                    <input
                      type="text"
                      className={"cmd-form-control " + (errors.client ? "error" : "")}
                      name="client"
                      placeholder="Entrez le client"
                      value={formData.client}
                      onChange={handleChange}
                      style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
                    />
                    {errors.client && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.client}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Date livraison</label>
                    <input
                      type="date"
                      className={"cmd-form-control " + (errors.dateLivraison ? "error" : "")}
                      name="dateLivraison"
                      value={formData.dateLivraison}
                      onChange={handleChange}
                      style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
                    />
                    {errors.dateLivraison && <div className="ajout-transformateur-form-error">{errors.dateLivraison}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Normes</label>
                    <select
                      className={"cmd-form-control " + (errors.normes ? "error" : "")}
                      name="normes"
                      value={formData.normes}
                      onChange={handleChange}
                      style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
                    >
                      <option value="">---Sélectionner les normes---</option>
                      <option value="CEI">CEI</option>
                      <option value="STEG">STEG</option>
                    </select>
                    {errors.normes && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.normes}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Essai</label>
                    <select
                      className={"cmd-form-control " + (errors.essai ? "error" : "")}
                      name="essai"
                      value={formData.essai}
                      onChange={handleChange}
                      style={{ height: '52px', minHeight: '52px', maxHeight: '52px', boxSizing: 'border-box' }}
                    >
                      <option value="">---Sélectionner l'essai---</option>
                      <option value="TT">TT</option>
                      <option value="CEM">CEM</option>
                      <option value="TT+CEM">TT+CEM</option>
                    </select>
                    {errors.essai && <div className="ajout-transformateur-form-error" style={{ position: 'absolute', bottom: '0', left: '0', right: '0', margin: '0', fontSize: '12px', color: '#e53e3e', pointerEvents: 'none' }}>{errors.essai}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <button type="submit" className="ajout-transformateur-form-submit">
                    Suivant &rarr;
                  </button>
                </div>
              </form>
            )}

            {step === 2 && !isSubmitted && (
              <form onSubmit={handleSubmit} noValidate>


                {groups.map((group, index) => (
                  <React.Fragment key={group.id}>
                    <div className="ajout-transformateur-form-group-header">

                    </div>
                    <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                      <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                        <label className="ajout-transformateur-form-label">Quantité de transformateurs (ordre de fabrication{index + 1} *)</label>
                        <input
                          type="number"
                          className={"cmd-form-control " + (errors[`qte${index}`] ? "error" : "")}
                          placeholder="Entrez la quantité"
                          value={group.qte}
                          onChange={(e) => handleGroupChange(index, 'qte', e.target.value)}
                        />
                        {errors[`qte${index}`] && <div className="ajout-transformateur-form-error">{errors[`qte${index}`]}</div>}
                      </div>
                    </div>
                    <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                      <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                        <label className="ajout-transformateur-form-label">Puissance (KVA) *</label>
                        <input
                          type="number"
                          className={"cmd-form-control " + (errors[`puissance${index}`] ? "error" : "")}
                          placeholder="Entrez la puissance"
                          value={group.puissance}
                          onChange={(e) => handleGroupChange(index, 'puissance', e.target.value)}
                        />
                        {errors[`puissance${index}`] && <div className="ajout-transformateur-form-error">{errors[`puissance${index}`]}</div>}
                      </div>
                    </div>
                    <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                      <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                        <label className="ajout-transformateur-form-label">U1(KV) *</label>
                        <input
                          type="number"
                          className={"cmd-form-control " + (errors[`u1${index}`] ? "error" : "")}
                          placeholder="Entrez U1"
                          value={group.u1}
                          onChange={(e) => handleGroupChange(index, 'u1', e.target.value)}
                        />
                        {errors[`u1${index}`] && <div className="ajout-transformateur-form-error">{errors[`u1${index}`]}</div>}
                      </div>
                      <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                        <label className="ajout-transformateur-form-label">U2(KV) *</label>
                        <input
                          type="number"
                          className={"cmd-form-control " + (errors[`u2${index}`] ? "error" : "")}
                          placeholder="Entrez U2"
                          value={group.u2}
                          onChange={(e) => handleGroupChange(index, 'u2', e.target.value)}
                        />
                        {errors[`u2${index}`] && <div className="ajout-transformateur-form-error">{errors[`u2${index}`]}</div>}
                      </div>
                    </div>
                    {/* Add group button directly after the last group's U1/U2 fields */}
                    {index === groups.length - 1 && (
                      <div style={{ marginTop: 16, marginBottom: 16, display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="ajout-transformateur-form-submit"
                          onClick={() => groups.length < 10 && setGroups(prev => ([...prev, { id: Date.now(), qte: '', puissance: '', u1: '', u2: '' }]))}
                          disabled={groups.length >= 10}
                        >
                          Ajouter une quantité
                        </button>
                        {groups.length > 1 && (
                          <button
                            type="button"
                            className="ajout-transformateur-form-submit"
                            style={{ background: '#e74c3c' }}
                            onClick={() => setGroups(prev => prev.slice(0, -1))}
                          >
                            Supprimer
                          </button>
                        )}
                        {groups.length >= 10 && <span style={{ color: 'red', marginLeft: 8 }}>Maximum 10 quantités</span>}
                      </div>
                    )}
                  </React.Fragment>
                ))}

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Couplage *</label>
                    <select
                      className={"cmd-form-control " + (errors.couplage ? "error" : "")}
                      name="couplage"
                      value={formData.couplage}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner le couplage</option>
                      <option value="DYN">DYN</option>
                      <option value="YNYN">YNYN</option>
                      <option value="YZ">YZ</option>
                    </select>
                    {errors.couplage && <div className="ajout-transformateur-form-error">{errors.couplage}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Traverse HT *</label>
                    <input
                      type="text"
                      className={"cmd-form-control " + (errors.traverseHT ? "error" : "")}
                      name="traverseHT"
                      placeholder="Entrez la traverse HT"
                      value={formData.traverseHT}
                      onChange={handleChange}
                    />
                    {errors.traverseHT && <div className="ajout-transformateur-form-error">{errors.traverseHT}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Relais De Securité *</label>
                    <input
                      type="text"
                      className={"cmd-form-control " + (errors.relaisSecurite ? "error" : "")}
                      name="relaisSecurite"
                      placeholder="Entrez le relais de sécurité"
                      value={formData.relaisSecurite}
                      onChange={handleChange}
                    />
                    {errors.relaisSecurite && <div className="ajout-transformateur-form-error">{errors.relaisSecurite}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Thermostat *</label>
                    <select
                      className={"cmd-form-control " + (errors.thermostat ? "error" : "")}
                      name="thermostat"
                      value={formData.thermostat}
                      onChange={handleChange}
                    >
                      <option value="">---Sélectionner une option---</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                    {errors.thermostat && <div className="ajout-transformateur-form-error">{errors.thermostat}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">A.D'air *</label>
                    <select
                      className={"cmd-form-control " + (errors.adAir ? "error" : "")}
                      name="adAir"
                      value={formData.adAir}
                      onChange={handleChange}
                    >
                      <option value="">---Sélectionner une option---</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                    {errors.adAir && <div className="ajout-transformateur-form-error">{errors.adAir}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Soupape de Securité *</label>
                    <select
                      className={"cmd-form-control " + (errors.soupapeSecurite ? "error" : "")}
                      name="soupapeSecurite"
                      value={formData.soupapeSecurite}
                      onChange={handleChange}
                    >
                      <option value="">---Sélectionner une option---</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                    {errors.soupapeSecurite && <div className="ajout-transformateur-form-error">{errors.soupapeSecurite}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Type d'installation *</label>
                    <input
                      type="text"
                      className={"cmd-form-control " + (errors.typeInstallation ? "error" : "")}
                      name="typeInstallation"
                      placeholder="Entrez le type d'installation"
                      value={formData.typeInstallation}
                      onChange={handleChange}
                    />
                    {errors.typeInstallation && <div className="ajout-transformateur-form-error">{errors.typeInstallation}</div>}
                  </div>
                </div>

                <div className="ajout-transformateur-form-fields-row" style={{ alignItems: 'start' }}>
                  <div className="ajout-transformateur-form-field" style={{ position: 'relative', paddingBottom: '22px', alignSelf: 'start' }}>
                    <label className="ajout-transformateur-form-label">Matière</label>
                    <select
                      className={"cmd-form-control " + (errors.matiere ? "error" : "")}
                      name="matiere"
                      value={formData.matiere}
                      onChange={handleChange}
                    >
                      <option value="">---Sélectionner la matière---</option>
                      <option value="Aluminum">Aluminum</option>
                      <option value="Cuivre">Cuivre</option>
                    </select>
                    {errors.matiere && <div className="ajout-transformateur-form-error">{errors.matiere}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button className="ajout-transformateur-form-submit" onClick={handlePrev} type="button">
                    &larr; Précédent
                  </button>
                  <div>
                    {selectedCommande && (
                      <button type="button" className="btn btn-secondary" onClick={handleCancelEdit} style={{ marginRight: '10px' }}>
                        Annuler
                      </button>
                    )}
                    <button type="submit" className="ajout-transformateur-form-submit">
                      {selectedCommande ? 'Modifier' : 'Soumettre'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* removed 'Ajouter une nouvelle commande' button */}
          </div>
        </div>
      </div>
    </div>
  );
}
