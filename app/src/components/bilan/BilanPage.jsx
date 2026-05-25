import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BilanPage.css';
import './UpnPrint.css';
import { FaCalculator, FaFolderOpen, FaFileExport, FaArrowLeft, FaThermometerHalf, FaListAlt, FaEye, FaPrint } from 'react-icons/fa';
import VisualizerModal from '../etude/VisualizerModal';
import { getTransformerStudies, getTransformerStudyById } from '../../api';

import { BilanThermiqueTable } from './BilanComponents';
import useBilanCalculations from './useBilanCalculations';
import {
    DonneesGenerales,
    DonneesDimensionnelles,
    SectionSecondaire,
    SectionPrimaire,
    SectionCuve,
    SectionConstantes,
    SectionCM4C,
    LossComparisonTable
} from './BilanSectionComponents';
import PerteTab from '../etude/tabs/PerteTab';
import P0Tab from '../etude/tabs/P0Tab';
import { FIXED_SHAPES } from '../etude/EtudeConstants';
import BobinageTab from '../etude/tabs/BobinageTab';
import UpnTab from '../etude/tabs/UpnTab';
import { initialPerte, initialDonneesP0, initialDonneesBobinage, initialDonneesUpn, initialShapes, initialDonneesCM4CComplementaire } from '../etude/EtudeConstants';
import UPNProfileSVG from '../etude/UPNProfileSVG';

const CartoucheUPN = ({ data }) => {
    const today = new Date().toLocaleDateString('fr-FR');
    const code = `${data.lieu || 'L'}/${data.typeConducteur || 'AL'}/${data.version || 'V1'}`;

    return (
        <table className="cartouche-container">
            <tbody>
                <tr>
                    <td colSpan="8" className="cartouche-header-company">TUNISIE TRANSFORMATEURS</td>
                </tr>
                <tr>
                    <td colSpan="8" className="cartouche-header-address">Route de Mateur Km 11 2021 OUED ELLIL   Tél: 71.629.664 - Fax: 71.629.551</td>
                </tr>
                <tr className="cartouche-title-header" style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                    <td style={{ width: '15%' }}>Qualification</td>
                    <td style={{ width: '15%' }}>Signature</td>
                    <td style={{ width: '15%' }}>Date</td>
                    <td style={{ width: '25%' }}>EXECUTION</td>
                    <td style={{ width: '10%' }}>Folio</td>
                    <td style={{ width: '10%' }}>6/6</td>
                    <td style={{ width: '5%' }}>Rev</td>
                    <td style={{ width: '5%' }}>1</td>
                </tr>
                <tr>
                    <td className="cartouche-label-cell" style={{ fontWeight: 'bold', textAlign: 'left' }}>Etude</td>
                    <td></td>
                    <td>{today}</td>
                    <td className="cartouche-execution-cell" style={{ fontWeight: 'bold', fontSize: '14px' }}>UPN</td>
                    <td className="cartouche-small-label" style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Transfo n°</td>
                    <td colSpan="3"></td>
                </tr>
                <tr>
                    <td className="cartouche-label-cell" style={{ fontWeight: 'bold', textAlign: 'left' }}>Approuvé</td>
                    <td></td>
                    <td></td>
                    <td className="cartouche-execution-cell" style={{ fontWeight: 'bold', fontSize: '14px' }}>{data.puissance || '---'} KVA</td>
                    <td colSpan="4"></td>
                </tr>
                <tr>
                    <td className="cartouche-label-cell" style={{ fontWeight: 'bold', textAlign: 'left' }}>C.Qualité</td>
                    <td></td>
                    <td></td>
                    <td className="cartouche-execution-cell" style={{ fontWeight: 'bold', fontSize: '14px' }}>{data.tensionPrimaire || '---'}V / {data.tensionSecondaire || '---'}V</td>
                    <td className="cartouche-small-label" style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>Code</td>
                    <td></td>
                    <td colSpan="2" style={{ fontWeight: 'bold' }}>{code}</td>
                </tr>
            </tbody>
        </table>
    );
};

const CartoucheBobinage = ({ data, calc = {}, title = "PLAN BOBINAGE BT/MT" }) => {
    const today = new Date().toLocaleDateString('fr-FR');
    const code = `${data.lieu || 'L'}/${data.typeConducteur || 'AL'}/${data.version || 'V1'}`;

    // Raw manual weights from tablets logic
    const parseWeight = (val) => {
        if (!val || val === '/') return 0;
        const cleaned = val.toString().replace(/\s/g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    };
    const sec = data.donneesBobinage?.secondaire || {};
    const pri = data.donneesBobinage?.primaire || {};

    const btWeight = Math.round(parseWeight(sec.poidsConducteur) * 10) / 10;
    const pBTWeight = Math.round(parseWeight(sec.poidsPapierIsolant) * 10) / 10;
    const mtWeight = Math.round((parseWeight(pri.poids1erConducteur) + parseWeight(pri.poids2emeConducteur)) * 10) / 10;
    const pMTWeight = Math.round(parseWeight(pri.poidsPapierIsolant) * 10) / 10;

    return (
        <table className="cartouche-container bobinage-cartouche" style={{ marginTop: '20px', borderCollapse: 'collapse', width: '100%', border: '2px solid black', fontSize: '11px' }}>
            <tbody>
                <tr>
                    {/* Left: Materials Table */}
                    <td style={{ width: '30%', padding: '0', verticalAlign: 'top', borderRight: '2px solid black' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', height: '100%' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f1f5f9' }}>
                                    <th style={{ border: '1px solid black', padding: '2px', width: '30px' }}>N°</th>
                                    <th style={{ border: '1px solid black', padding: '2px' }}>Matière</th>
                                    <th style={{ border: '1px solid black', padding: '2px' }}>Quantité</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style={{ border: '1px solid black', textAlign: 'center' }}>4</td><td style={{ border: '1px solid black', paddingLeft: '5px' }}>Papier BT</td><td style={{ border: '1px solid black', textAlign: 'center' }}>{pBTWeight} Kg</td></tr>
                                <tr><td style={{ border: '1px solid black', textAlign: 'center' }}>3</td><td style={{ border: '1px solid black', paddingLeft: '5px' }}>Papier MT</td><td style={{ border: '1px solid black', textAlign: 'center' }}>{pMTWeight} Kg</td></tr>
                                <tr><td style={{ border: '1px solid black', textAlign: 'center' }}>2</td><td style={{ border: '1px solid black', paddingLeft: '5px' }}>MT</td><td style={{ border: '1px solid black', textAlign: 'center' }}>{mtWeight} Kg</td></tr>
                                <tr><td style={{ border: '1px solid black', textAlign: 'center' }}>1</td><td style={{ border: '1px solid black', paddingLeft: '5px' }}>BT</td><td style={{ border: '1px solid black', textAlign: 'center' }}>{btWeight} Kg</td></tr>
                                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                                    <td style={{ border: '1px solid black', textAlign: 'center' }}>N°</td>
                                    <td style={{ border: '1px solid black', textAlign: 'center' }}>Matière</td>
                                    <td style={{ border: '1px solid black', textAlign: 'center' }}>Quantité</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>

                    {/* Middle: Title Section */}
                    <td style={{ width: '40%', textAlign: 'center', padding: '5px', borderRight: '2px solid black', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#8d4b31', marginBottom: '4px' }}>{title}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>{data.puissance || '---'} KVA</div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{data.tensionPrimaire || '---'}V / {data.tensionSecondaire || '---'}V</div>
                        <div style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: '14px', textTransform: 'uppercase' }}>TUNISIE TRANSFORMATEUR</div>
                    </td>

                    {/* Right: Project Details */}
                    <td style={{ width: '30%', padding: '0', verticalAlign: 'top' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '2px', fontWeight: 'bold', width: '35%' }}>Code</td>
                                    <td style={{ borderBottom: '1px solid black', padding: '2px' }}>{code}</td>
                                </tr>
                                <tr>
                                    <td colSpan="2" style={{ height: '12px' }}></td>
                                </tr>
                                <tr>
                                    <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '2px', fontWeight: 'bold' }}>Format:</td>
                                    <td style={{ borderBottom: '1px solid black', padding: '2px' }}>A4</td>
                                </tr>
                                <tr>
                                    <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '2px', fontWeight: 'bold' }}>Folio:</td>
                                    <td style={{ borderBottom: '1px solid black', padding: '2px' }}>2/6</td>
                                </tr>
                                <tr>
                                    <td style={{ borderBottom: '1px solid black', borderRight: '1px solid black', padding: '2px', fontWeight: 'bold' }}>Date</td>
                                    <td style={{ borderBottom: '1px solid black', padding: '2px' }}>{today}</td>
                                </tr>
                                <tr>
                                    <td style={{ borderRight: '1px solid black', padding: '2px', fontWeight: 'bold' }}>Matière:</td>
                                    <td style={{ padding: '2px' }}></td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                {/* Approvals Bottom Row */}
                <tr>
                    <td colSpan="3" style={{ borderTop: '2px solid black', padding: '0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', width: '100%', fontSize: '11px' }}>
                            <div style={{ borderRight: '1px solid black', padding: '4px' }}><strong>Rédiger par:</strong> Jelassi Sami</div>
                            <div style={{ borderRight: '1px solid black', padding: '4px' }}><strong>Vérifier par:</strong></div>
                            <div style={{ padding: '4px' }}><strong>Approuvée par:</strong></div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );
};


