import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportReportToPDF(elementId: string, title: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Element not found for PDF export:", elementId);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // improve quality
      useCORS: true,
      backgroundColor: "#050308",
    });

    const imgData = canvas.toDataURL("image/png");
    
    // Create PDF with margins
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190; // Page width - margins
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 10; // offset top

    // Title Block
    pdf.setFillColor(15, 10, 26);
    pdf.rect(0, 0, 210, 25, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(title, 10, 16);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, 140, 16);

    // Render screenshot content
    pdf.addImage(imgData, "PNG", 10, 30, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `${title.toLowerCase().replace(/\s+/g, "_")}_report.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
  }
}
