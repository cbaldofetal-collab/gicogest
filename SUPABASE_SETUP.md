# Configuração do Supabase

Este guia explica como configurar o Supabase como backend para o GlicoGest.

## 📋 Pré-requisitos

1. Conta no Supabase (gratuita): https://supabase.com
2. Node.js instalado

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse https://app.supabase.com
2. Clique em "New Project"
3. Preencha:
   - **Name**: GlicoGest (ou outro nome)
   - **Database Password**: Escolha uma senha forte (anote ela!)
   - **Region**: Escolha a região mais próxima (ex: South America)
4. Aguarde alguns minutos enquanto o projeto é criado

### 2. Obter Credenciais da API

1. No painel do Supabase, vá em **Settings** → **API**
2. Você verá:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public key** (uma chave longa)
3. Copie essas duas informações

### 3. Configurar Variáveis de Ambiente

1. No projeto, copie o arquivo `env.example` para `.env`:
   ```bash
   cp env.example .env
   ```

2. Edite o arquivo `.env` e preencha:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
   ```

### 4. Criar Schema do Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo `supabase/schema.sql` deste projeto
4. Copie todo o conteúdo SQL
5. Cole no SQL Editor do Supabase
6. Clique em **Run** (ou pressione Ctrl+Enter)

Isso criará:
- Tabelas: `users`, `glucose_readings`, `reminders_config`
- Políticas de segurança (RLS)
- Triggers e funções

### 5. Verificar Configuração

1. No Supabase, vá em **Table Editor**
2. Você deve ver as tabelas criadas:
   - `users`
   - `glucose_readings`
   - `reminders_config`

### 6. Testar a Aplicação

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse http://localhost:5173
3. Crie uma nova conta
4. Verifique se os dados aparecem no Supabase:
   - **Table Editor** → `users` (deve ter seu usuário)
   - **Table Editor** → `glucose_readings` (quando você adicionar registros)

## 🔒 Segurança

O Supabase usa **Row Level Security (RLS)** para garantir que:
- Usuários só vejam seus próprios dados
- Usuários só possam modificar seus próprios dados
- Dados sejam protegidos automaticamente

## 📊 Estrutura do Banco

### Tabela `users`
- Armazena informações do perfil do usuário
- Vinculada à autenticação do Supabase

### Tabela `glucose_readings`
- Armazena todas as medições de glicemia
- Vinculada ao usuário via `user_id`

### Tabela `reminders_config`
- Armazena configurações de lembretes
- Uma configuração por usuário

## 🔄 Sincronização

Com o Supabase configurado:
- ✅ Dados sincronizam entre dispositivos
- ✅ Backup automático na nuvem
- ✅ Funciona offline (com sincronização quando online)
- ✅ Dados seguros e privados

## 🆘 Troubleshooting

### Erro: "Supabase não configurado"
- Verifique se o arquivo `.env` existe
- Verifique se as variáveis estão corretas
- Reinicie o servidor após criar/editar `.env`

### Erro ao criar usuário
- Verifique se o schema SQL foi executado corretamente
- Verifique os logs no Supabase (Dashboard → Logs)

### Dados não aparecem
- Verifique se está logado
- Verifique as políticas RLS no Supabase
- Verifique o console do navegador para erros

## 📚 Recursos

- Documentação Supabase: https://supabase.com/docs
- Dashboard do seu projeto: https://app.supabase.com


