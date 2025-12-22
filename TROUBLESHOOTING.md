# Troubleshooting - Dados não aparecem no Dashboard

## 🔴 Problema: Dados salvam mas não aparecem no Dashboard

### ✅ Solução 1: Reiniciar o Servidor

**IMPORTANTE**: Após criar/editar o arquivo `.env`, você DEVE reiniciar o servidor!

1. Pare o servidor (Ctrl+C no terminal)
2. Inicie novamente:
   ```bash
   npm run dev
   ```
3. Recarregue a página no navegador (F5)

### ✅ Solução 2: Verificar Console do Navegador

1. Abra o console (F12 → Console)
2. Procure por mensagens como:
   - `✅ Supabase configurado: https://...`
   - `getAllReadingsSupabase: Registros encontrados...`
   - Erros em vermelho

### ✅ Solução 3: Verificar no Supabase

1. Acesse: https://app.supabase.com
2. Vá em **Table Editor** → `glucose_readings`
3. Veja se há registros lá
4. Se NÃO houver registros:
   - O problema é no salvamento
   - Verifique o console para erros ao salvar
5. Se HOUVER registros mas não aparecerem no app:
   - O problema é no carregamento
   - Verifique políticas RLS

### ✅ Solução 4: Verificar Políticas RLS

No Supabase, vá em **SQL Editor** e execute:

```sql
-- Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'glucose_readings';

-- Se não existir a política de SELECT, criar:
CREATE POLICY "Users can view own readings"
  ON public.glucose_readings FOR SELECT
  USING (auth.uid() = user_id);
```

### ✅ Solução 5: Teste Manual

No console do navegador (F12), execute:

```javascript
// Verificar configuração
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'OK' : 'FALTANDO');

// Testar conexão
import { supabase } from './src/lib/supabase';
const { data: { user } } = await supabase.auth.getUser();
console.log('Usuário:', user);

// Buscar registros diretamente
const { data, error } = await supabase
  .from('glucose_readings')
  .select('*')
  .eq('user_id', user.id);
console.log('Registros:', data);
console.log('Erro:', error);
```

### ✅ Solução 6: Limpar Cache e Recarregar

1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Ou use modo anônimo/privado
3. Faça login novamente
4. Tente adicionar um registro

### ✅ Solução 7: Verificar Autenticação

1. Faça logout
2. Faça login novamente
3. Verifique se o email foi confirmado (se necessário no Supabase)

## 📋 Checklist Rápido

- [ ] Servidor foi reiniciado após criar `.env`?
- [ ] Arquivo `.env` existe e tem as credenciais corretas?
- [ ] Console do navegador mostra erros?
- [ ] Dados aparecem no Supabase (Table Editor)?
- [ ] Políticas RLS estão ativas?
- [ ] Usuário está autenticado?

## 🆘 Se Nada Funcionar

1. Capture screenshot do console (F12)
2. Capture screenshot do Supabase (Table Editor)
3. Verifique os logs no Supabase (Dashboard → Logs)


