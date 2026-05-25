export interface DonneesTransfo {
    type: string;
    puissance: string | number;
    tensionPrimaire: string | number;
    courantPrimaire: string | number;
    tensionSecondaire: string | number;
    courantSecondaire: string | number;
    couplage: string;
    poNormaliser: string | number;
    pccNormaliser: string | number;
    courantAVide: string | number;
    uccNormaliser: string | number;
    frequence: string | number;
    variation: string | number;
    nbreVariation: string | number;
    variationTexte: string;
    tempPerteAdditionnelle: string | number;
    perteTotal: string | number;
    perteAdditionnelle75: string | number;
    tolPo: string | number;
    tolPcc: string | number;
    tolTotal: string | number;
    tolI0: string | number;
    tolUcc: string | number;
    tempReference: string | number;
    tempInitial: string | number;
    resAlu20: string | number;
    resAluTemp: string | number;
    resCuivre20: string | number;
    resCuivreTemp: string | number;
    masseVolAlu: string | number;
    masseVolCuivre: string | number;
    resSecondaire: string | number;
    resPrimaire: string | number;
    masseVolSecondaire: string | number;
    masseVolPrimaire: string | number;
    lieu: string;
    version: string;
    typeConducteur: string;
}

export interface CircuitMagnetique {
    natureTole: string;
    natureToleExtra: string;
    epaisseurCanaleCMSecondaire: string | number;
    hauteurEnroulementActive: string | number;
    nbreCanalSecondairePrimaire: string | number;
    c_mm: string | number;
    b1_bn: string | number;
    s1_sn: string | number;
    diametre: string | number;
    diametreColonneTHE: string | number;
    majorationPo: string | number;
}

export interface BasseTension {
    spire: string | number;
    hauteurConducteur: string | number;
    epessConducteur: string | number;
    nbreConducteur: string | number;
    nbreCouche: string | number;
    epaisseurIsolantConducteur: string | number;
    caleEntreSpire: string | number;
    cerceauPartieCourt: string | number;
    resistanceConnection: string | number;
    nbreCanalSecondaire: string | number;
    epaisseurDuCanal: string | number;
    ampereParMm2: string | number;
    typeConducteur: string;
    nbreNervuresParCanal: string | number;
    largeurLatte: string | number;
    entraxeLattes1erCanal: string | number;
    entraxeLamelles2eCanal: string | number;
    numCoucheInsertionCanalBT: string | number;
    numCoucheInsertionCanalBT2: string | number;
}

export interface MoyenneTension {
    diametre1erConducteur: string | number;
    diametre2emeConducteur: string | number;
    epaisseurDuCanalPrimaire: string | number;
    epaisseurTotaleCanaleInternePrimaire: string | number;
    nbreDeCanalPrimaire: string | number;
    epaisseurRadialePrimaire: string | number;
    cerceau: string | number;
    epaisseurIsolantEntreCouche: string | number;
    epaisseurIsolantConducteur: string | number;
    resistanceConnection: string | number;
    typeConducteur: string;
    largeurCanal: string | number;
}
