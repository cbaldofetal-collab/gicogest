# 🚀 Guia de Deploy - GlicoGest

Este guia explica como fazer deploy do GlicoGest em diferentes plataformas.

## 📋 Pré-requisitos

1. Conta no GitHub
2. Repositório criado no GitHub
3. Variáveis de ambiente do Supabase configuradas

## 🔐 Variáveis de Ambiente Necessárias

Antes de fazer deploy, você precisa das seguintes variáveis:

- `VITE_SUPABASE_URL` - URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave pública (anon key) do Supabase

## 🎯 Opções de Deploy Recomendadas

### 1. Vercel (⭐ RECOMENDADO - Mais Fácil)

**Por que escolher Vercel:**
- ✅ Deploy automático a cada push no GitHub
- ✅ HTTPS gratuito
- ✅ CDN global (muito rápido)
- ✅ Configuração automática para React/Vite
- ✅ Preview de cada PR
- ✅ Gratuito para projetos pessoais

**Como fazer deploy:**

1. **Criar conta:**
   - Acesse: https://vercel.com
   - Faça login com sua conta GitHub

2. **Importar projeto:**
   - Clique em "Add New Project"
   - Selecione seu repositório do GitHub
   - Vercel detectará automaticamente que é um projeto Vite

3. **Configurar variáveis de ambiente:**
   - Na tela de configuração, vá em "Environment Variables"
   - Adicione:
     - `VITE_SUPABASE_URL` = sua URL do Supabase
     - `VITE_SUPABASE_ANON_KEY` = sua chave anon do Supabase
   - Clique em "Deploy"

4. **Pronto!**
   - O deploy será feito automaticamente
   - Você receberá uma URL como: `seu-app.vercel.app`

**Configuração adicional (opcional):**
- O arquivo `vercel.json` já está configurado no projeto
- Para domínio customizado: Settings → Domains

---

### 2. Netlify (⭐ Também Excelente)

**Por que escolher Netlify:**
- ✅ Deploy automático a cada push
- ✅ HTTPS gratuito
- ✅ CDN global
- ✅ Formulários e funções serverless
- ✅ Gratuito para projetos pessoais

**Como fazer deploy:**

1. **Criar conta:**
   - Acesse: https://www.netlify.com
   - Faça login com sua conta GitHub

2. **Importar projeto:**
   - Clique em "Add new site" → "Import an existing project"
   - Selecione seu repositório do GitHub
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Configurar variáveis de ambiente:**
   - Vá em Site settings → Environment variables
   - Adicione:
     - `VITE_SUPABASE_URL` = sua URL do Supabase
     - `VITE_SUPABASE_ANON_KEY` = sua chave anon do Supabase
   - Clique em "Deploy site"

4. **Pronto!**
   - O deploy será feito automaticamente
   - Você receberá uma URL como: `seu-app.netlify.app`

**Configuração adicional:**
- O arquivo `netlify.toml` já está configurado no projeto

---

### 3. GitHub Pages (Gratuito, mas mais trabalhoso)

**Como fazer deploy:**

1. **Instalar gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Adicionar script no package.json:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. **Configurar base no vite.config.ts:**
   ```typescript
   export default defineConfig({
     base: '/nome-do-repositorio/',
     // ... resto da config
   })
   ```

4. **Fazer deploy:**
   ```bash
   npm run deploy
   ```

**Limitação:** GitHub Pages não suporta variáveis de ambiente secretas. Você precisaria expor as chaves no código (não recomendado).

---

## 📝 Passo a Passo Completo (Vercel)

### 1. Preparar o código para GitHub

```bash
# Verificar se está tudo commitado
git status

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Preparar para deploy"

# Criar repositório no GitHub (se ainda não criou)
# Depois adicionar remote:
git remote add origin https://github.com/SEU-USUARIO/glicogest.git

# Fazer push
git push -u origin main
```

### 2. Fazer deploy no Vercel

1. Acesse https://vercel.com
2. Clique em "Sign Up" e faça login com GitHub
3. Clique em "Add New Project"
4. Selecione seu repositório `glicogest`
5. Configure:
   - Framework Preset: Vite (deve detectar automaticamente)
   - Root Directory: `./` (raiz)
   - Build Command: `npm run build` (já vem preenchido)
   - Output Directory: `dist` (já vem preenchido)
6. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL` = `https://xlwholcjpfahxgzbxhsu.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = sua chave anon
7. Clique em "Deploy"
8. Aguarde alguns minutos
9. Pronto! Você terá uma URL como: `glicogest.vercel.app`

### 3. Configurar domínio customizado (opcional)

1. No Vercel, vá em Settings → Domains
2. Adicione seu domínio
3. Siga as instruções para configurar DNS

---

## 🔄 Deploy Automático

Tanto Vercel quanto Netlify fazem deploy automático:
- ✅ A cada push na branch `main` → deploy em produção
- ✅ A cada PR → preview de deploy
- ✅ Rollback fácil se algo der errado

---

## 🐛 Troubleshooting

### Erro: "Environment variable not found"
- Verifique se adicionou as variáveis na plataforma de deploy
- Certifique-se de que os nomes estão corretos: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

### Erro: "Build failed"
- Verifique os logs de build na plataforma
- Certifique-se de que todas as dependências estão no `package.json`

### App não carrega após deploy
- Verifique se o `base` no `vite.config.ts` está correto
- Verifique se as variáveis de ambiente estão configuradas

---

## 📊 Comparação das Plataformas

| Recurso | Vercel | Netlify | GitHub Pages |
|---------|--------|---------|--------------|
| Deploy automático | ✅ | ✅ | ❌ |
| HTTPS gratuito | ✅ | ✅ | ✅ |
| CDN global | ✅ | ✅ | ✅ |
| Variáveis de ambiente | ✅ | ✅ | ❌ |
| Preview de PR | ✅ | ✅ | ❌ |
| Facilidade de uso | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Gratuito | ✅ | ✅ | ✅ |

---

## 🎉 Recomendação Final

**Use Vercel** - É a opção mais fácil e completa para este projeto. O deploy leva menos de 5 minutos e tudo funciona automaticamente depois.

---

## 📞 Precisa de Ajuda?

Se tiver problemas durante o deploy:
1. Verifique os logs de build na plataforma
2. Confirme que as variáveis de ambiente estão configuradas
3. Verifique se o Supabase está acessível publicamente

