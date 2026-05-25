import { createRowState } from './controlHelpers';

/**
 * Initial state for bobinage dimensional control
 */
export const initialBobinageState = {
    bt: {
        columns: {
            a: { date: '', operateur: '' },
            b: { date: '', operateur: '' },
            c: { date: '', operateur: '' }
        },
        dimensionFil: createRowState(),
        nombreFiligrane: createRowState(),
        diametreInterBobine: createRowState(),
        diametreExtBobine: createRowState(),
        epaisseurCouche: createRowState(),
        nombreSpireCouche: createRowState(),
        nombreSpireTotales: createRowState(),
        hauteurBobinage: createRowState(),
        hauteurBobine: createRowState(),
        controleur: '',
        verificateur: ''
    },
    mt: {
        columns: {
            a: { date: '', operateur: '' },
            b: { date: '', operateur: '' },
            c: { date: '', operateur: '' }
        },
        dimensionFil: createRowState(),
        nombreFiligrane: createRowState(),
        diametreInterBobine: createRowState(),
        diametreExtBobine: createRowState(),
        epaisseurCouche: createRowState(),
        nombreSpireCouche: createRowState(),
        nombreSpireTotales: createRowState(),
        hauteurBobinage: createRowState(),
        hauteurBobine: createRowState(),
        controleur: '',
        verificateur: ''
    }
};

/**
 * Initial state for circuit magnetique control
 */
export const initialCircuitMagnetiqueState = {
    largeurB: {
        f1c1: { mesures: '', prevue: '' },
        f2c2: { mesures: '', prevue: '' },
        f3c3: { mesures: '', prevue: '' },
        c4: { mesures: '', prevue: '' }
    },
    longueurA: {
        f1c1: { mesures: '', prevue: '' },
        f2c2: { mesures: '', prevue: '' },
        f3c3: { mesures: '', prevue: '' },
        c4: { mesures: '', prevue: '' }
    },
    epaisseurE1: {
        f1c1: { mesures: '', prevue: '' },
        f2c2: { mesures: '', prevue: '' },
        f3c3: { mesures: '', prevue: '' },
        c4: { mesures: '', prevue: '' }
    },
    epaisseurE2: {
        f1c1: { mesures: '', prevue: '' },
        f2c2: { mesures: '', prevue: '' },
        f3c3: { mesures: '', prevue: '' },
        c4: { mesures: '', prevue: '' }
    },
    date: '',
    operateur: '',
    controleur: '',
    observation: '',
    etat: '',
    verification: ''
};

/**
 * Initial state for montage control
 */
export const initialMontageState = {
    dM1BT: {
        c1: { mesures: '', prevue: '' },
        c2: { mesures: '', prevue: '' },
        c3: { mesures: '', prevue: '' }
    },
    dBTCM: {
        c1: { mesures: '', prevue: '' },
        c2: { mesures: '', prevue: '' },
        c3: { mesures: '', prevue: '' }
    },
    dMTCM: {
        c1: { mesures: '', prevue: '' },
        c2: { mesures: '', prevue: '' },
        c3: { mesures: '', prevue: '' }
    },
    operateur: '',
    etat: '',
    observation: '',
    controleur: '',
    date: '',
    dateControle: '',
    signature: ''
};

/**
 * Initial state for essai control
 */
export const initialEssaiState = {
    dateTestEtancheite: '',
    pressionInjectee: '',
    pressionFinEssai: '',
    heureDebut: '',
    heureFin: '',
    cnc: '',
    controleur: '',
    verificateur: '',
    observations: '',
    controleurFooter: '',
    observationsFooter: ''
};

/**
 * Initial state for controle final
 */
export const initialControleFinalState = {
    fuite: false,
    peinture: false,
    isolateurMTBT: false,
    marquage: false,
    neutreRouge: false,
    terre: false,
    commut: false,
    soupape: false,
    pSignaletique: false,
    vanne: false,
    relais: false,
    doigtDeGant: false,
    cosse: false,
    cnc: '',
    observation: ''
};

/**
 * Initial state for tests et essais
 */
export const initialTestsEssaisState = {
    ondules: {
        larE1_mesure: '', larE1_prevu: '', larE1_observation: '',
        lanI1_mesure: '', lanI1_prevu: '', lanI1_observation: '',
        h1_mesure: '', h1_prevu: '', h1_observation: '',
        larE2_mesure: '', larE2_prevu: '', larE2_observation: '',
        lanI2_mesure: '', lanI2_prevu: '', lanI2_observation: '',
        h2_mesure: '', h2_prevu: '', h2_observation: '',
        date: '', operateur: '', etat: ''
    },
    cuvePied: {
        l_mesure: '', l_prevu: '',
        L_mesure: '', L_prevu: '',
        h_mesure: '', h_prevu: '',
        lUpn_mesure: '', lUpn_prevu: '',
        LUpn_mesure: '', LUpn_prevu: '',
        enUpn_mesure: '', enUpn_prevu: '',
        dTrou_mesure: '', dTrou_prevu: ''
    },
    upn: {
        i_mesure: '', i_prevu: '',
        L_mesure: '', L_prevu: '',
        ent_mesure: '', ent_prevu: '',
        a_mesure: '', a_prevu: '',
        b_mesure: '', b_prevu: '',
        d_mesure: '', d_prevu: '',
        date: '', operateur: '', etat: '', observation: ''
    },
    couvercle: {
        largeurW_mesure: '', largeurW_prevu: '',
        langueurX_mesure: '', langueurX_prevu: '',
        exmtbt_mesure: '', exmtbt_prevu: '',
        emtbt_mesure: '', emtbt_prevu: '',
        dmtbt_mesure: '', dmtbt_prevu: '',
        exbt_mesure: '', exbt_prevu: '',
        ebt_mesure: '', ebt_prevu: '',
        dbt_mesure: '', dbt_prevu: '',
        date: '', operateur: '', etat: '', observation: ''
    }
};
