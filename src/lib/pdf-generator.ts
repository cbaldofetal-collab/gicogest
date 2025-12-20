import jsPDF from 'jspdf';
import type { GlucoseReading, GlucoseStats } from '../types/glucose';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { GLUCOSE_REFERENCE_VALUES } from '../utils/constants';

export async function generatePDF(
  readings: GlucoseReading[],
  stats: GlucoseStats,
  patientName: string = 'Paciente'
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(14, 165, 233); // primary-600
  doc.text('GlicoGest - Relatório de Glicemia', margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Paciente: ${patientName || 'Paciente'}`, margin, yPosition);
  yPosition += 7;

  const dateRange =
    readings.length > 0
      ? `${format(new Date(readings[readings.length - 1]?.date || new Date()), 'dd/MM/yyyy', {
          locale: ptBR,
        })} a ${format(new Date(readings[0]?.date || new Date()), 'dd/MM/yyyy', { locale: ptBR })}`
      : 'N/A';
  doc.text(`Período: ${dateRange}`, margin, yPosition);
  yPosition += 15;

  // Resumo Estatístico
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Estatístico', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de medições: ${stats.totalReadings}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Medições na meta: ${stats.normalReadings} (${Math.round(stats.percentageInTarget || 0)}%)`, margin, yPosition);
  yPosition += 6;
  doc.text(`Medições fora da meta: ${stats.abnormalReadings}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Média geral: ${Math.round(stats.averageValue || 0)} mg/dL`, margin, yPosition);
  yPosition += 6;
  doc.text(`Menor valor: ${stats.minValue || 0} mg/dL`, margin, yPosition);
  yPosition += 6;
  doc.text(`Maior valor: ${stats.maxValue || 0} mg/dL`, margin, yPosition);
  yPosition += 10;

  // Análise por Horário
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Análise por Horário', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  Object.entries(stats.byType).forEach(([type, typeStats]) => {
    const label = GLUCOSE_REFERENCE_VALUES[type as keyof typeof GLUCOSE_REFERENCE_VALUES].label;
    doc.text(
      `${label}: ${typeStats.normal}/${typeStats.total} na meta (${Math.round(typeStats.percentageNormal)}%)`,
      margin,
      yPosition
    );
    yPosition += 6;
  });

  yPosition += 10;

  // Tabela de Registros
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Registros Detalhados', margin, yPosition);
  yPosition += 8;

  // Cabeçalho da tabela
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const colWidths = [25, 40, 50, 35, 30];
  const headers = ['Data', 'Hora', 'Tipo', 'Valor', 'Status'];
  let xPos = margin;
  headers.forEach((header, index) => {
    doc.text(header, xPos, yPosition);
    xPos += colWidths[index];
  });
  yPosition += 6;

  // Linhas da tabela
  doc.setFont('helvetica', 'normal');
  readings.forEach((reading) => {
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = margin;
      // Reimprimir cabeçalho
      doc.setFont('helvetica', 'bold');
      xPos = margin;
      headers.forEach((header, index) => {
        doc.text(header, xPos, yPosition);
        xPos += colWidths[index];
      });
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
    }

    const date = new Date(reading.date);
    const dateStr = format(date, 'dd/MM/yyyy', { locale: ptBR });
    const timeStr = format(date, 'HH:mm', { locale: ptBR });
    const typeLabel =
      GLUCOSE_REFERENCE_VALUES[reading.type as keyof typeof GLUCOSE_REFERENCE_VALUES].label;
    const status = reading.isNormal ? 'Normal' : 'Alterado';

    xPos = margin;
    doc.text(dateStr, xPos, yPosition);
    xPos += colWidths[0];
    doc.text(timeStr, xPos, yPosition);
    xPos += colWidths[1];
    doc.text(typeLabel, xPos, yPosition);
    xPos += colWidths[2];
    doc.text(`${reading.value} mg/dL`, xPos, yPosition);
    xPos += colWidths[3];
    if (reading.isNormal) {
      doc.setTextColor(34, 197, 94);
    } else {
      doc.setTextColor(239, 68, 68);
    }
    doc.text(status, xPos, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 6;
  });

  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `GlicoGest - Relatório gerado em ${format(new Date(), 'dd/MM/yyyy às HH:mm', {
        locale: ptBR,
      })}`,
      margin,
      pageHeight - 10
    );
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Download
  doc.save(`glicogest-relatorio-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

