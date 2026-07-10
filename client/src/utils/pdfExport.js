import jsPDF from 'jspdf';
import { formatDateTime } from './formatters';

export const exportReportPDF = (report, aiAnalysis) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Header background
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Title
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SafeGuard AI', margin, 18);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Emergency Incident Report', margin, 28);

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.text(`Generated: ${formatDateTime(new Date())}`, pageWidth - margin - 60, 18);
  doc.text(`Report ID: ${report._id || 'DEMO-' + Date.now()}`, pageWidth - margin - 60, 25);

  y = 50;

  const addSection = (title, content) => {
    doc.setFillColor(17, 24, 39);
    doc.roundedRect(margin, y - 4, pageWidth - margin * 2, 8, 1, 1, 'F');
    doc.setTextColor(59, 130, 246);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 2, y + 1);
    y += 10;

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    if (typeof content === 'string') {
      const lines = doc.splitTextToSize(content, pageWidth - margin * 2 - 4);
      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, margin + 2, y);
        y += 5;
      });
    } else if (Array.isArray(content)) {
      content.forEach((item, i) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const lines = doc.splitTextToSize(`${i + 1}. ${item}`, pageWidth - margin * 2 - 8);
        lines.forEach(line => {
          doc.text(line, margin + 4, y);
          y += 5;
        });
      });
    }
    y += 5;
  };

  // Incident Details
  addSection('INCIDENT DETAILS', [
    `Type: ${report.incidentType || 'Emergency'}`,
    `Severity: ${(report.severity || 'medium').toUpperCase()}`,
    `Time: ${formatDateTime(report.time)}`,
    `Location: ${report.location?.address || `${report.location?.lat || 'N/A'}, ${report.location?.lng || 'N/A'}`}`,
    `Affected Persons: ${report.affectedPersons || 1}`,
    `Status: ${report.status || 'Generated'}`,
  ]);

  if (aiAnalysis?.executiveSummary) {
    addSection('EXECUTIVE SUMMARY', aiAnalysis.executiveSummary);
  }

  if (aiAnalysis?.incidentAnalysis) {
    addSection('INCIDENT ANALYSIS', aiAnalysis.incidentAnalysis);
  }

  if (report.recommendedActions?.length || aiAnalysis?.recommendedActions?.length) {
    addSection('RECOMMENDED ACTIONS', report.recommendedActions || aiAnalysis.recommendedActions || []);
  }

  if (aiAnalysis?.preventionMeasures?.length) {
    addSection('PREVENTION MEASURES', aiAnalysis.preventionMeasures);
  }

  if (aiAnalysis?.conclusionNotes) {
    addSection('CONCLUSION', aiAnalysis.conclusionNotes);
  }

  // Timeline
  if (report.timeline?.length) {
    addSection('RESPONSE TIMELINE', report.timeline.map(t => `${formatDateTime(t.timestamp)}: ${t.step}`));
  }

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 285, pageWidth, 12, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('SafeGuard AI — Intelligent Emergency Response Platform | Confidential', margin, 292);
    doc.text(`Page ${i} of ${pages}`, pageWidth - margin - 20, 292);
  }

  doc.save(`SafeGuard_Report_${Date.now()}.pdf`);
};
