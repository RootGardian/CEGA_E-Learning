import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to a CSV file and trigger download
 * @param data Array of objects to export
 * @param filename Name of the downloaded file
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) return;

  const separator = ';'; // Utilisation du point-virgule pour Excel (français)
  const keys = Object.keys(data[0]);

  const csvContent =
    keys.join(separator) +
    '\n' +
    data.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = String(cell).replace(/"/g, '""');
        if (cell.search(/("|,|;|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      }).join(separator);
    }).join('\n');

  // Ajout du BOM (\uFEFF) pour forcer Excel à lire en UTF-8
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Export data to a PDF file and trigger download
 * @param headers Array of column headers
 * @param data Array of arrays representing rows
 * @param filename Name of the downloaded file
 * @param title Title of the PDF document
 */
export const exportToPDF = (headers: string[], data: any[][], filename: string, title: string = 'Rapport') => {
  try {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);

    // Add date
    const dateStr = new Date().toLocaleDateString('fr-FR');
    doc.text(`Généré le: ${dateStr}`, 14, 30);

    // Use autoTable function explicitly
    autoTable(doc, {
      startY: 36,
      head: [headers],
      body: data,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue matching our primary color
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });

    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
  }
};
