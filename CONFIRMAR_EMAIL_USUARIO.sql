-- SQL para confirmar o email do usuário existente
-- Execute isso no SQL Editor do Supabase

-- Opção 1: Confirmar TODOS os usuários que não têm email confirmado
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Opção 2: Confirmar apenas um usuário específico (substitua o email)
-- UPDATE auth.users
-- SET email_confirmed_at = NOW()
-- WHERE email = 'seu-email@exemplo.com';

-- Verificar se funcionou
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC;



