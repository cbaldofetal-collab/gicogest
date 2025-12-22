# 📦 Preparar Projeto para GitHub

## Passo 1: Inicializar Git (se ainda não fez)

```bash
# Na pasta do projeto
cd "/Volumes/Extreme SSD/GLIC GEST 1 CURSOSR"

# Inicializar repositório git
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Initial commit: GlicoGest - Monitoramento de Glicemia"
```

## Passo 2: Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `glicogest` (ou outro nome de sua preferência)
   - **Description**: "Monitoramento de Glicemia para Diabetes Gestacional"
   - **Visibility**: Escolha Public ou Private
   - **NÃO marque** "Add a README file" (já temos um)
3. Clique em "Create repository"

## Passo 3: Conectar ao GitHub

```bash
# Adicionar remote (substitua SEU-USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU-USUARIO/glicogest.git

# Verificar se foi adicionado
git remote -v

# Fazer push
git branch -M main
git push -u origin main
```

## Passo 4: Verificar no GitHub

1. Acesse seu repositório: `https://github.com/SEU-USUARIO/glicogest`
2. Verifique se todos os arquivos estão lá
3. ✅ Pronto para fazer deploy!

---

## 🚀 Próximo Passo: Deploy

Agora que o código está no GitHub, siga o guia em `DEPLOY.md` para fazer o deploy.

**Recomendação**: Use **Vercel** - é o mais fácil e rápido!


