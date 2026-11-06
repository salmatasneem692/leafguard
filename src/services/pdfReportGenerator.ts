import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PredictionResult } from '../types/index.ts';

export async function generateAcademicPdfReport(result: PredictionResult): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  // Colors
  const primaryColor: [number, number, number] = [5, 122, 85]; // Emerald-700
  const darkTextColor: [number, number, number] = [30, 41, 59]; // Slate-800
  const mutedTextColor: [number, number, number] = [100, 116, 139]; // Slate-500
  const headerBgColor: [number, number, number] = [241, 245, 249]; // Slate-100

  // 1. Top Decorative Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 8, 'F');

  cursorY = 16;

  // Header Titles
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text('LeafGuard AI · Diagnostic & Botanical Report', margin, cursorY);

  cursorY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedTextColor);
  doc.text(
    'Department of Electronics and Communication Engineering · Academic Major Project (2026)',
    margin,
    cursorY
  );

  // Top right metadata
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.setFontSize(8);
  doc.text(`Report Date: ${dateStr}`, pageWidth - margin, cursorY - 5, { align: 'right' });
  doc.text(`Time: ${result.timestamp} | Latency: ${result.inferenceTimeMs}ms`, pageWidth - margin, cursorY, {
    align: 'right',
  });

  cursorY += 6;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 5;

  // 2. Specimen & Inference Metadata Card
  const modeText = result.isDemoMode
    ? 'Demo Mode (Simulated Inference / Client Preprocessing)'
    : 'Verified Keras Transfer Learning (MobileNetV2)';

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 8.5,
      cellPadding: 2,
      textColor: darkTextColor,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 38, textColor: primaryColor },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 38, textColor: primaryColor },
      3: { cellWidth: 55 },
    },
    body: [
      [
        'Inference Mode:',
        modeText,
        'Input Tensor Shape:',
        '224 × 224 × 3 (RGB, [-1.0, 1.0])',
      ],
      [
        'Excess Green Index (ExG):',
        `${result.preprocessing.greenIndex > 0 ? '+' : ''}${result.preprocessing.greenIndex} (Vegetation Validated)`,
        'Sharpness Metric:',
        `${result.preprocessing.blurScore} / 100 (Laplacian Variance)`,
      ],
    ],
  });

  cursorY = (doc as any).lastAutoTable.finalY + 5;

  // 3. Dual Classification Results Table (Module 1 & Module 2)
  const isHealthy = result.health.status === 'healthy';

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['Module 1: Plant Species Identification', 'Module 2: Foliar Health & Pathology']],
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5,
      cellPadding: 3,
    },
    body: [
      [
        `Identified Species: ${result.species.name}\n` +
          `Scientific Name: ${result.species.scientificName}\n` +
          `Family: ${result.medicinalInfo.family}\n` +
          `Species Confidence: ${result.species.confidence.toFixed(1)}%`,
        `Leaf Health: ${isHealthy ? 'HEALTHY' : 'DISEASED'}\n` +
          `Health Confidence: ${result.health.confidence.toFixed(1)}%\n` +
          `Detected Condition: ${result.health.diseaseName || 'None (Normal Foliar Vigor)'}\n` +
          `Pathogen Classification: ${result.health.pathogenType || 'None'} (Severity: ${
            result.health.severity || 'Normal'
          })`,
      ],
    ],
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: darkTextColor,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    theme: 'grid',
  });

  cursorY = (doc as any).lastAutoTable.finalY + 5;

  // 4. Softmax Probability Distribution (All 6 Classes)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('Module 1 · MobileNetV2 Softmax Class Probability Distribution', margin, cursorY);
  cursorY += 2;

  const probRows = result.species.probabilities.map((item, idx) => [
    `#${idx + 1}`,
    item.name,
    item.scientificName,
    `${item.probability.toFixed(1)}%`,
    item.id === result.species.plantId ? 'Top-1 Prediction (Identified)' : 'Alternative Class',
  ]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    head: [['Rank', 'Medicinal Class', 'Scientific Name', 'Softmax Probability', 'Result Status']],
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2,
    },
    body: probRows,
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: darkTextColor,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    theme: 'striped',
  });

  cursorY = (doc as any).lastAutoTable.finalY + 5;

  // 5. Observed Symptoms & Agricultural Recommendations Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text('Module 2 · Agricultural & Foliar Management Recommendations', margin, cursorY);
  cursorY += 2;

  const recList = result.health.recommendations || ['Maintain standard irrigation and sunlight schedule.'];
  const recTableBody = recList.map((rec, i) => [`${i + 1}.`, rec]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    body: recTableBody,
    columnStyles: {
      0: { cellWidth: 8, fontStyle: 'bold', textColor: primaryColor },
      1: { cellWidth: contentWidth - 8 },
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: darkTextColor,
    },
    theme: 'plain',
  });

  cursorY = (doc as any).lastAutoTable.finalY + 5;

  // Check if we need to add a page or continue for Medicinal Information
  if (cursorY > pageHeight - 75) {
    doc.addPage();
    cursorY = margin + 4;
  }

  // 6. Module 3: Medicinal Profile & Pharmacology Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text(`Module 3 · Comprehensive Medicinal Profile (${result.medicinalInfo.name})`, margin, cursorY);
  cursorY += 4;

  const plant = result.medicinalInfo;

  // Table of Ayurvedic & Phytochemical Traits
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['Ayurvedic Energetics (Dravya Guna)', 'Key Phytochemical Markers']],
    headStyles: {
      fillColor: [15, 118, 110], // Teal-700
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    body: [
      [
        `Rasa (Taste): ${plant.ayurvedicQualities.rasa || 'N/A'}\n` +
          `Virya (Potency): ${plant.ayurvedicQualities.virya || 'N/A'}\n` +
          `Vipaka: ${plant.ayurvedicQualities.vipaka || 'N/A'}\n` +
          `Dosha Action: ${plant.ayurvedicQualities.doshaEffect || 'N/A'}`,
        plant.activePhytochemicals.map((chem) => `• ${chem}`).join('\n'),
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: darkTextColor,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 4;

  // Primary Medicinal Uses & Precautions Table
  autoTable(doc, {
    startY: cursorY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['Primary Medicinal Applications', 'Precautions & Contraindications']],
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    body: [
      [
        plant.primaryMedicinalUses.map((u) => `• ${u}`).join('\n\n'),
        plant.precautionsAndWarnings.map((p) => `⚠ ${p}`).join('\n\n'),
      ],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: darkTextColor,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 6;

  // 7. Academic Verification & Project Disclaimer
  if (cursorY > pageHeight - 32) {
    doc.addPage();
    cursorY = margin + 4;
  }

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, cursorY, contentWidth, 18, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkTextColor);
  doc.text('ACADEMIC PROJECT DISCLAIMER & RECORD-KEEPING NOTICE:', margin + 3, cursorY + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...mutedTextColor);
  const disclaimer =
    'This document is generated by LeafGuard AI as part of an Electronics & Communication Engineering (ECE) major project on computer vision in precision agriculture. Identification and health scores reflect MobileNetV2 deep learning inference. Medicinal details are educational references and do not constitute clinical or prescriptive medical advice.';
  doc.text(doc.splitTextToSize(disclaimer, contentWidth - 6), margin + 3, cursorY + 8);

  cursorY += 24;

  // Evaluator / Student signature block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...darkTextColor);
  doc.line(margin, cursorY, margin + 50, cursorY);
  doc.text('Student / Researcher Signature', margin, cursorY + 4);

  doc.line(pageWidth - margin - 50, cursorY, pageWidth - margin, cursorY);
  doc.text('Academic Evaluator / Guide Signature', pageWidth - margin - 50, cursorY + 4);

  // Save the PDF
  const filename = `LeafGuard_AI_Report_${result.species.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
  doc.save(filename);
}
