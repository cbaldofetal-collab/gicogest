# Guia de Debug - Problemas ao Salvar Dados

## 🔍 Verificações Rápidas

### 1. Verificar Console do Navegador
1. Abra o app no navegador
2. Pressione **F12** (ou clique com botão direito → Inspecionar)
3. Vá na aba **Console**
4. Tente adicionar um registro
5. Veja se aparecem erros em vermelho

### 2. Verificar Autenticação
1. No console do navegador, digite:
```javascript
localStorage.getItem('sb-xlwholcjpfahxgzbxhsu-auth-token')
```
2. Se retornar `null`, você não está autenticado
3. Faça logout e login novamente

### 3. Verificar Supabase
1. Acesse: https://app.supabase.com
2. Vá em **Table Editor** → `glucose_readings`
3. Veja se há registros (mesmo que de outros usuários)
4. Vá em **Authentication** → **Users**
5. Verifique se seu usuário está lá

### 4. Verificar Políticas RLS
1. No Supabase, vá em **Authentication** → **Policies**
2. Verifique se as políticas estão ativas para `glucose_readings`
3. Deve ter políticas para: SELECT, INSERT, UPDATE, DELETE

## 🐛 Erros Comuns

### Erro: "new row violates row-level security policy"
**Causa**: Política RLS bloqueando a inserção
**Solução**: 
1. No Supabase, vá em **SQL Editor**
2. Execute:
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'glucose_readings';

-- Se não existir, recriar:
CREATE POLICY "Users can insert own readings"
  ON public.glucose_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Erro: "Usuário não autenticado"
**Causa**: Sessão expirada ou não autenticado
**Solução**: 
1. Faça logout
2. Faça login novamente
3. Verifique se o email foi confirmado (se necessário)

### Erro: "relation does not exist"
**Causa**: Tabela não foi criada
**Solução**: Execute o schema SQL novamente no Supabase

### Dados salvam mas não aparecem
**Causa**: Problema ao carregar dados
**Solução**:
1. Verifique o console para erros
2. Recarregue a página (F5)
3. Verifique se os dados estão no Supabase

## 🔧 Teste Manual no Console

Abra o console do navegador (F12) e execute:

```javascript
// Verificar se Supabase está configurado
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado');

// Verificar usuário autenticado
import { supabase } from './src/lib/supabase';
const { data: { user } } = await supabase.auth.getUser();
console.log('Usuário:', user);

// Tentar inserir um registro manualmente
const testReading = {
  user_id: user.id,
  value: 95,
  type: 'JEJUM',
  date: new Date().toISOString(),
  is_normal: true,
  notes: 'Teste manual'
};

const { data, error } = await supabase
  .from('glucose_readings')
  .insert(testReading)
  .select();

console.log('Resultado:', { data, error });
```

## 📞 Se Nada Funcionar

1. Capture uma screenshot do erro no console
2. Verifique os logs no Supabase (Dashboard → Logs)
3. Verifique se o arquivo `.env` está correto
4. Reinicie o servidor: `npm run dev`



