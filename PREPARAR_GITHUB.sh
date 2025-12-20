#!/bin/bash

# Script para preparar o projeto para GitHub
# Execute: bash PREPARAR_GITHUB.sh

echo "🚀 Preparando projeto para GitHub..."

# 1. Inicializar Git
echo "📦 Inicializando repositório Git..."
git init

# 2. Adicionar todos os arquivos
echo "➕ Adicionando arquivos..."
git add .

# 3. Fazer primeiro commit
echo "💾 Criando primeiro commit..."
git commit -m "Initial commit: GlicoGest - Monitoramento de Glicemia para Diabetes Gestacional"

echo ""
echo "✅ Git inicializado com sucesso!"
echo ""
echo "📝 Próximos passos:"
echo "1. Crie um repositório no GitHub: https://github.com/new"
echo "2. NÃO marque 'Add a README file' (já temos um)"
echo "3. Depois execute:"
echo "   git remote add origin https://github.com/SEU-USUARIO/glicogest.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "💡 Substitua 'SEU-USUARIO' pelo seu usuário do GitHub"

