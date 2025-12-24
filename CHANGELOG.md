# Changelog - GlicoGest

## [1.0.0] - 2024

### ✨ Funcionalidades Principais

#### Autenticação
- Sistema de login e cadastro
- Validação de senha alfanumérica
- Campo de email no cadastro
- Sessões persistentes
- Integração com Supabase Auth

#### Monitoramento de Glicemia
- Registro de medições (Jejum, Pós-Café, Pós-Almoço, Pós-Jantar)
- Validação automática contra valores de normalidade
- Feedback visual (verde/vermelho)
- Edição e exclusão de registros

#### Dashboard
- Métricas principais (% na meta, média, valores alterados)
- Gráfico de tendência temporal
- Gráfico de análise por horário
- Lista de registros recentes

#### Lembretes
- Configuração de 4 lembretes diários
- Notificações do navegador
- Ativação/desativação individual

#### Relatórios
- Geração de PDF profissional
- Tabela completa de registros
- Gráficos consolidados
- Estatísticas detalhadas

#### Backend
- Integração com Supabase
- Sincronização de dados na nuvem
- Row Level Security (RLS)
- Fallback para armazenamento local

### 🔧 Tecnologias

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Dexie.js (IndexedDB)
- Recharts
- jsPDF
- React Hook Form + Zod

### 📊 Valores de Normalidade

- **Jejum**: < 92 mg/dL
- **Pós-Café**: ≤ 140 mg/dL
- **Pós-Almoço (1h)**: ≤ 140 mg/dL
- **Pós-Jantar (1h)**: ≤ 140 mg/dL

### 🚀 Próximas Funcionalidades (Roadmap)

- [ ] Exportação para CSV/Excel
- [ ] Múltiplos perfis (várias pacientes)
- [ ] Integração com monitores contínuos de glicose (CGM)
- [ ] Compartilhamento de dados com médicos
- [ ] Histórico de alterações
- [ ] Metas personalizadas



