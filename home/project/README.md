# 🦁 KwanzaKeeper - Cloud-Only Finance Clarity (v1.5.0 Gold)

KwanzaKeeper é um assistente financeiro pessoal de elite, **100% Cloud-Native**, desenvolvido especificamente para o contexto angolano. Utiliza Inteligência Artificial (Genkit + Gemini) para garantir controlo total das tuas finanças com segurança absoluta e simplicidade radical através de uma conta privada exclusiva.

## ✨ Funcionalidades Gold (Cloud Architecture)

- **🚀 Cloud-Only Architecture**: Operação direta via Firebase Firestore. Zero armazenamento local para máxima estabilidade e persistência total.
- **🤖 IA Gemini Integration**: Registo de despesas em linguagem natural, geração de insights de tendências e alertas inteligentes de orçamento.
- **🎙️ Voz do KwanzaKeeper**: Relatórios financeiros e análises de tendências narrados por IA (TTS) para uma experiência mãos-livres.
- **⚡ Fast-Track Entry**: Sistema de registo em dois modos: **Rápido** (Descrição + Valor) e **Completo** (Detalhes avançados de categoria, data e notas).
- **🔒 Autenticação Privada**: Sistema de login por E-mail e Palavra-passe 100% integrado, sem dependência de contas externas (Google/Social).
- **📊 Real-time Sync**: Sincronização instantânea de gastos, despesas fixas e atalhos inteligentes na tua conta Cloud.
- **🛡️ Security First**: Zona Crítica protegida por interruptor de segurança para evitar eliminação acidental de dados.

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
│   ├── AuthForm.tsx        # Autenticação privada (E-mail/Senha)
│   ├── ExpenseForm.tsx     # Formulário Dual-Mode (Rápido/Completo)
│   └── ...             # Componentes de negócio (FixedExpenses, Charts)
├── firebase/           # Camada de Dados Cloud (Single Source of Truth)
│   ├── firestore/      # Hooks de subscrição em tempo real estáveis
│   ├── provider.tsx    # Contexto de Firebase (Auth/Store/Security)
│   └── errors.ts       # Motor de diagnósticos de segurança para o LLM
├── hooks/              # Lógica de Negócio e Estado Cloud
│   ├── useExpenses.ts      # Gestão de transacções (CRUD Firestore)
│   ├── useUserSettings.ts  # Perfil, Orçamento e Ciclo na Nuvem
│   ├── useFixedExpenses.ts # Gestão de compromissos recorrentes
│   └── useQuickShortcuts.ts # Motor de atalhos (Manual + Auto-AI)
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
