import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

export function DebugPanel() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setResults((prev) => [...prev, `${icon} ${message}`]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setTesting(true);
    addResult('Iniciando diagnóstico...', 'info');

    try {
      // 1. Verificar configuração
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!url || !key) {
        addResult('❌ Supabase NÃO configurado! Verifique o arquivo .env', 'error');
        setTesting(false);
        return;
      }
      addResult(`✅ Supabase configurado: ${url}`, 'success');

      // 2. Verificar autenticação
      // Verificar localStorage primeiro
      const storedAuth = localStorage.getItem('glicogest-auth');
      if (storedAuth) {
        addResult(`ℹ️ Sessão encontrada no localStorage`, 'info');
      } else {
        addResult(`⚠️ Nenhuma sessão encontrada no localStorage`, 'error');
      }
      
      // Tentar getSession primeiro
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        addResult(`❌ Erro ao obter sessão: ${sessionError.message}`, 'error');
      }

      let user = session?.user || undefined;

      // Se não tiver sessão, tentar getUser
      if (!user) {
        addResult(`ℹ️ Tentando getUser() como fallback...`, 'info');
        const {
          data: { user: userData },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          addResult(`❌ Erro ao verificar usuário: ${userError.message}`, 'error');
          addResult('💡 Solução: Faça logout e login novamente', 'info');
          addResult(`💡 Verifique o console do navegador para mais detalhes`, 'info');
          setTesting(false);
          return;
        }

        user = userData || undefined;
      }

      if (!user) {
        addResult('❌ Usuário NÃO autenticado! Faça login novamente.', 'error');
        addResult('💡 Solução: Vá em Configurações → Sair, depois faça login novamente', 'info');
        addResult(`💡 Dica: Verifique se os cookies/localStorage estão habilitados no navegador`, 'info');
        setTesting(false);
        return;
      }
      addResult(`✅ Usuário autenticado: ${user.email} (ID: ${user.id})`, 'success');

      // 3. Verificar perfil
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          addResult('⚠️ Perfil não encontrado na tabela users', 'error');
        } else {
          addResult(`❌ Erro ao buscar perfil: ${profileError.message}`, 'error');
        }
      } else {
        addResult(`✅ Perfil encontrado: ${profile.name}`, 'success');
      }

      // 4. Testar SELECT (ler dados)
      const { data: readings, error: selectError } = await supabase
        .from('glucose_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (selectError) {
        addResult(`❌ Erro ao ler registros: ${selectError.message} (Código: ${selectError.code})`, 'error');
        if (selectError.code === '42501') {
          addResult('⚠️ Problema: Política RLS bloqueando leitura. Verifique as políticas no Supabase.', 'error');
        }
      } else {
        addResult(`✅ Leitura OK: ${readings?.length || 0} registros encontrados`, 'success');
        if (readings && readings.length > 0) {
          addResult(`   Último registro: ${readings[0].value} mg/dL em ${new Date(readings[0].date).toLocaleDateString('pt-BR')}`, 'info');
        }
      }

      // 5. Testar INSERT (escrever dados)
      const testReading = {
        user_id: user.id,
        value: 95,
        type: 'JEJUM',
        date: new Date().toISOString(),
        is_normal: true,
        notes: 'Teste de diagnóstico',
      };

      const { data: inserted, error: insertError } = await supabase
        .from('glucose_readings')
        .insert(testReading)
        .select('id')
        .single();

      if (insertError) {
        addResult(`❌ Erro ao INSERIR registro: ${insertError.message} (Código: ${insertError.code})`, 'error');
        if (insertError.code === '42501') {
          addResult('⚠️ Problema: Política RLS bloqueando inserção. Verifique as políticas no Supabase.', 'error');
        }
      } else {
        addResult(`✅ Inserção OK: Registro criado com ID ${inserted.id}`, 'success');
        
        // Deletar o registro de teste
        await supabase
          .from('glucose_readings')
          .delete()
          .eq('id', inserted.id);
        addResult('🧹 Registro de teste removido', 'info');
      }

      // 6. Resumo
      addResult('', 'info');
      addResult('=== RESUMO ===', 'info');
      if (readings && readings.length > 0) {
        addResult(`✅ Tudo funcionando! Você tem ${readings.length} registro(s) no banco.`, 'success');
      } else {
        addResult('⚠️ Nenhum registro encontrado. Tente adicionar um registro no app.', 'info');
      }
    } catch (error) {
      addResult(`❌ Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
      console.error('Erro no diagnóstico:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600" />
          Painel de Diagnóstico
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runDiagnostics}
          disabled={testing}
          className="w-full"
          variant="outline"
        >
          {testing ? 'Testando...' : '🔍 Executar Diagnóstico Completo'}
        </Button>

        {results.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
            <div className="space-y-1 text-sm font-mono">
              {results.map((result, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>Este painel testa:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Configuração do Supabase</li>
            <li>Autenticação do usuário</li>
            <li>Leitura de dados (SELECT)</li>
            <li>Escrita de dados (INSERT)</li>
            <li>Políticas de segurança (RLS)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

