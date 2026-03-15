
# 🦁 KwanzaKeeper - Finance Clarity (v1.5.0 Gold)

KwanzaKeeper é um assistente financeiro pessoal de elite, desenvolvido especificamente para o contexto angolano. Utiliza Inteligência Artificial (Gemini) e uma arquitectura **Hybrid Cloud (Offline-First + Firebase)** para garantir controlo total das tuas finanças, em qualquer lugar.

## ✨ Funcionalidades Principais

- **🤖 IA Dual-Mode (Online/Offline)**: Registo de despesas em linguagem natural. Se estiveres sem rede, o motor local (Regex) assume o controlo; quando voltares online, o Gemini 2.5 Flash gera insights profundos e alertas inteligentes.
- **🔄 SyncManager (Orquestrador)**: Sincronização inteligente que prioriza dados críticos: Despesas Fixas > Variáveis > Atalhos Manuais. Resolução automática de conflitos e migração transparente de Guest para Cloud.
- **📊 Dashboard Multi-Período**: Sumários dinâmicos (Hoje, Semana, Mês, Ano) com gráficos Recharts e análise de ritmo de gasto médio diário para evitar surpresas no fim do mês.
- **📅 Gestão de Despesas Fixas**: Calendário de compromissos (rendas, propinas, luz) com lembretes automáticos e marcação de pagamento em 1-clique integrada no histórico.
- **⚡ Acesso Rápido Inteligente**: Atalhos que aprendem com os teus hábitos + 3 slots de prioridade manual configuráveis nas definições.
- **🚀 Onboarding Contextual**: Prompt de protecção de dados que surge após 5 registos, incentivando o backup na nuvem sem interromper a fluidez inicial.
- **🔒 Segurança de Elite**: Arquitectura Offline-First com IndexedDB e sincronização cloud segura via Firebase com Security Rules baseadas em propriedade de caminho.
- **🌍 Suporte Multi-Moeda (Opcional)**: Regista gastos em USD ou EUR com conversão automática para Kwanza (AOA) para manter o teu dashboard unificado.

## 📁 Estrutura do Projecto

```text
src/
├── ai/                 # Inteligência Artificial (Genkit Flows)
│   ├── flows/          # Lógica de Natural Language, Insights e Alertas
│   ├── genkit.ts       # Configuração do motor Gemini 2.5 Flash
│   └── dev.ts          # Entry point de desenvolvimento IA
├── app/                # Rotas e Layouts (Next.js 15 App Router)
│   ├── lib/            # Assets de configuração (placeholder-images.json)
│   ├── error.tsx       # Tratamento de resiliência de rede (Chunk Errors)
│   ├── globals.css     # Design System (Amber/Dark Theme)
│   ├── layout.tsx      # Root Layout com Firebase Client Provider
│   └── page.tsx        # Dashboard Principal e Orquestrador de Vistas
├── components/         # Biblioteca de Componentes UI
│   ├── ui/             # ShadCN UI (Base de design)
│   ├── animations/     # Micro-interacções (FloatingAmount)
│   ├── Dashboard.tsx   # Painel analítico multi-período
│   ├── ExpenseForm.tsx # Entrada Dual-Mode (IA/Manual)
│   ├── ExpenseItem.tsx # Lista optimizada para scroll mobile
│   ├── FixedExpensesManager.tsx # Gestor de compromissos recorrentes
│   ├── MonthlyReportView.tsx # Dossier de performance mensal IA
│   └── SettingsView.tsx # Configurações de nuvem e preferências
├── firebase/           # Camada Cloud e Autenticação
│   ├── firestore/      # Hooks de tempo real (useCollection, useDoc)
│   ├── config.ts       # Configuração da Firebase API
│   ├── provider.tsx    # Contexto central de serviços
│   └── non-blocking-*.ts # Operações assíncronas resilientes
├── hooks/              # Lógica de Estado e Sincronização
│   ├── useSyncManager.ts # Orquestrador de Sincronização Cloud
│   ├── useExpenses.ts  # Gestão de gastos variáveis (Offline-First)
│   ├── useFixedExpenses.ts # Gestão de compromissos fixos
│   └── useQuickShortcuts.ts # Motor de atalhos adaptativo
└── lib/                # Motores Core e Utilitários
    ├── storage.ts      # Storage Engine (IndexedDB Layer)
    ├── expenseParser.ts # Motor de IA Offline (Regex Angolano)
    ├── quickAccessEngine.ts # Algoritmo de aprendizagem de hábitos
    ├── budget.ts       # Lógica de orçamentos e ciclos
    ├── exportService.ts # Gerador de PDF e Excel (jspdf/xlsx)
    └── types.ts        # Definições estritas de TypeScript
```

## 🛠️ Requisitos de Ambiente

Configura as seguintes variáveis no teu ficheiro `.env` para activar as funcionalidades Cloud e IA:

```env
# Gemini AI Key (Obtém em aistudio.google.com)
GOOGLE_GENAI_API_KEY=tua_chave_aqui

# Firebase Client Key (Pública)
NEXT_PUBLIC_FIREBASE_API_KEY=tua_chave_firebase
```

---
*KwanzaKeeper Gold - Mantendo o teu Kwanza no lugar certo.*