const printUpnPage = () => {
    const drawingContainer = document.querySelector('.upn-drawing-container');
    const cartouche = document.querySelector('.cartouche-container');
    if (!drawingContainer) return alert('Aucun contenu UPN à imprimer.');

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return alert('Le navigateur a bloqué la fenêtre. Autorisez les popups.');

    const drawingHTML = drawingContainer.innerHTML;
    const cartoucheHTML = cartouche ? cartouche.outerHTML : '';

    printWindow.document.write(`
        <!DOCTYPE html>
        <html><head><title>UPN - Impression</title>
        <style>
            @page { margin: 0.5cm; size: A4 portrait; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: #fff; padding: 10px; zoom: 0.5; }
            svg { display: block; width: 100%; height: auto; max-width: 100%; overflow: visible; }
            h3 { font-size: 18px; border-bottom: 2px solid #3182ce; padding-bottom: 8px; margin-bottom: 20px; }
            .shape-block { margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px dashed #ccc; }
            .shape-block:last-of-type { border-bottom: none; }
            .shape-label { font-weight: bold; font-size: 16px; text-transform: uppercase; border-left: 5px solid #3182ce; padding-left: 12px; margin-bottom: 15px; }
            .upn-shape-title { display: none; }
            .shape-svg-wrap { background: #f9fafb; border-radius: 8px; padding: 20px; display: flex; justify-content: center; }
            .shape-svg-wrap > div { width: 100%; max-width: 1000px; }
            table { width: 100%; border-collapse: collapse; margin-top: 40px; border: 2px solid #000; font-size: 12px; }
            td { border: 1px solid #000; padding: 6px 8px; text-align: center; vertical-align: middle; }
            .cartouche-header-company { font-size: 22px !important; font-weight: 900; font-style: italic; text-transform: uppercase; }
            .cartouche-label-cell { font-weight: bold; background-color: #f1f3f5; text-align: left !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .cartouche-title-header { font-weight: bold; background-color: #e9ecef; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .cartouche-small-label { font-weight: bold; background-color: #f1f3f5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .cartouche-execution-cell { font-weight: bold; font-size: 14px; }
        </style>
        </head><body>
            ${drawingHTML}
            ${cartoucheHTML}
            <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }<\/script>
        </body></html>
    `);
    printWindow.document.close();
};

