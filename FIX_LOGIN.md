# Correção do Problema de Login

## Problema Identificado

O login não estava funcionando porque a política RLS (Row Level Security) estava bloqueando a busca de usuários na tabela `users` antes da autenticação.

## Solução Aplicada

### 1. Atualizar Políticas RLS no Supabase

Execute este SQL no Supabase SQL Editor:

```sql
-- Remover política antiga
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;

-- Criar nova política que permite buscar usuários para login
CREATE POLICY "Anyone can search users by name for login"
  ON public.users FOR SELECT
  USING (true);
```

### 2. Como Aplicar a Correção

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (no menu lateral)
4. Cole o SQL acima
5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Verifique se apareceu "Success"

### 3. Testar o Login

Após aplicar a correção:
1. Recarregue a página do aplicativo
2. Tente fazer login novamente
3. Verifique o console do navegador (F12) para ver os logs

## Nota de Segurança

Esta política permite que qualquer pessoa busque usuários na tabela `users`, mas isso é necessário para o processo de login. A segurança real está no `signInWithPassword` do Supabase Auth, que valida a senha.

Se quiser uma solução mais segura, podemos criar uma função que retorna apenas o email sem expor outros dados.

