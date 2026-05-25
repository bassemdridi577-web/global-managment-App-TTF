# Rapport des Calculs du Transformateur

Ce fichier documente les formules et les points d'entrée des calculs effectués dans l'application. 
Tous les calculs sont désormais tracés en temps réel dans la **console du navigateur**.

## Comment voir les logs ?
1. Ouvrez l'application dans votre navigateur.
2. Appuyez sur `F12` (ou clic droit > Inspecter).
3. Allez dans l'onglet **Console**.
4. Vous verrez des groupes colorés intitulés `CALCULATION: NomDuCalcul` ou `DIMENSIONS: Section`.

## Liste des Formules Loguées

### Circuit Magnétique
- **Perte Po** : `Poids net * 1.2 * Perte Po Efficace`
- **Induction (B)** : `(Volt par spire / 4.44 / Section / Fréquence) * 10 000`
- **Section** : Somme des `Largeur * (Gradin Haut + Gradin Bas) / 100`

### Bobinage BT & MT
- **Courant** : `(Puissance * 1000) / (Tension * 1.732)`
- **Spires MT** : Ratio de tension ajusté (1.05) selon le couplage (Dyn11, YnYn0, etc.)
- **Résistance V.N.** : `(Rho * Nombre de tours * Longueur moyenne) / Section`
- **Poids (KG) Conducteur** : `Longueur moyenne * Tours * Section * Densité * 3 / 1000`
- **Bobine Ovale Moyenne** : Calcul basé sur le périmètre moyen de la bobine ovale.
- **Largeur du cuivre** : `(Diamètre 1er conducteur + Diamètre 2ème conducteur + Epaisseur isolant conducteur) * Fréquence (Hz)` *(utilise la fréquence de la page CM4C)*



### Dimensions Physiques
- **Épaisseur Radiale** : Somme des épaisseurs du conducteur, des isolants entre couches et des canaux de refroidissement.
- **Diamètres** : Progression du diamètre de la colonne vers l'extérieur (BT puis MT).

---
*Note : Pour tout changement de formule, veuillez modifier `src/components/etude/etudeCalculations.js`.*
