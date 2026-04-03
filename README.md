# 🦁 KwanzaKeeper - Cloud-Only Finance Clarity (v1.5.0 Gold)

KwanzaKeeper é um assistente financeiro pessoal de elite, **100% Cloud-Native**, desenvolvido especificamente para o contexto angolano. Utiliza Inteligência Artificial (Genkit + Gemini) para garantir controlo total das tuas finanças com segurança absoluta e simplicidade radical.

## ✨ Funcionalidades Gold (Cloud Architecture)

- **🚀 Cloud-Only Architecture**: Operação direta via Firebase Firestore. Zero armazenamento local para máxima estabilidade e persistência entre dispositivos.
- **🤖 IA Gemini Integration**: Registo de despesas em linguagem natural, geração de relatórios de tendências e alertas inteligentes de orçamento.
- **🎙️ Voz do KwanzaKeeper**: Relatórios financeiros narrados por IA (TTS) para uma análise rápida e mãos-livres.
- **⚡ Fast-Track Entry**: Novo sistema de registo em dois modos: **Rápido** (Descrição + Valor em 3 segundos) e **Completo** (Detalhes avançados).
- **🔒 Autenticação Exclusiva**: Sistema de login por E-mail e Palavra-passe totalmente integrado no ecossistema KwanzaKeeper.
- **📊 Real-time Sync**: Sincronização instantânea de gastos, despesas fixas e atalhos na tua conta Cloud.
- **🛡️ Security First**: Zona Crítica protegida por interruptor de segurança e regras Firestore rigorosas (`users/{userId}`).

## 📁 Estrutura do Projecto (Tree)

```text
src/
├── ai/                 # Inteligência Artificial (Genkit)
│   ├── flows/          # Fluxos: Insights, Parsing Natural, Alertas, Voz (TTS)
│   └── genkit.ts       # Configuração central do motor Gemini 2.5 Flash
├── app/                # Rotas e Layouts (Next.js 15 App Router)
│   ├── layout.tsx      # Configuração de Providers e Fontes (Sora/Mono)
│   ├── page.tsx        # Interface principal (Dashboard & Navegação)
│   ├── error.tsx       # Recovery System: Gestão de erros e permissões
│   └── globals.css     # Design System (Tokens v1.5.0 Gold)
├── components/         # Biblioteca de Componentes UI
│   ├── ui/             # Componentes ShadCN (Base atómica)
│   ├── animations/     # Micro-interacções (FloatingAmount)
│   ├── AIInsightsView.tsx  # Análise inteligente com suporte a áudio
│   ├── AuthForm.tsx        # Sistema de entrada e registo centralizado
│   ├── ExpenseForm.tsx     # Novo formulário Dual-Mode (Rápido/Completo)
│   └── ...             # Componentes de negócio (Dashboard, FixedExpenses)
├── firebase/           # Camada de Dados Cloud (Single Source of Truth)
│   ├── firestore/      # Hooks de subscrição em tempo real estáveis
│   ├── provider.tsx    # Contexto de Firebase (Auth/Store/Email-Flow)
│   └── errors.ts       # Motor de diagnósticos de segurança para o LLM
├── hooks/              # Lógica de Negócio e Estado Cloud
│   ├── useExpenses.ts      # Gestão de transacções diretas no Firestore
│   ├── useUserSettings.ts  # Sincronização de perfil e orçamento na nuvem
│   ├── useFixedExpenses.ts # Gestão de compromissos recorrentes
│   └── useQuickShortcuts.ts # Motor de atalhos inteligentes (Manual + Auto)
└── lib/                # Motores de Cálculo e Utilitários
    ├── types.ts        # Definições de TypeScript rigorosas
    ├── exportService.ts # Motor de exportação PDF/Excel
    └── quickAccessEngine.ts # Algoritmo de relevância para acesso rápido
```

## 🛠️ Configuração

O projecto utiliza as seguintes variáveis de ambiente:
- `NEXT_PUBLIC_FIREBASE_API_KEY`: Chave de API para ligação ao Firebase.
- `GEMINI_API_KEY`: Chave para os serviços de Inteligência Artificial.

---
*KwanzaKeeper Gold - O teu Kwanza sempre seguro e inteligente na Nuvem.*