const printP0Page = () => {
    const p0Content = document.getElementById('p0-print-content');
    if (!p0Content) return alert('Aucun contenu P0 \u00e0 imprimer.');

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return alert('Le navigateur a bloqu\u00e9 la fen\u00eatre. Autorisez les popups.');

    const contentHTML = p0Content.innerHTML;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html><head><title>P0 - Impression</title>
        <style>
            @page { margin: 0.5cm; size: A4 portrait; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body { height: 100%; }
            body { 
                font-family: Arial, sans-serif; 
                background: #fff; 
                padding: 0 15px 5px 15px; 
                zoom: 0.84; 
                display: flex; 
                flex-direction: column;
                min-height: 28.5cm;
                position: relative;
            }
            h2 { font-size: 15px; margin-bottom: 2px; color: #2d3748; }
            h3 { font-size: 14px; text-align: center; padding: 1px; margin: 0; font-weight: bold; }
            svg { display: block; width: 100%; height: auto; max-width: 100%; overflow: visible; }
            
            /* Optimized table sizing */
            table { width: 100% !important; border-collapse: collapse !important; font-size: 13.5px !important; margin-bottom: 4px !important; }
            td, th { border: 1.5px solid #000 !important; padding: 3px 6px !important; text-align: center !important; vertical-align: middle !important; }
            th { background-color: #e0f7fa !important; font-weight: bold !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            
            input { border: none !important; background: transparent !important; text-align: center !important; width: 100% !important; font-size: 13px !important; font-weight: bold !important; }
            textarea { border: none !important; background: transparent !important; width: 100% !important; font-size: 12.5px !important; }
            
            .section-header { display: none; }
            .section-p0 { display: flex; flex-direction: column; flex-grow: 1; }
            .section-content { flex-grow: 1; margin-top: 5px !important; }
            
            /* Simple footer */
            .p0-summary-footer { 
                margin-top: auto !important; 
                width: 100% !important;
                padding-top: 5px !important;
            }
            .p0-summary-footer * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .p0-summary-footer [style*="display: grid"] {
                display: grid !important;
            }
            .p0-summary-footer [style*="display: flex"] {
                display: flex !important;
            }

            .no-style-input { border: none !important; background: transparent !important; text-align: center !important; }
            .p0-preview-container { height: auto !important; min-height: 480px !important; margin-bottom: 5px !important; padding: 0 !important; }
            .p0-preview-svg { width: 100% !important; height: 450px !important; }
            
            /* Reduce gaps in P0Tab structure for print */
            [style*="gap: 20px"] { gap: 6px !important; }
            [style*="margin-bottom: 20px"] { margin-bottom: 4px !important; }
            [style*="padding: 15px"] { padding: 4px !important; }
            [style*="margin-top: auto"] { margin-top: 4px !important; }
        </style>
        </head><body>
            <div class="section-p0">
                ${contentHTML}
            </div>
            <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }<\/script>
        </body></html>
    `);
    printWindow.document.close();
};

const printCuvePage = () => {
    const content = document.getElementById('cuve-print-content');
    if (!content) return alert('Aucun contenu Cuve \u00e0 imprimer.');

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return alert('Le navigateur a bloqu\u00e9 la fen\u00eatre. Autorisez les popups.');

    const contentHTML = content.innerHTML;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html><head><title>Plan de Forme - Cuve</title>
        <style>
            @page { margin: 0.5cm; size: A4 portrait; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: #fff; padding: 5px; zoom: 0.95; }
            h4 { font-size: 14px; color: #4a5568; margin-bottom: 5px; border-left: 4px solid #3182ce; padding-left: 10px; text-transform: uppercase; align-self: flex-start; width: 100%; display: block !important; } 
            svg { display: block; width: 100% !important; height: auto !important; max-width: 100%; max-height: 23cm; margin: 0 auto; overflow: visible; }
            .print-section { page-break-inside: avoid; margin-bottom: 0; display: flex; flex-direction: column; align-items: center; width: 100%; }
            .cartouche-container { margin-top: 10px !important; border: 2px solid black !important; width: 100% !important; border-collapse: collapse; font-size: 11px; }
            .cartouche-container td, .cartouche-container th { border: 1px solid black !important; padding: 4px; }
            .no-print { display: none !important; }
            div[style*="max-width: 1000px"] { width: 100% !important; max-width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; margin-bottom: 0 !important; display: flex; justify-content: center; }
        </style>
        </head><body>
            ${contentHTML}
            <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }<\/script>
        </body></html>
    `);
    printWindow.document.close();
};

const printBobinageBTPage = () => {
    const btContent = document.getElementById('bt-print-content');
    const cartouche = document.querySelector('.bobinage-cartouche');
    if (!btContent) return alert('Aucun contenu BT \u00e0 imprimer.');

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return alert('Le navigateur a bloqu\u00e9 la fen\u00eatre. Autorisez les popups.');

    const contentHTML = btContent.innerHTML;
    const cartoucheHTML = cartouche ? cartouche.outerHTML : '';

    printWindow.document.write(`
        <!DOCTYPE html>
        <html><head><title>Bobinage BT - Impression</title>
        <style>
            @page { margin: 0.5cm; size: A4 portrait; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: #fff; padding: 15px; zoom: 0.85; }
            h2 { 
               text-align: center; 
               background-color: #00bcd4 !important; 
               color: white !important; 
               padding: 10px; 
               margin-bottom: 20px; 
               -webkit-print-color-adjust: exact; 
               print-color-adjust: exact;
               font-size: 20px;
            }
            .section-bobinage { display: block; }
            .section-content { display: block !important; }
            .bobinage-column { width: 100% !important; }
            
            [style*="flex: 0.6"], [style*="flex: 1"], [style*="flex: 1.2"] { 
               display: inline-block !important; 
               vertical-align: top;
               margin-bottom: 20px;
            }
            
            svg { display: block; width: 100%; height: auto; max-width: 100%; overflow: visible; }
            .bobine-preview-container { height: auto !important; min-height: 250px !important; flex: 1.5 !important; }
            .bobine-preview-svg { max-width: 100% !important; }
            
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; }
            td, th { border: 1px solid #e2e8f0; padding: 5px 8px; text-align: left; vertical-align: middle; }
            th { background-color: #f8fafc; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            
            .summary-table td { text-align: center; }
            .summary-table td:first-child { text-align: left; font-weight: bold; }
            
            input { border: none; background: transparent; text-align: left; width: 100%; font-size: 11px; outline: none; }
            
            div[style*="background-color: rgb(255, 251, 235)"] {
                background-color: #fffbeb !important;
                border: 1px solid #fef3c7 !important;
                padding: 10px !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                margin-bottom: 10px !important;
            }

            .cartouche-container { 
                margin-top: 30px !important; 
                border: 2px solid black !important;
                page-break-inside: avoid;
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
            }
            .cartouche-container td, .cartouche-container th { border: 1px solid black !important; }
        </style>
        </head><body>
            ${contentHTML}
            <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }<\/script>
        </body></html>
    `);
    printWindow.document.close();
};

const printBobinageMTPage = () => {
    const mtContent = document.getElementById('mt-print-content');
    const cartouche = document.querySelector('.bobinage-cartouche');
    if (!mtContent) return alert('Aucun contenu MT \u00e0 imprimer.');

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return alert('Le navigateur a bloqu\u00e9 la fen\u00eatre. Autorisez les popups.');

    const contentHTML = mtContent.innerHTML;
    const cartoucheHTML = cartouche ? cartouche.outerHTML : '';

    printWindow.document.write(`
        <!DOCTYPE html>
        <html><head><title>Bobinage MT - Impression</title>
        <style>
            @page { margin: 0.5cm; size: A4 portrait; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; background: #fff; padding: 15px; zoom: 0.85; }
            h2 { 
               text-align: center; 
               background-color: #00bcd4 !important; 
               color: white !important; 
               padding: 10px; 
               margin-bottom: 20px; 
               -webkit-print-color-adjust: exact; 
               print-color-adjust: exact;
               font-size: 20px;
            }
            .section-bobinage { display: block; }
            .section-content { display: block !important; }
            .bobinage-column { width: 100% !important; }
            
            [style*="flex: 0.6"], [style*="flex: 1"], [style*="flex: 1.2"] { 
               display: inline-block !important; 
               vertical-align: top;
               margin-bottom: 20px;
            }
            
            svg { display: block; width: 100%; height: auto; max-width: 100%; overflow: visible; }
            .bobine-preview-container { height: auto !important; min-height: 250px !important; flex: 1.5 !important; }
            .bobine-preview-svg { max-width: 100% !important; }
            
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 15px; }
            td, th { border: 1px solid #e2e8f0; padding: 5px 8px; text-align: left; vertical-align: middle; }
            th { background-color: #f8fafc; font-weight: bold; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            
            .summary-table td { text-align: center; }
            .summary-table td:first-child { text-align: left; font-weight: bold; }
            
            input { border: none; background: transparent; text-align: left; width: 100%; font-size: 11px; outline: none; }
            
            div[style*="background-color: rgb(255, 251, 235)"] {
                background-color: #fffbeb !important;
                border: 1px solid #fef3c7 !important;
                padding: 10px !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                margin-bottom: 10px !important;
            }

            .cartouche-container { 
                margin-top: 30px !important; 
                border: 2px solid black !important;
                page-break-inside: avoid;
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
            }
            .cartouche-container td, .cartouche-container th { border: 1px solid black !important; }

            div[style*="display: flex; gap: 30px"] {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: nowrap !important;
                gap: 15px !important;
            }
        </style>
        </head><body>
            ${contentHTML}
            <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }<\/script>
        </body></html>
    `);
    printWindow.document.close();
};

const BilanPage = () => {
    const [savedStudies, setSavedStudies] = useState([]);
    const [selectedStudy, setSelectedStudy] = useState(null);
    const [showStudyList, setShowStudyList] = useState(false);
    const [showVisualizer, setShowVisualizer] = useState(false);
    const [activeTab, setActiveTab] = useState('generale');
    const location = useLocation();
    const navigate = useNavigate();

    const [etudeData, setEtudeData] = useState({
        type: 'Standard', puissance: '', tensionPrimaire: '', tensionSecondaire: '', couplage: '',
        poNormaliser: '', pccNormaliser: '', courantAVide: '', uccNormaliser: '', frequence: '',
        diametre: '', epaisseurCanaleCMSecondaire: '', hauteurEnroulementActive: '', natureTole: '', natureToleExtra: 'T30',
        nbreCanalSecondairePrimaire: '', b1_bn: '', diametreColonneTHE: '',
        spire: '', hauteurConducteur: '', epessConducteur: '', nbreConducteurBT: '', nbreCoucheBT: '',
        epaisseurTotaleCanaleInterneSecondaire: '', epaisseurIsolantConducteurBT: '', caleEntreSpireBT: '',
        cerceauPartieCourtBT: '', cerceauPartieLongBT: '', nbreCanalSecondaireBT: '',
        epaisseurDuCanalBT: '', typeConducteurBT: '', resistanceConnection: '',
        diametre1erConducteurMT: '', diametre2emeConducteurMT: '', epaisseurDuCanalMT: '',
        nbreCanalPrimaireMT: '', typeConducteurMT: '', resistanceConnectionMT: '',
        epaisseurTotaleCanaleInternePrimaire: '', nbreCoucheMT: '', epaisseurPapierIsolantMT: '',
        hauteurBobineMT: '', cerceauMT: '', epaisseurIsolantConducteurMT: '0,1', majorationPo: '20',
        tempInitial: '', tempReference: '', resAluTemp: '', resCuivreTemp: '', resSecondaire: '', resPrimaire: '',
        numCoucheInsertionCanalBT: '', numCoucheInsertionCanalBT2: '', nbreNervuresParCanal: '',
        entraxeLattes1erCanal: '', entraxeLamelles2eCanal: '',
        largeurCanalMT: '', largeurCanalBT: '',
        hauteurCuve: '', longueurCuve: '', largeurCuve: '', corniereCuve: '', hauteurOnde: '',
        largeurPartieLong: '', largeurPartieCourt: '',
        hauteurActivePartieLongBT: '', hauteurActivePartieCourtBT: '',
        nbreOndePartieLong: '', nbreOndePartieCourt: '', perteTotalCuve: '',
        masseVolAlu: '', masseVolCuivre: '', resAlu20: '', resCuivre20: '',
        masseVolSecondaire: '', masseVolPrimaire: '', donneesThermique: null,
        donneesCM4C: [], parametresCM: { semispessoreOval: '65' },
        donneesPerte: initialPerte,
        donneesP0: initialDonneesP0,
        donneesBobinage: initialDonneesBobinage,
        donneesUpn: initialDonneesUpn,
        donneesCM4CComplementaire: initialDonneesCM4CComplementaire,
        shapes: initialShapes
    });

    const [calculatedData, setCalculatedData] = useState({
        courantPrimaire: '', courantSecondaire: '', p0Calculer: '', pccCalculer: '',
        courantAVideCalculer: '', uccCalculer: '', echauffementBT: '', echauffementMT: '', echauffementHuile: '',
        diametreColonneTHE: '', diametreColonnePRA: '', inductionTheorique: '', inductionPratique: '',
        sectionNet: '', epaisseurACM: '', poidsCM: '', perteWKg: '', i0Specifique: '', ucca: '', uccr: '', ucc: '', resultat: '',
        hauteurActiveMoyenneBT: '', sectionActiveBT: '', nbreSpireParCoucheBT: '', resistanceVNBT: '',
        perteBT: '', perteConnectionBT: '', perteCCBT: '', epaisseurRadialeSecondaire: '', hauteurBobineBT: '',
        diametreDemiCercleInterneBT: '', diametreDemiCercleExterneBT: '', coteCourtAxeInterneBT: '',
        coteLongAxeInterneBT: '', coteCourtAxeExterneBT: '', coteLongAxeExterneBT: '',
        bobineOvaleMoyenneBT: '', ampereParMm2BT: '', kgConducteurBT: '', kgPapierIsolantBT: '',
        spirePrimaire: '', epaisseurIsolantConducteurMT: '', cerceauMT: '', epaisseurIsolantEntreCoucheMT: '',
        nCouchePapierIsolantMT: '', nCoucheMT: '', sectionMm2MT: '', resistanceVNMT: '',
        perteMT: '', perteConnectionMT: '', perteCCMT: '', epaisseurRadialePrimaire: '', largeurDuCanalMT: '',
        hauteurBobineMT: '', diametreDemiCercleInterneMT: '', diametreDemiCercleExterneMT: '',
        coteCourtAxeInterneMT: '', coteLongAxeInterneMT: '', coteCourtAxeExterneMT: '', coteLongAxeExterneMT: '',
        bobineOvaleMoyenneMT: '', hauteurActiveMT: '', kg1erConducteurMT: '', kg2emeConducteurMT: '',
        kgPapierIsolantMT: '', ampereParMm2MT: '', largeurDuCuivreMT: ''
    });

    useBilanCalculations({ etudeData, setEtudeData, calculatedData, setCalculatedData });

    const handleLoadStudy = useCallback((study) => {
        const params = study.donneesCM4C?.params || {};
        setSelectedStudy(study);
        setEtudeData({
            type: study.donneesTransfo?.type || 'Standard', puissance: study.donneesTransfo?.puissance || '',
            lieu: study.donneesTransfo?.lieu || 'Tunis', version: study.donneesTransfo?.version || 'V1', typeConducteur: study.donneesTransfo?.typeConducteur || 'AL',
            tensionPrimaire: study.donneesTransfo?.tensionPrimaire || '', tensionSecondaire: study.donneesTransfo?.tensionSecondaire || '',
            couplage: study.donneesTransfo?.couplage || '', poNormaliser: study.donneesTransfo?.poNormaliser || '',
            pccNormaliser: study.donneesTransfo?.pccNormaliser || '', courantAVide: study.donneesTransfo?.courantAVide || '',
            uccNormaliser: study.donneesTransfo?.uccNormaliser || '', frequence: study.donneesTransfo?.frequence || '',
            perteTotal: study.donneesTransfo?.perteTotal || '',
            tolPo: study.donneesTransfo?.tolPo || '15',
            tolPcc: study.donneesTransfo?.tolPcc || '15',
            tolTotal: study.donneesTransfo?.tolTotal || '10',
            tolI0: study.donneesTransfo?.tolI0 || '30',
            tolUcc: study.donneesTransfo?.tolUcc || '10',
            diametre: study.circuitMagnetique?.diametre || '', epaisseurCanaleCMSecondaire: study.circuitMagnetique?.epaisseurCanaleCMSecondaire || '',
            hauteurEnroulementActive: study.circuitMagnetique?.hauteurEnroulementActive || '',
            nbreCanalSecondairePrimaire: study.circuitMagnetique?.nbreCanalSecondairePrimaire || '',
            epaisseurCanaleSecondairePrimaire: study.donneesBobinage?.primaire?.epaisseurCanaleSecondairePrimaire || '',
            natureTole: study.circuitMagnetique?.natureTole || '', natureToleExtra: study.circuitMagnetique?.natureToleExtra || 'T30', b1_bn: study.circuitMagnetique?.b1_bn || '',
            diametreColonneTHE: study.circuitMagnetique?.diametreColonneTHE || '',
            spire: study.basseTension?.spire || study.donneesBobinage?.secondaire?.spire || '',
            hauteurConducteur: study.basseTension?.hauteurConducteur || study.donneesBobinage?.secondaire?.hauteurConducteur || '',
            epessConducteur: study.basseTension?.epessConducteur || study.donneesBobinage?.secondaire?.epessConducteur || '',
            nbreConducteurBT: study.basseTension?.nbreConducteur || study.donneesBobinage?.secondaire?.nbreConducteur || '',
            nbreCoucheBT: study.basseTension?.nbreCouche || study.donneesBobinage?.secondaire?.nbreCouche || '',
            epaisseurTotaleCanaleInterneSecondaire: study.basseTension?.epaisseurTotaleCanaleInterneSecondaire || study.donneesBobinage?.secondaire?.epaisseurCylindre || '',
            epaisseurIsolantConducteurBT: study.basseTension?.epaisseurIsolantConducteur || study.donneesBobinage?.secondaire?.epaisseurPapierIsolant || '',
            caleEntreSpireBT: study.basseTension?.caleEntreSpire || study.donneesBobinage?.secondaire?.caleEntreSpire || '',
            cerceauPartieLongBT: study.basseTension?.cerceauPartieLong || study.donneesBobinage?.secondaire?.cerceauLong || '',
            cerceauPartieCourtBT: study.basseTension?.cerceauPartieCourt || study.donneesBobinage?.secondaire?.cerceauCourt || '',
            hauteurActivePartieLongBT: study.basseTension?.hauteurActivePartieLong || study.donneesBobinage?.secondaire?.hauteurActivePartieLong || '',
            hauteurActivePartieCourtBT: study.basseTension?.hauteurActivePartieCourt || study.donneesBobinage?.secondaire?.hauteurActivePartieCourt || '',
            nbreCanalSecondaireBT: study.basseTension?.nbreCanalSecondaire || study.donneesBobinage?.secondaire?.nbreCanalRefroidissementBT || '',
            epaisseurDuCanalBT: study.basseTension?.epaisseurDuCanal || study.donneesBobinage?.secondaire?.epaisseurCanalRefroidissement || '',
            typeConducteurBT: study.basseTension?.typeConducteur || study.donneesBobinage?.secondaire?.typeConducteur || '',
            resistanceConnection: study.basseTension?.resistanceConnection || '',
            diametre1erConducteurMT: study.moyenneTension?.diametre1erConducteur || study.donneesBobinage?.primaire?.diametre1erConducteur || '',
            diametre2emeConducteurMT: study.moyenneTension?.diametre2emeConducteur || study.donneesBobinage?.primaire?.diametre2emeConducteur || '',
            epaisseurDuCanalMT: study.moyenneTension?.epaisseurDuCanalPrimaire || study.donneesBobinage?.primaire?.epaisseurCanalRefroidissement || '',
            nbreCanalPrimaireMT: study.moyenneTension?.nbreDeCanalPrimaire || study.donneesBobinage?.primaire?.nbreCanalRefroidissementMT || '',
            typeConducteurMT: study.moyenneTension?.typeConducteur || study.donneesBobinage?.primaire?.typeConducteur || '',
            resistanceConnectionMT: study.moyenneTension?.resistanceConnection || study.moyenneTension?.resistanceConnectionMT || '',
            nbreCoucheMT: study.donneesBobinage?.primaire?.nbreCoucheMT || '',
            nbreSpireParCoucheMT: study.donneesBobinage?.primaire?.nbreSpireParCouche || '',
            epaisseurPapierIsolantMT: study.moyenneTension?.epaisseurIsolantEntreCouche || study.donneesBobinage?.primaire?.epaisseurPapierIsolant || '',
            hauteurBobineMT: study.donneesBobinage?.primaire?.hauteurBobine || study.moyenneTension?.hauteurBobine || '',
            largeurCanalMT: study.moyenneTension?.largeurCanal || study.donneesBobinage?.primaire?.largeurCanal || '',
            largeurCanalBT: study.donneesBobinage?.secondaire?.largeurCanal || '',
            hauteurBobineBT: study.donneesBobinage?.secondaire?.hauteurBobine || study.basseTension?.hauteurBobine || '',
            cerceauMT: study.moyenneTension?.cerceau || study.donneesBobinage?.primaire?.cerceau || '',
            cerceauPartieLongBT: study.donneesBobinage?.secondaire?.cerceauLong || study.donneesBobinage?.secondaire?.cerceauPartieLongBT || '',
            cerceauPartieCourtBT: study.basseTension?.cerceauPartieCourt || study.donneesBobinage?.secondaire?.cerceauCourt || '',
            epaisseurIsolantConducteurMT: study.moyenneTension?.epaisseurIsolantConducteur || study.donneesBobinage?.primaire?.epaisseurIsolantConducteur || '0,1',
            epaisseurTotaleCanaleInternePrimaire: study.moyenneTension?.epaisseurTotaleCanaleInternePrimaire || study.donneesBobinage?.primaire?.epaisseurCanaleSecondairePrimaire || '',
            epaisseurRadialePrimaire: study.moyenneTension?.epaisseurRadialePrimaire || '',
            majorationPo: study.circuitMagnetique?.majorationPo || params.majorationPo || study.cuveEtRefroidissement?.majorationPo?.replace('%', '') || '20',
            donneesCM4C: study.donneesCM4C?.rows || study.donneesCM4C || [],
            pertePoEfficace: params.pertePoEfficace || '', section: params.section || '', induction: params.induction || '',
            tempInitial: study.donneesTransfo?.tempInitial || '', tempReference: study.donneesTransfo?.tempReference || '',
            resAluTemp: study.donneesTransfo?.resAluTemp || '', resCuivreTemp: study.donneesTransfo?.resCuivreTemp || '',
            resSecondaire: study.donneesTransfo?.resSecondaire || '', resPrimaire: study.donneesTransfo?.resPrimaire || '',
            variation: study.donneesTransfo?.variation || '2,5', nbreVariation: study.donneesTransfo?.nbreVariation || '5',
            variationTexte: study.donneesTransfo?.variationTexte || '+/- 2 x 2,5 %',
            numCoucheInsertionCanalBT: study.donneesBobinage?.secondaire?.numCoucheInsertionCanalBT || '',
            numCoucheInsertionCanalBT2: study.donneesBobinage?.secondaire?.numCoucheInsertionCanalBT2 || '',
            hauteurCuve: study.cuveEtRefroidissement?.hauteurCuve || '',
            longueurCuve: study.cuveEtRefroidissement?.longueurCuve || '',
            largeurCuve: study.cuveEtRefroidissement?.largeurCuve || '',
            corniereCuve: study.cuveEtRefroidissement?.corniereCuve || '',
            hauteurOnde: study.cuveEtRefroidissement?.hauteurOnde || '',
            largeurPartieLong: study.cuveEtRefroidissement?.largeurPartieLong || '',
            largeurPartieCourt: study.cuveEtRefroidissement?.largeurPartieCourt || '',
            nbreOndePartieLong: study.cuveEtRefroidissement?.nbreOndePartieLong || '',
            nbreOndePartieCourt: study.cuveEtRefroidissement?.nbreOndePartieCourt || '',
            nbrePanneauLongue: study.cuveEtRefroidissement?.nbrePanneauLongue || '2',
            nbrePanneauCourt: study.cuveEtRefroidissement?.nbrePanneauCourt || '2',
            perteTotalCuve: study.cuveEtRefroidissement?.perteTotal || '',
            resAlu20: study.donneesTransfo?.resAlu20 || '', resCuivre20: study.donneesTransfo?.resCuivre20 || '',
            masseVolAlu: study.donneesTransfo?.masseVolAlu || '', masseVolCuivre: study.donneesTransfo?.masseVolCuivre || '',
            masseVolSecondaire: study.donneesTransfo?.masseVolSecondaire || '', masseVolPrimaire: study.donneesTransfo?.masseVolPrimaire || '',
            donneesThermique: study.donneesThermique || null,
            donneesCM4C: study.donneesCM4C?.rows || study.donneesCM4C || [],
            parametresCM: {
                ...params,
                semispessoreOval: params.semispessoreOval || study.circuitMagnetique?.semispessoreOval || '65'
            },
            donneesPerte: study.donneesPerte || initialPerte,
            donneesP0: study.donneesP0 || initialDonneesP0,
            donneesBobinage: study.donneesBobinage || initialDonneesBobinage,
            donneesUpn: study.donneesUpn || initialDonneesUpn,
            donneesCM4CComplementaire: study.donneesCM4CComplementaire || initialDonneesCM4CComplementaire,
            shapes: study.shapes || study.donneesTransfo?.shapes || initialShapes
        });
        setShowStudyList(false);
    }, []);

    // REAL-TIME SYNC FROM ETUDE: Listen for changes in sessionStorage
    useEffect(() => {
        const syncShapes = () => {
            const lastId = sessionStorage.getItem('last_active_study_id');
            const currentStudyId = etudeData.id || lastId;
            if (currentStudyId) {
                const synced = sessionStorage.getItem(`shapes_sync_${currentStudyId}`);
                if (synced && synced !== etudeData.shapes) {
                    setEtudeData(prev => ({ ...prev, shapes: synced }));
                }
            }
        };

        syncShapes();
        window.addEventListener('shapes_updated', syncShapes);
        window.addEventListener('storage', syncShapes); // Also listen for sessionStorage changes from other tabs
        return () => {
            window.removeEventListener('shapes_updated', syncShapes);
            window.removeEventListener('storage', syncShapes);
        };
    }, [etudeData.id, etudeData.shapes]);

    const handleBobinageChange = (section, field, value) => {
        setEtudeData(prev => {
            const newData = { ...prev };

            // Sync nested state
            newData.donneesBobinage = {
                ...newData.donneesBobinage,
                [section]: { ...newData.donneesBobinage[section], [field]: value }
            };

            // Sync top-level state for calculations
            if (section === 'secondaire') {
                if (field === 'nbreSpireBT') newData.spire = value;
                if (field === 'hauteurConducteur') newData.hauteurConducteur = value;
                if (field === 'epaisseurConducteur') newData.epessConducteur = value;
                if (field === 'nbreConducteur') newData.nbreConducteurBT = value;
                if (field === 'nbreCouche') newData.nbreCoucheBT = value;
                if (field === 'epaisseurPapierIsolant') {
                    newData.epaisseurIsolantConducteurBT = value;
                    const num = parseFloat(value.toString().replace(',', '.')) || 0;
                    newData.caleEntreSpireBT = (num / 10).toString();
                }
                if (field === 'caleEntreSpire') newData.caleEntreSpireBT = value;
                if (field === 'cerceauCourt') newData.cerceauPartieCourtBT = value;
                if (field === 'nbreCanalRefroidissementBT') newData.nbreCanalSecondaireBT = value;
                if (field === 'epaisseurCanalRefroidissement') newData.epaisseurDuCanalBT = value;
                if (field === 'hauteurBobine') newData.hauteurBobineBT = value;
            } else if (section === 'primaire') {
                if (field === 'diametre1erConducteur') newData.diametre1erConducteurMT = value;
                if (field === 'diametre2emeConducteur') newData.diametre2emeConducteurMT = value;
                if (field === 'epaisseurCanalRefroidissement') newData.epaisseurDuCanalMT = value;
                if (field === 'nbreCanalRefroidissementMT') newData.nbreCanalPrimaireMT = value;
                if (field === 'nbreCoucheMT') newData.nbreCoucheMT = value;
                if (field === 'epaisseurPapierIsolant') newData.epaisseurPapierIsolantMT = value;
                if (field === 'hauteurBobine') newData.hauteurBobineMT = value;
                if (field === 'cerceau') newData.cerceauMT = value;
                if (field === 'epaisseurIsolantConducteur') newData.epaisseurIsolantConducteurMT = value;
            }

            return newData;
        });
    };

    const handlePerteChange = (section, index, field, value) => {
        setEtudeData(prev => {
            const newData = { ...prev };
            const sectionData = [...newData.donneesPerte[section]];
            sectionData[index] = { ...sectionData[index], [field]: value };
            newData.donneesPerte = { ...newData.donneesPerte, [section]: sectionData };
            return newData;
        });
    };

    const handleP0Change = (section, index, field, value) => {
        setEtudeData(prev => {
            const newData = { ...prev };
            const newDonneesP0 = { ...newData.donneesP0 };
            if (section === 'observations') {
                newDonneesP0.observations = { ...newDonneesP0.observations, [field]: value };
            } else if (section === 'nbrePaquet') {
                newDonneesP0.observations.nbrePaquet = { ...newDonneesP0.observations.nbrePaquet, [field]: value };
            } else {
                const sectionData = [...newDonneesP0[section]];
                sectionData[index] = { ...sectionData[index], [field]: value };
                newDonneesP0[section] = sectionData;
            }
            newData.donneesP0 = newDonneesP0;
            return newData;
        });
    };

    const handleUpnChange = (e) => {
        const { name, value } = e.target;
        setEtudeData(prev => ({
            ...prev,
            donneesUpn: { ...prev.donneesUpn, [name]: value }
        }));
    };

    const loadStudies = useCallback(async () => {
        try {
            const resp = await getTransformerStudies();
            setSavedStudies(resp.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => {
        loadStudies();
        const sid = location.state?.studyId;
        if (sid) getTransformerStudyById(sid).then(r => handleLoadStudy(r.data)).catch(console.error);
    }, [location.state, loadStudies, handleLoadStudy]);

    return (
        <div id="bilan-print-root" className="bilan-container" style={{ padding: '0 20px 40px 20px', backgroundColor: '#f4f7f6', minHeight: '100vh', width: '100%' }}>
            <div className="bilan-header no-print">
                <h1 className="bilan-title">
                    <FaCalculator /> Bilan de Calcul
                    <span style={{ fontSize: '0.6em', color: '#ccc', marginLeft: '10px' }}>
                        ({etudeData.lieu || 'Tunis'} / {etudeData.typeConducteur || 'AL'} / {etudeData.version || 'V1'})
                    </span>
                </h1>
                <div className="bilan-actions">
                    <button className="bilan-btn btn-return" onClick={() => navigate(-1)}><FaArrowLeft /> Retour</button>
                    <button className="bilan-btn btn-load" onClick={() => setShowStudyList(!showStudyList)}><FaFolderOpen /> Charger Étude</button>
                    <button className="bilan-btn btn-load" onClick={() => setShowVisualizer(true)} style={{ backgroundColor: '#4c51bf' }}>
                        <FaEye /> Aperçu 3D
                    </button>
                    <button className="bilan-btn btn-export"><FaFileExport /> Exporter</button>
                    <button className="bilan-btn" onClick={() => (
                        activeTab === 'upn' ? printUpnPage() :
                            activeTab === 'cuve' ? printCuvePage() :
                                activeTab === 'p0' ? printP0Page() :
                                    activeTab === 'bobinageMT' ? printBobinageMTPage() :
                                        activeTab === 'bobinageBT' ? printBobinageBTPage() :
                                            window.print()
                    )} style={{ backgroundColor: '#2d3748', color: 'white' }}><FaPrint /> Imprimer</button>
                </div>
            </div>

            <div className="bilan-tabs no-print">
                <button className={`bilan-tab ${activeTab === 'generale' ? 'active' : ''}`} onClick={() => setActiveTab('generale')}><FaListAlt /> Générale</button>
                <button className={`bilan-tab ${activeTab === 'cm4c' ? 'active' : ''}`} onClick={() => setActiveTab('cm4c')}><FaListAlt /> CM-4C</button>
                <button className={`bilan-tab ${activeTab === 'thermique' ? 'active' : ''}`} onClick={() => setActiveTab('thermique')}><FaThermometerHalf /> Calcul Thermique</button>
                <button className={`bilan-tab ${activeTab === 'perte' ? 'active' : ''}`} onClick={() => setActiveTab('perte')}><FaListAlt /> Pertes</button>
                <button className={`bilan-tab ${activeTab === 'p0' ? 'active' : ''}`} onClick={() => setActiveTab('p0')}><FaListAlt /> P0</button>
                <button className={`bilan-tab ${activeTab === 'bobinageBT' ? 'active' : ''}`} onClick={() => setActiveTab('bobinageBT')}><FaListAlt /> Bobinage BT</button>
                <button className={`bilan-tab ${activeTab === 'bobinageMT' ? 'active' : ''}`} onClick={() => setActiveTab('bobinageMT')}><FaListAlt /> Bobinage MT</button>
                <button className={`bilan-tab ${activeTab === 'upn' ? 'active' : ''}`} onClick={() => setActiveTab('upn')}><FaListAlt /> UPN</button>
                <button className={`bilan-tab ${activeTab === 'cuve' ? 'active' : ''}`} onClick={() => setActiveTab('cuve')}><FaListAlt /> Cuve</button>
            </div>

            {showStudyList && (
                <div className="study-list-panel no-print">
                    <h3>Sélectionner une étude</h3>
                    {savedStudies.length === 0 ? <p>Aucune étude disponible</p> : (
                        <div className="study-list">
                            {savedStudies.map(s => <div key={s.id} className="study-item" onClick={() => handleLoadStudy(s)}><strong>{s.nomEtude}</strong><span>{new Date(s.updatedAt).toLocaleDateString()}</span></div>)}
                        </div>
                    )}
                </div>
            )}

            {selectedStudy && activeTab === 'generale' && (
                <div className="bilan-content">
                    <div className="bilan-grid">
                        <DonneesGenerales data={etudeData} calc={calculatedData} />
                        <DonneesDimensionnelles data={etudeData} calc={calculatedData} />
                    </div>
                    <div className="bilan-grid-bottom">
                        <SectionSecondaire data={etudeData} calc={calculatedData} />
                        <SectionPrimaire data={etudeData} calc={calculatedData} />
                    </div>
                    <div className="bilan-grid">
                        <SectionCuve data={etudeData} />
                        <SectionConstantes data={etudeData} />
                    </div>
                    <div className="bilan-full-width">
                        <LossComparisonTable data={etudeData} calc={calculatedData} />
                    </div>
                </div>
            )}

            {selectedStudy && activeTab === 'cm4c' && (
                <div className="bilan-content">
                    <SectionCM4C data={etudeData} calc={calculatedData} />
                </div>
            )}

            {selectedStudy && activeTab === 'thermique' && (
                <div className="bilan-content">
                    {etudeData.donneesThermique ? (
                        <div className="bilan-grid">
                            <BilanThermiqueTable title="TEMPÉRATURE SECONDAIRE" data={etudeData.donneesThermique.secondaire} regimeTemp={etudeData.donneesThermique.regimeTempSecondaire} />
                            <BilanThermiqueTable title="TEMPÉRATURE PRIMAIRE" data={etudeData.donneesThermique.primaire} regimeTemp={etudeData.donneesThermique.regimeTempPrimaire} />
                            <div style={{ gridColumn: 'span 2' }}>
                                <BilanThermiqueTable title="TEMPERATURA OLIO" data={etudeData.donneesThermique.huile} regimeTemp={etudeData.donneesThermique.regimeTempHuile} />
                            </div>
                        </div>
                    ) : <div className="bilan-empty-state"><FaThermometerHalf size={64} /><p>Données thermiques non disponibles</p></div>}
                </div>
            )}

            {selectedStudy && activeTab === 'perte' && (
                <div className="bilan-content">
                    <PerteTab donneesPerte={etudeData.donneesPerte} handlePerteChange={handlePerteChange} />
                </div>
            )}

            {selectedStudy && activeTab === 'p0' && (
                <div className="bilan-content" id="p0-print-content">
                    <P0Tab
                        donneesP0={etudeData.donneesP0}
                        handleP0Change={handleP0Change}
                        parametresCM={etudeData.parametresCM}
                        donneesCM4C={etudeData.donneesCM4C}
                        natureTole={etudeData.natureTole}
                        donneesTransfo={etudeData}
                        calculatedData={calculatedData}
                    />
                </div>
            )}

            {selectedStudy && activeTab === 'upn' && (
                <div className="bilan-content">
                    <div className="no-print">
                        <UpnTab
                            donneesUpn={etudeData.donneesUpn}
                            handleUpnChange={handleUpnChange}
                        />
                    </div>
                    <div className="upn-drawing-container" style={{ marginTop: '30px', backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ borderBottom: '2px solid #3182ce', paddingBottom: '10px', marginBottom: '20px' }}>Visualisation des Profils UPN</h3>
                        {(() => {
                            const FIXED_FALLBACK = [
                                { id: 'upn-inf', type: 'upn', label: 'UPN', subLabel: 'Inférieur', left: 200, middle: 731, total: 1131, diam: 10, mid_left: 20, mid_middle: 1014, l2: 90, m2a: 363, m2b: 324, m2c: 324, r2: 30, isManual: false },
                                { id: 'upn-sup', type: 'upn', label: 'UPN', subLabel: 'Supérieur', left: 200, middle: 731, total: 1131, diam: 10, mid_left: 20, mid_middle: 1014, p2_h: 60, isManual: false }
                            ];

                            let list = [];
                            try {
                                if (typeof etudeData.shapes === 'string' && etudeData.shapes.trim()) {
                                    const parsed = JSON.parse(etudeData.shapes);
                                    if (Array.isArray(parsed) && parsed.length > 0) {
                                        // Merge to ensure both exist even if old data
                                        list = FIXED_FALLBACK.map(f => {
                                            const saved = parsed.find(p => p.id === f.id);
                                            return saved ? { ...f, ...saved } : f;
                                        });
                                    } else if (etudeData.shapes.includes('<svg')) {
                                        list = [{ type: 'raw', svgText: etudeData.shapes }];
                                    }
                                }
                            } catch (e) {
                                if (typeof etudeData.shapes === 'string' && etudeData.shapes.includes('<svg')) {
                                    list = [{ type: 'raw', svgText: etudeData.shapes }];
                                }
                            }

                            if (list.length === 0) list = FIXED_FALLBACK;

                            return list.map((shape, idx) => (
                                <div key={idx} style={{ marginBottom: '50px', borderBottom: idx < (list.length - 1) ? '1px dashed #cbd5e0' : 'none', paddingBottom: '30px' }}>
                                    <div className="upn-shape-title" style={{ fontWeight: 'bold', color: '#1a202c', marginBottom: '20px', fontSize: '1.2rem', textTransform: 'uppercase', borderLeft: '5px solid #3182ce', paddingLeft: '12px' }}>
                                        {shape.label} {shape.subLabel}
                                    </div>
                                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '25px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'center' }}>
                                        {shape.type === 'raw' || shape.isManual ? (
                                            <div dangerouslySetInnerHTML={{ __html: shape.svgText }} style={{ width: '100%', maxWidth: '1000px' }} />
                                        ) : (
                                            <div style={{ width: '100%', maxWidth: '1000px' }}>
                                                <UPNProfileSVG {...shape} isTechnicalPlan={true}
                                                    p1_l={shape.left} p1_m={shape.middle} p1_diam={shape.diam}
                                                    p2_l={shape.mid_left} p2_m={shape.mid_middle} p2_h={shape.p2_h || 50}
                                                    p3_l={shape.l2} p3_m1={shape.m2a} p3_m2={shape.m2b} p3_m3={shape.m2c} p3_r={shape.r2}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                    <CartoucheUPN data={etudeData} />
                </div>
            )}

            {selectedStudy && activeTab === 'bobinageBT' && (
                <div className="bilan-content" id="bt-print-content">
                    <BobinageTab
                        donneesBobinage={etudeData.donneesBobinage}
                        handleBobinageChange={handleBobinageChange}
                        etudeData={etudeData}
                        isBilan={true}
                        isSimplifiedView={false}
                        onlyShow="BT"
                    />
                </div>
            )}

            {selectedStudy && activeTab === 'bobinageMT' && (
                <div className="bilan-content" id="mt-print-content">
                    <BobinageTab
                        donneesBobinage={etudeData.donneesBobinage}
                        handleBobinageChange={handleBobinageChange}
                        etudeData={etudeData}
                        isBilan={true}
                        isSimplifiedView={false}
                        onlyShow="MT"
                    />
                    <CartoucheBobinage data={etudeData} calc={calculatedData} />
                </div>
            )}

            {selectedStudy && activeTab === 'cuve' && (
                <div className="bilan-content" id="cuve-print-content" style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', minHeight: '600px' }}>

                    {(() => {
                        const targetIds = ['couvercle']; // Only showing the promoted view
                        const svgList = [];

                        try {
                            const shapesStr = etudeData?.shapes || '';
                            let savedShapes = [];
                            if (shapesStr.startsWith('[') || shapesStr.startsWith('{')) {
                                try {
                                    savedShapes = JSON.parse(shapesStr);
                                    if (!Array.isArray(savedShapes)) savedShapes = [];
                                } catch (e) { }
                            }

                            targetIds.forEach(id => {
                                let foundSVG = '';
                                // 1. Try saved
                                const saved = savedShapes.find(s => s.id === id);
                                if (saved && saved.svgText) foundSVG = saved.svgText;

                                // 2. Predefined fallback
                                if (!foundSVG) {
                                    const fixed = FIXED_SHAPES.find(s => s.id === id);
                                    if (fixed && fixed.svgText) foundSVG = fixed.svgText;
                                }

                                if (foundSVG) {
                                    const hCuve = etudeData?.hauteurCuve;
                                    const hOnde = etudeData?.hauteurOnde;
                                    const longueurCuve = etudeData?.longueurCuve;
                                    const largeurCuve = etudeData?.largeurCuve;
                                    let syncedSVG = foundSVG;

                                    // Keep cuve drawing dimensions in sync with General tab values.
                                    if (hCuve !== undefined && hCuve !== null && String(hCuve).trim() !== '') {
                                        syncedSVG = syncedSVG.replace(
                                            /(<tspan[^>]*id="tspan18"[^>]*>)\s*[^<]*\s*(<\/tspan>)/g,
                                            `$1${hCuve}$2`
                                        );
                                    }

                                    if (hOnde !== undefined && hOnde !== null && String(hOnde).trim() !== '') {
                                        syncedSVG = syncedSVG.replace(
                                            /(<tspan[^>]*id="tspan19"[^>]*>)\s*[^<]*\s*(<\/tspan>)/g,
                                            `$1${hOnde}$2`
                                        );
                                    }

                                    // Replace base 960 dimension (tspan1) with LONGUEUR CUVE + 30
                                    if (longueurCuve !== undefined && longueurCuve !== null && String(longueurCuve).trim() !== '') {
                                        const lValue = Number(longueurCuve);
                                        if (!Number.isNaN(lValue)) {
                                            const dim960 = (lValue + 30).toFixed(0);
                                            syncedSVG = syncedSVG.replace(
                                                /(<tspan[^>]*id="tspan1"[^>]*>)\s*[^<]*\s*(<\/tspan>)/g,
                                                `$1${dim960}$2`
                                            );
                                        }
                                    }

                                    // Replace base 460 dimension (tspan11) with LARGEUR CUVE
                                    if (largeurCuve !== undefined && largeurCuve !== null && String(largeurCuve).trim() !== '') {
                                        const wValue = Number(largeurCuve);
                                        if (!Number.isNaN(wValue)) {
                                            const dim460 = wValue.toFixed(0);
                                            syncedSVG = syncedSVG.replace(
                                                /(<tspan[^>]*id="tspan11"[^>]*>)\s*[^<]*\s*(<\/tspan>)/g,
                                                `$1${dim460}$2`
                                            );
                                        }
                                    }

                                    svgList.push({
                                        id,
                                        label: 'Vue principale Cuve',
                                        svgText: syncedSVG
                                    });
                                }
                            });
                        } catch (e) {
                            console.error("Error fetching cuve SVGs", e);
                        }

                        if (svgList.length === 0) {
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', backgroundColor: '#f7fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                    <FaListAlt size={48} style={{ color: '#cbd5e0', marginBottom: '10px' }} />
                                    <p style={{ color: '#718096' }}>Aucun plan de forme trouvé pour la cuve.</p>
                                </div>
                            );
                        }

                        return svgList.map((item, idx) => (
                            <div key={item.id} className="print-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: idx < (svgList.length - 1) ? '80px' : '0', borderBottom: idx < (svgList.length - 1) ? '2px dashed #e2e8f0' : 'none', paddingBottom: idx < (svgList.length - 1) ? '40px' : '0' }}>
                                <h4 style={{ alignSelf: 'flex-start', color: '#4a5568', marginBottom: '15px', borderLeft: '4px solid #3182ce', paddingLeft: '10px' }}>{item.label}</h4>
                                <div
                                    style={{
                                        width: '100%',
                                        maxWidth: '1000px',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                                        border: '1px solid #edf2f7',
                                        padding: '20px',
                                        marginBottom: '30px',
                                        overflow: 'hidden',
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: item.svgText }}
                                />
                                <CartoucheBobinage data={etudeData} calc={calculatedData} title="PLAN CUVE" />
                            </div>
                        ));
                    })()}
                </div>
            )}

            {!selectedStudy && <div className="bilan-empty-state"><FaCalculator size={64} /><p>Veuillez charger une étude</p></div>}

            <VisualizerModal
                isOpen={showVisualizer}
                onClose={() => setShowVisualizer(false)}
                L={etudeData.parametresCM?.L}
                b1={etudeData.donneesCM4C?.[0]?.b}
                A={etudeData.parametresCM?.A}
                B={etudeData.parametresCM?.B}
            />
        </div>
    );
};

export default BilanPage;
