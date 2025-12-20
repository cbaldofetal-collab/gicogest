# GlicoGest - Monitoramento de Glicemia para Diabetes Gestacional

Aplicativo web PWA (Progressive Web App) para monitoramento e gerenciamento da Diabetes Mellitus Gestacional (DMG).

## 🎯 Funcionalidades

- ✅ **Autenticação Segura**: Login e cadastro com email e senha alfanumérica
- ✅ **Registro de Glicemia**: Registro rápido e intuitivo com validação automática
- ✅ **Dashboard Interativo**: Visualização de métricas e gráficos de tendência
- ✅ **Lembretes Configuráveis**: Notificações nos horários de medição
- ✅ **Relatórios PDF**: Geração de relatórios profissionais para consultas médicas
- ✅ **Funcionamento Offline**: PWA com armazenamento local
- ✅ **Sincronização em Nuvem**: Dados sincronizados via Supabase (opcional)
- ✅ **Análise por Horário**: Identificação de padrões de hiperglicemia

## 📊 Valores de Normalidade

- **Jejum**: < 92 mg/dL
- **Pós-Café**: ≤ 140 mg/dL
- **Pós-Almoço (1h)**: ≤ 140 mg/dL
- **Pós-Jantar (1h)**: ≤ 140 mg/dL

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

O aplicativo estará disponível em `http://localhost:5173`

## 🔌 Configuração do Supabase (Backend)

O GlicoGest usa Supabase como backend para sincronização de dados e autenticação.

### Setup Rápido

1. **Criar projeto no Supabase**: https://app.supabase.com
2. **Configurar variáveis de ambiente**:
   ```bash
   cp env.example .env
   # Edite .env com suas credenciais do Supabase
   ```
3. **Criar schema do banco**: Execute o SQL em `supabase/schema.sql` no SQL Editor do Supabase
4. **Reiniciar o servidor**: `npm run dev`

📖 **Guia completo**: Veja `SUPABASE_SETUP.md` para instruções detalhadas.

> **Nota**: Se o Supabase não estiver configurado, o app funciona apenas com armazenamento local (IndexedDB).

## 🚀 Deploy em Produção

O GlicoGest pode ser facilmente deployado em várias plataformas. Recomendamos **Vercel** para a melhor experiência.

### Opções de Deploy

1. **Vercel** (⭐ Recomendado) - Mais fácil e rápido
2. **Netlify** - Excelente alternativa
3. **GitHub Pages** - Gratuito, mas mais limitado

📖 **Guia completo de deploy**: Veja `DEPLOY.md` para instruções detalhadas passo a passo.

### Deploy Rápido no Vercel

1. Faça push do código para o GitHub
2. Acesse https://vercel.com e faça login com GitHub
3. Clique em "Add New Project" e selecione seu repositório
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em "Deploy"
6. Pronto! Seu app estará online em segundos

## 📱 Instalação como PWA

1. Acesse o aplicativo no navegador (Chrome, Edge, Safari)
2. No menu do navegador, selecione "Instalar aplicativo" ou "Adicionar à tela inicial"
3. O aplicativo será instalado e poderá ser usado offline

## 🔧 Tecnologias Utilizadas

### Frontend
- **React 18** + **TypeScript** - Framework e tipagem
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos e visualizações
- **jsPDF** - Geração de PDFs
- **React Hook Form** + **Zod** - Formulários e validação
- **date-fns** - Manipulação de datas

### Backend
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL - Banco de dados
  - Supabase Auth - Autenticação
  - Row Level Security (RLS) - Segurança de dados
- **Dexie.js** - IndexedDB wrapper (fallback local)

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes UI base
│   ├── Charts/         # Componentes de gráficos
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── GlucoseForm.tsx # Formulário de registro
│   ├── ReportGenerator.tsx # Geração de PDF
│   └── Settings.tsx    # Configurações
├── hooks/              # Custom hooks
│   ├── useGlucose.ts   # Hook para operações CRUD
│   └── useNotifications.ts # Hook para notificações
├── lib/                # Bibliotecas e utilitários
│   ├── db.ts           # Configuração do banco de dados
│   ├── pdf-generator.ts # Lógica de geração de PDF
│   └── utils.ts        # Funções utilitárias
├── types/              # Tipos TypeScript
│   └── glucose.ts      # Tipos de dados
└── utils/              # Utilitários
    ├── constants.ts    # Constantes e valores de referência
    └── validation.ts   # Validações
```

## 🎨 Personalização

### Ícones do PWA

Para personalizar os ícones do PWA, substitua os arquivos em `public/icons/` pelos seus próprios ícones nos tamanhos:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512 pixels

### Cores

As cores podem ser personalizadas em `tailwind.config.js` na seção `theme.extend.colors`.

## 📝 Licença

Este projeto foi desenvolvido para uso em monitoramento de diabetes gestacional.

## 🤝 Contribuindo

Este é um projeto MVP. Sugestões e melhorias são bem-vindas!

---

**GlicoGest** - Monitoramento Inteligente para Diabetes Gestacional
