import { useGlucose } from '../hooks/useGlucose';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileDown } from 'lucide-react';
import { generatePDF } from '../lib/pdf-generator';
import { useState } from 'react';

export function ReportGenerator() {
  const { readings, getStats } = useGlucose();
  const [generating, setGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    if (readings.length === 0) {
      alert('Não há registros para gerar o relatório.');
      return;
    }

    try {
      setGenerating(true);
      const stats = getStats();
      await generatePDF(readings, stats);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relatório PDF</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Gere um relatório completo em PDF com todos os seus registros de glicemia,
          incluindo gráficos, estatísticas e análise detalhada.
        </p>
        <Button
          onClick={handleGeneratePDF}
          disabled={generating || readings.length === 0}
          className="w-full"
        >
          <FileDown className="mr-2 h-4 w-4" />
          {generating ? 'Gerando PDF...' : 'Gerar Relatório PDF'}
        </Button>
        {readings.length === 0 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Adicione pelo menos um registro para gerar o relatório
          </p>
        )}
      </CardContent>
    </Card>
  );
}



