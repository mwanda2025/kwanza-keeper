"use client";

import React from 'react';
import { Button } from './ui/button';
import { 
  ChevronLeft, 
  Headset, 
  Info, 
  ShieldCheck, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  Clock,
  Zap,
  AlertCircle,
  FileSearch,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  Target,
  Sparkles,
  Cpu,
  Lock,
  Globe,
  Database,
  BarChart3,
  Eye,
  Trash2,
  UserCheck,
  Smartphone,
  Calendar,
  FileText,
  Cloud
} from 'lucide-react';
import { Card } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';

export type StaticViewType = 'support' | 'about' | 'privacy' | 'faq';

interface StaticInfoViewsProps {
  view: StaticViewType;
  onBack: () => void;
}

export function StaticInfoViews({ view, onBack }: StaticInfoViewsProps) {
  const titles: Record<StaticViewType, string> = {
    support: 'Apoio ao Cliente',
    about: 'Sobre o KwanzaKeeper',
    privacy: 'Privacidade e Termos',
    faq: 'Perguntas Frequentes',
  };

  const icons: Record<StaticViewType, any> = {
    support: Headset,
    about: Info,
    privacy: ShieldCheck,
    faq: HelpCircle,
  };

  const Icon = icons[view];

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 pb-24">
      <div className="flex items-center gap-3 mb-2 sticky top-0 bg-background/90 backdrop-blur-md py-4 z-10 border-b border-muted/20">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full h-8 w-8">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h2 className="text-xl font-black tracking-tight uppercase">{titles[view]}</h2>
        </div>
      </div>

      {view === 'support' && (
        <div className="space-y-8">
          <div className="space-y-2 px-1">
            <p className="text-sm text-foreground font-medium leading-relaxed">
              Estamos aqui para garantir que o teu Kwanza esteja sempre no lugar certo. A nossa equipa de suporte entende as tuas necessidades financeiras.
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <MessageCircle className="h-3 w-3" />
              Contacto Direto
            </h3>
            <div className="grid gap-3">
              <Card className="p-4 bg-card/40 border-muted flex items-center justify-between group cursor-pointer hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">WhatsApp Suporte</p>
                    <p className="text-[10px] text-muted-foreground">Resposta em menos de 2h</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500" />
              </Card>
              <Card className="p-4 bg-card/40 border-muted flex items-center justify-between group cursor-pointer hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">E-mail Oficial</p>
                    <p className="text-[10px] text-muted-foreground">ajuda@kwanzakeeper.ao</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-blue-500" />
              </Card>
            </div>
          </section>

          <section className="bg-muted/20 p-4 rounded-2xl border border-muted/50 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <Clock className="h-3 w-3" />
              Horário de Atendimento (Luanda)
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold">Segunda a Sexta</p>
                <p className="text-xs text-primary">08:00 — 18:00</p>
              </div>
              <div>
                <p className="text-[11px] font-bold">Sábados</p>
                <p className="text-xs text-primary">09:00 — 13:00</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              Perguntas Rápidas
            </h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-muted bg-card/20 px-4 rounded-xl mb-2">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Segurança da Conta
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  Utilizamos um sistema de <strong>autenticação privada</strong> encriptado no ecossistema KwanzaKeeper. Os teus dados de acesso (e-mail e palavra-passe) são geridos de forma segura e apenas tu tens acesso ao teu histórico.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-muted bg-card/20 px-4 rounded-xl mb-2">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline">
                  <div className="flex items-center gap-2">
                    <FileSearch className="h-3.5 w-3.5 text-orange-400" />
                    Exportação de Relatórios
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  Podes gerar PDFs e Excel diretamente no ecrã de <strong>Análise</strong>. Os relatórios incluem todos os gastos do mês corrente e o teu desempenho face ao orçamento.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Lightbulb className="h-3 w-3" />
              Dicas de Especialista
            </h3>
            <div className="grid gap-3">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                <Zap className="h-5 w-5 text-primary shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase">Atalhos Inteligentes</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">O KwanzaKeeper aprende com os teus gastos. Quanto mais usas, mais precisos se tornam os botões de acesso rápido.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                <Cpu className="h-5 w-5 text-blue-400 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase">Entrada Inteligente</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Usa a barra de IA para registar gastos rapidamente. Escreve apenas "2000 táxi" e o sistema trata do resto.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {view === 'about' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="text-center py-6 space-y-4">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
              <span className="text-4xl font-black text-white">K</span>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter">KwanzaKeeper</h3>
              <Badge variant="outline" className="text-[9px] uppercase tracking-[0.2em] font-black border-primary/20 text-primary">Versão 1.5.0 Gold</Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed italic px-6">
              "A nossa missão é trazer clareza financeira para cada angolano, mantendo o teu Kwanza no lugar certo."
            </p>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Missão e Visão</h3>
            </div>
            <Card className="p-5 bg-card/40 border-muted space-y-4 rounded-2xl">
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-foreground">O Propósito</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  O KwanzaKeeper nasceu da necessidade de simplificar o controlo de gastos no mercado angolano. Queremos que cada cidadão tenha ferramentas de elite para gerir o seu dinheiro sem complicações.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-muted/30">
                <h4 className="text-xs font-black uppercase text-foreground">A Nossa Visão</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Ser o assistente financeiro número 1 em Angola, integrando tecnologia de ponta para transformar hábitos em liberdade financeira.
                </p>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Funcionalidades de Elite</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FeatureCard 
                icon={Cpu} 
                title="IA Gemini" 
                desc="Insights automáticos sobre os teus padrões de gastos."
              />
              <FeatureCard 
                icon={ShieldCheck} 
                title="Conta Nuvem" 
                desc="Acesso exclusivo com o teu e-mail e palavra-passe."
              />
              <FeatureCard 
                icon={Clock} 
                title="Despesas Fixas" 
                desc="Gestão de rendas, propinas e contas mensais."
              />
              <FeatureCard 
                icon={Zap} 
                title="Atalhos" 
                desc="Botões rápidos que aprendem com os teus hábitos."
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Lock className="h-4 w-4 text-emerald-500" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tecnologia e Segurança</h3>
            </div>
            <Card className="p-5 bg-card/40 border-muted space-y-4 rounded-2xl overflow-hidden relative">
              <div className="space-y-3 relative z-10">
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase">Proteção de Dados</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">Os teus dados financeiros pertencem-te. Não partilhamos dados com terceiros nem utilizamos contas externas.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Database className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase">Infraestrutura Cloud</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">Utilizamos tecnologia de ponta para garantir que o teu histórico está sempre acessível em qualquer dispositivo.</p>
                  </div>
                </div>
              </div>
              <Globe className="absolute -right-6 -bottom-6 h-24 w-24 text-muted/5 -rotate-12" />
            </Card>
          </section>

          <div className="p-6 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-30">KwanzaKeeper © 2026 • Luanda, Angola</p>
          </div>
        </div>
      )}

      {view === 'privacy' && (
        <div className="space-y-8 pb-10">
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Compromisso de Privacidade</h3>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed px-1">
              No KwanzaKeeper, tratamos os teus dados financeiros com o máximo rigor. Esta política detalha como protegemos a tua soberania financeira através de um sistema de conta privada.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Database className="h-3 w-3" />
              1. Dados Guardados
            </h3>
            <Card className="p-5 bg-card/40 border-muted space-y-4 rounded-2xl">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Guardamos apenas o necessário para o funcionamento do assistente:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2 items-start text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><strong>Registos Financeiros:</strong> Valores, categorias e descrições dos teus gastos.</span>
                </li>
                <li className="flex gap-2 items-start text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><strong>Informações de Conta:</strong> E-mail e nome fornecidos por ti no registo exclusivo para acesso à cloud.</span>
                </li>
              </ul>
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Lock className="h-3 w-3" />
              2. Segurança Cloud
            </h3>
            <Card className="p-4 bg-card/40 border-muted rounded-2xl">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Os teus dados são protegidos por regras de segurança rigorosas no Cloud Firestore. Acesso restrito via autenticação de e-mail e palavra-passe — apenas tu podes visualizar o teu histórico.
              </p>
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              3. Uso Responsável de IA
            </h3>
            <Card className="p-5 bg-card/40 border-muted space-y-4 rounded-2xl">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                A IA Gemini analisa os teus padrões apenas para gerar os teus alertas e insights pessoais. Estes dados <strong>nunca</strong> são vendidos a terceiros ou partilhados com entidades externas.
              </p>
            </Card>
          </section>

          <Card className="p-4 bg-muted/20 border-dashed border-muted text-[10px] text-muted-foreground leading-tight italic rounded-xl">
            Ao utilizar o KwanzaKeeper, concordas com estas práticas. Atualizado em: Março de 2026.
          </Card>
        </div>
      )}

      {view === 'faq' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 px-1">
              <Smartphone className="h-3 w-3" />
              Registo e Uso Diário
            </h3>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="reg-1" className="border-muted bg-card/20 px-4 rounded-xl">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline text-left">
                  Como funcionam os atalhos?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  São botões na página inicial para registos instantâneos. O sistema aprende quais são os teus gastos mais comuns e coloca-os em destaque para poupares tempo.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="reg-2" className="border-muted bg-card/20 px-4 rounded-xl">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline text-left">
                  Como gerir rendas e propinas?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  Vai às <strong>Definições {'→'} Despesas Fixas</strong>. Adiciona o teu compromisso e define o dia de vencimento. Podes configurar lembretes para seres avisado antes do prazo.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 px-1">
              <ShieldCheck className="h-3 w-3" />
              Acesso e Dados
            </h3>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="sync-1" className="border-muted bg-card/20 px-4 rounded-xl">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline text-left">
                  Posso usar em vários telemóveis?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  Sim! Basta entrares com o teu e-mail e palavra-passe da tua conta KwanzaKeeper. Todos os teus gastos e definições estarão disponíveis instantaneamente em qualquer dispositivo.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sync-2" className="border-muted bg-card/20 px-4 rounded-xl">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline text-left">
                  Como apagar os meus dados?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  Nas <strong>Definições</strong>, encontras a opção "Apagar Todos os Dados" na zona crítica. Esta ação remove permanentemente todo o teu histórico da tua conta.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <Card className="p-4 bg-primary/5 border-primary/10 rounded-2xl flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase">Ainda com dúvidas?</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Visita a nossa página de <strong>Apoio ao Cliente</strong> para falar diretamente connosco via WhatsApp.</p>
            </div>
          </Card>
        </div>
      )}

      <Button variant="outline" className="w-full mt-6 border-muted text-[10px] font-black uppercase tracking-widest h-11" onClick={onBack}>
        Voltar ao Início
      </Button>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
  return (
    <Card className="p-3 bg-card/40 border-muted space-y-2 hover:border-primary/20 transition-all group">
      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-tight">{title}</h4>
        <p className="text-[9px] text-muted-foreground leading-tight">{desc}</p>
      </div>
    </Card>
  );
}
