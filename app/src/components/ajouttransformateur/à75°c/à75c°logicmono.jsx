import React, { useState, useEffect } from 'react';
import Calcul75mono from '../../calcul75/calcul75mono';

const CalculMonoLogic = (props) => {
    const {
        puissance,
        Matiere, // 'cuivre' or 'alluminum' from the form
        tension_primaire, // in kV from the form
        Tension_secondaire_1, // in V from the form
        Temperature_dessais, // from PV measurement field 'Température (court circuit)'
        temperature, // from PV measurement field 'Température (résistance)'
        Resistance_MT, // from PV measurement field
        Resistance_BT, // from PV measurement field
        I_percent, // from 'essai a vide' table, this is I0
        P0_W, // from 'essai a vide' table, this is P0
        Ucc_Mesure, // from PV measurement, this is Ucc (voltage)
        Pcc_Mesure, // from PV measurement, this is pcc
        I1, // calculated HT current
        I2, // calculated BT current
        onCalculated, // Callback to pass results to parent
    } = props;

    const [values, setValues] = useState({});
    const [resultValues, setResultValues] = useState({});

    useEffect(() => {
        const mappedValues = {
            puissance: parseFloat(puissance),
            matiere: Matiere === 'aluminum' ? 'aluminum' : Matiere,
            tention_ht: parseFloat(tension_primaire) * 1000, // kV to V
            tention_bt: parseFloat(Tension_secondaire_1),
            temperature_cc: parseFloat(Temperature_dessais),
            temperature_res: parseFloat(temperature),
            rht: parseFloat(Resistance_MT),
            rbt: parseFloat(Resistance_BT),
            i0: parseFloat(I_percent),
            p0: parseFloat(P0_W),
            ucc: parseFloat(Ucc_Mesure),
            pcc: parseFloat(Pcc_Mesure),
            courant_ht: parseFloat(I1),
            courant_bt: parseFloat(I2),
        };
        setValues(mappedValues);
    }, [
        puissance, Matiere, tension_primaire, Tension_secondaire_1,
        Temperature_dessais, temperature, Resistance_MT, Resistance_BT,
        I_percent, P0_W, Ucc_Mesure, Pcc_Mesure, I1, I2
    ]);

    useEffect(() => {
        if (onCalculated) {
            onCalculated(resultValues);
        }
    }, [resultValues, onCalculated]);

    return (
        <Calcul75mono
            values={values}
            setValues={setValues}
            resultValues={resultValues}
            setResultValues={setResultValues}
        />
    );
};

export default CalculMonoLogic;
