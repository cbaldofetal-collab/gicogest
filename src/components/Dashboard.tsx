import { useGlucose } from '../hooks/useGlucose';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { TrendChart } from './Charts/TrendChart';
import { TimeChart } from './Charts/TimeChart';
import { PieChart } from './Charts/PieChart';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { Activity, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Componente para verificar se está usando dados locais
function LocalDataWarning() {
  const [isUsingLocal, setIsUsingLocal] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        // Se não houver sessão E Supabase estiver configurado, está usando local
        const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
        setIsUsingLocal(isSupabaseConfigured && !session);
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setIsUsingLocal(false);
      } finally {
        setChecking(false);
      }
    }
    
    checkSession();
  }, []);

  if (checking || !isUsingLocal) {
    return null;
  }

  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
      <p className="text-sm text-yellow-800">
        ⚠️ <strong>Atenção:</strong> Você está usando dados locais. 
        Faça login novamente para sincronizar com o Supabase.
      </p>
    </div>
  );
}

export function Dashboard() {
  const { readings, loading, getStats, loadReadings, error } = useGlucose();
  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('Dashboard: Forçando recarregamento');
            loadReadings();
          }}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="p-4 bg-danger-50 border border-danger-200 rounded-md">
          <p className="text-sm text-danger-800">
            Erro ao carregar dados: {error.message}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={loadReadings}
            className="mt-2"
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Aviso se não houver sessão mas houver dados locais */}
      {import.meta.env.DEV && <LocalDataWarning />}

      {/* Info rápida de debug */}
      {import.meta.env.DEV && (
        <div className="p-2 bg-gray-100 rounded text-xs">
          <strong>Status:</strong> {readings.length} registros | 
          Loading: {loading ? 'Sim' : 'Não'} | 
          Erro: {error ? error.message : 'Nenhum'}
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medições na Meta</CardTitle>
            <Activity className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(stats.percentageInTarget)}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.normalReadings} de {stats.totalReadings} medições
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(stats.averageValue)}</div>
            <p className="text-xs text-gray-500 mt-1">mg/dL</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Glicemias Alteradas</CardTitle>
            <AlertCircle className="h-4 w-4 text-danger-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-danger-600">
              {stats.totalReadings > 0
                ? Math.round((stats.abnormalReadings / stats.totalReadings) * 100)
                : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.abnormalReadings} de {stats.totalReadings} medições
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Glicemias</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart stats={stats} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendência de Glicemia</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart readings={readings} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Análise por Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <TimeChart stats={stats} />
          </CardContent>
        </Card>
      </div>

      {/* Registros Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Registros Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {readings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum registro ainda. Adicione sua primeira medição!
            </p>
          ) : (
            <div className="space-y-2">
              {readings.slice(0, 10).map((reading) => (
                <div
                  key={reading.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{reading.value} mg/dL</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          reading.isNormal
                            ? 'bg-success-100 text-success-800'
                            : 'bg-danger-100 text-danger-800'
                        }`}
                      >
                        {reading.isNormal ? 'Normal' : 'Alterado'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {reading.type} •{' '}
                      {format(new Date(reading.date), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

