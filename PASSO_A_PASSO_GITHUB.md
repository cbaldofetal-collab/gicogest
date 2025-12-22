# 📝 Passo a Passo: Enviar Projeto para GitHub

## ✅ Você já fez:
- [x] Login no GitHub
- [x] Criou token de acesso (se necessário)

## 📋 Próximos Passos:

### Passo 1: Criar Repositório no GitHub

1. Acesse: **https://github.com/new**
2. Preencha:
   - **Repository name**: `glicogest` (ou outro nome)
   - **Description**: "Monitoramento de Glicemia para Diabetes Gestacional"
   - **Visibility**: 
     - ✅ **Public** (qualquer um pode ver)
     - ⚠️ **Private** (só você vê)
   - ⚠️ **NÃO marque** "Add a README file" (já temos um)
   - ⚠️ **NÃO marque** "Add .gitignore" (já temos um)
3. Clique em **"Create repository"**

### Passo 2: Preparar Projeto Local

Abra o terminal na pasta do projeto e execute:

```bash
# Ir para a pasta do projeto
cd "/Volumes/Extreme SSD/GLIC GEST 1 CURSOSR"

# Inicializar Git
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Initial commit: GlicoGest - Monitoramento de Glicemia"
```

### Passo 3: Conectar ao GitHub

**IMPORTANTE**: Substitua `SEU-USUARIO` pelo seu usuário do GitHub!

```bash
# Adicionar repositório remoto
git remote add origin https://github.com/SEU-USUARIO/glicogest.git

# Renomear branch para main
git branch -M main

# Fazer push (enviar para GitHub)
git push -u origin main
```

**Se pedir senha:**
- Use o **token de acesso pessoal** que você criou (não sua senha do GitHub)
- O token funciona como senha

### Passo 4: Verificar

1. Acesse: `https://github.com/SEU-USUARIO/glicogest`
2. Você deve ver todos os arquivos do projeto
3. ✅ Pronto!

---

## 🚀 Depois: Fazer Deploy

Agora que o código está no GitHub, siga o guia em `DEPLOY.md` para fazer deploy no Vercel.

---

## ❓ Problemas Comuns

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/glicogest.git
```

### Erro: "Authentication failed"
- Verifique se está usando o **token** e não a senha
- Certifique-se de que o token tem permissão `repo`

### Erro: "Permission denied"
- Verifique se o nome do repositório está correto
- Certifique-se de que você tem acesso ao repositório

---

## 💡 Dica Rápida

Se preferir, pode executar o script automático:
```bash
bash PREPARAR_GITHUB.sh
```

Depois siga os passos 1 e 3 acima.


