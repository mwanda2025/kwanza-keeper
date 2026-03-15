
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
              Estamos aqui para garantir que o teu Kwanza esteja sempre no lugar certo. A nossa equipa de suporte é composta por angolanos que entendem as tuas necessidades financeiras.
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
            <p className="text-[9px] text-muted-foreground italic border-t border-muted/30 pt-2">
              * Fora deste horário, podes enviar a tua dúvida e responderemos no início do próximo turno.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <AlertCircle className="h-3 w-3" />
              Problemas Comuns
            </h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-muted bg-card/20 px-4 rounded-xl mb-2">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 text-blue-400" />
                    Sincronização Offline
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  Se registaste gastos sem internet, eles aparecem com um ícone de nuvem cortada. Assim que voltares a ter rede, o <strong>SyncManager</strong> tratará de tudo sozinho. Se demorar, toca no ícone de Wifi no topo do ecrã inicial para forçar a sincronização.
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
                  Podes gerar PDFs e Excel diretamente no ecrã de <strong>Análise</strong>. Se o ficheiro não descarregar, verifica se o teu navegador não está a bloquear pop-ups. Os relatórios incluem todos os gastos do mês corrente e o teu desempenho face ao orçamento.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-muted bg-card/20 px-4 rounded-xl mb-2">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Segurança da Conta
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  Para recuperar a tua palavra-passe, utiliza a opção "Esqueci-me da senha" no ecrã de login. Recomendamos o uso do login via <strong>Google</strong> para maior facilidade e segurança.
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
                <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase">Parser Local</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">Escreve "2000 taxi" ou "500 matabicho ontem" para registos instantâneos. O motor local reconhece gírias angolanas comuns.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3 px-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Como pedir ajuda corretamente?</h4>
            <div className="bg-card p-4 rounded-2xl border border-dashed border-muted text-[10px] space-y-2 font-code">
              <p className="text-primary opacity-80">// Exemplo de mensagem eficaz:</p>
              <p className="text-foreground">"Olá, o meu nome é [Teu Nome]. Tenho uma conta com o e-mail [teu@email.com]. Não estou a conseguir sincronizar um gasto de 15.000 Kz feito hoje às 14h. O ícone de erro aparece no topo."</p>
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
                  O KwanzaKeeper nasceu da necessidade de simplificar o controlo de gastos no mercado angolano. Queremos que cada cidadão, do Zango ao Talatona, tenha ferramentas de elite para gerir o seu dinheiro sem complicações.
                </p>
              </div>
              <div className="space-y-2 pt-2 border-t border-muted/30">
                <h4 className="text-xs font-black uppercase text-foreground">A Nossa Visão</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Ser o assistente financeiro número 1 em Angola, integrando IA e tecnologia de ponta para transformar hábitos de consumo em liberdade financeira.
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
                icon={RefreshCw} 
                title="Parser Local" 
                desc="Regista gastos offline com frases naturais."
              />
              <FeatureCard 
                icon={Clock} 
                title="Fixas" 
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
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Database className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase">Offline-First</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">Uso de IndexedDB para que os teus dados funcionem sem internet, instantaneamente.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase">Cloud Sync</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">Sincronização segura via Google Firebase com encriptação de ponta a ponta.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Lock className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase">Privacidade Total</h4>
                    <p className="text-[10px] text-muted-foreground leading-tight">Os teus dados financeiros pertencem-te. Não partilhamos dados com terceiros.</p>
                  </div>
                </div>
              </div>
              <Globe className="absolute -right-6 -bottom-6 h-24 w-24 text-muted/5 -rotate-12" />
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Porquê usar?</h3>
            </div>
            <div className="space-y-3">
              <BenefitItem 
                title="Clareza Imediata" 
                desc="Sabe exatamente para onde vai o teu Kwanza com gráficos intuitivos."
              />
              <BenefitItem 
                title="Economia de Tempo" 
                desc="Regista gastos em 2 segundos com o parser de linguagem natural."
              />
              <BenefitItem 
                title="Paz de Espírito" 
                desc="Recebe alertas de contas fixas e evita multas por atraso."
              />
            </div>
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
              No KwanzaKeeper, tratamos os teus dados financeiros com o mesmo rigor que guardamos o nosso próprio Kwanza. Esta política detalha como protegemos a tua soberania financeira.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Database className="h-3 w-3" />
              1. Coleta de Dados
            </h3>
            <Card className="p-5 bg-card/40 border-muted space-y-4 rounded-2xl">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Coletamos apenas o estritamente necessário para o funcionamento do assistente:
              </p>
              <ul className="space-y-2">
                <li className="flex gap-2 items-start text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><strong>Registos Financeiros:</strong> Valores, categorias, datas e descrições dos teus gastos.</span>
                </li>
                <li className="flex gap-2 items-start text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><strong>Informações de Conta:</strong> E-mail e nome (apenas se criares conta Cloud) para sincronização.</span>
                </li>
                <li className="flex gap-2 items-start text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><strong>Preferências:</strong> Orçamento mensal e dia de fecho de relatório.</span>
                </li>
              </ul>
              <div className="bg-primary/5 p-3 rounded-xl border border-primary/10">
                <p className="text-[10px] italic text-primary">Exemplo: Se registares "2000kz almoço", essa informação é usada para calcular o teu gasto diário e gerar o gráfico de alimentação.</p>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Lock className="h-3 w-3" />
              2. Armazenamento e Segurança
            </h3>
            <div className="grid gap-3">
              <Card className="p-4 bg-card/40 border-muted rounded-2xl">
                <h4 className="text-xs font-black uppercase mb-2 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-blue-400" />
                  Modo Offline (Guest)
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Os teus dados nunca saem do teu telemóvel. São guardados no <strong>IndexedDB</strong>, uma base de dados local segura. Se limpares o cache do navegador ou perderes o telefone, os dados perdem-se.
                </p>
              </Card>
              <Card className="p-4 bg-card/40 border-muted rounded-2xl">
                <h4 className="text-xs font-black uppercase mb-2 flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                  Modo Cloud (Sincronizado)
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Os dados são encriptados e sincronizados via <strong>Firebase (Google Cloud)</strong>. Utilizamos certificados SSL/TLS de ponta a ponta para garantir que ninguém intercepta as tuas finanças.
                </p>
              </Card>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              3. Uso Responsável de IA
            </h3>
            <Card className="p-5 bg-card/40 border-muted space-y-4 rounded-2xl">
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-[11px] font-black uppercase">Processamento Gemini</h4>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-1">
                    A IA analisa os teus padrões para gerar alertas e insights. Estes dados são processados de forma anónima e <strong>nunca</strong> são usados para treinar modelos globais ou vendidos a terceiros para publicidade.
                  </p>
                </div>
              </div>
              <div className="p-3 bg-muted/20 rounded-xl border border-muted/50">
                <p className="text-[10px] text-muted-foreground italic">O KwanzaKeeper não partilha os teus dados com bancos, instituições fiscais ou redes de anúncios.</p>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <UserCheck className="h-3 w-3" />
              4. Os Teus Direitos
            </h3>
            <div className="space-y-3">
              <RightItem 
                icon={Eye} 
                title="Transparência" 
                desc="Podes ver e exportar todos os teus dados em PDF ou Excel a qualquer momento."
              />
              <RightItem 
                icon={Trash2} 
                title="Direito ao Esquecimento" 
                desc="Nas definições, tens um botão para apagar todos os teus dados local e cloud permanentemente."
              />
              <RightItem 
                icon={RefreshCw} 
                title="Controlo de Sincronização" 
                desc="Podes escolher usar a app apenas offline, sem nunca criar uma conta cloud."
              />
            </div>
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
                  Como registar gastos sem internet?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  Basta escrever normalmente no campo "Entrada Rápida IA". O motor local reconhece frases como "2000kz taxi" ou "500 matabicho ontem". Os dados ficam salvos no teu telemóvel e sincronizam automaticamente assim que tiveres rede.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="reg-2" className="border-muted bg-card/20 px-4 rounded-xl">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline text-left">
                  O que é o Quick Access e os atalhos?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  São botões na página inicial para registos em 1-clique. O sistema aprende quais são os teus gastos mais comuns. Além disso, nas <strong>Definições</strong>, podes fixar até 3 atalhos manuais (ex: "Táxi 1000kz") que aparecerão sempre no topo.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 px-1">
              <Calendar className="h-3 w-3" />
              Compromissos e Alertas
            </h3>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="comp-1" className="border-muted bg-card/20 px-4 rounded-xl">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline text-left">
                  Como gerir rendas e propinas?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  Vai às <strong>Definições &gt; Despesas Fixas</strong>. Adiciona o teu compromisso, define o valor, o dia de vencimento e a recorrência (mensal, anual, etc). Podes configurar lembretes para ser avisado até 3 dias antes do prazo.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="comp-2" className="border-muted bg-card/20 px-4 rounded-xl">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline text-left">
                  Como funcionam os Alertas de IA?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  A nossa IA analisa o teu ritmo de gastos. Se estiveres a gastar muito cedo no mês ou se houver uma conta fixa importante a vencer, o KwanzaKeeper envia-te um alerta no Dashboard para te ajudar a reequilibrar o orçamento.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 px-1">
              <Cloud className="h-3 w-3" />
              Sincronização e Nuvem
            </h3>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="sync-1" className="border-muted bg-card/20 px-4 rounded-xl">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline text-left">
                  Posso usar a conta em vários telemóveis?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  Sim! Basta criares uma conta Cloud (Google ou E-mail) nas Definições. Todos os teus gastos, atalhos manuais e despesas fixas serão sincronizados em tempo real entre todos os teus dispositivos.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="sync-2" className="border-muted bg-card/20 px-4 rounded-xl">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline text-left">
                  O que acontece se eu apagar a app?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  Se usas o modo **Guest (Visitante)**, os dados perdem-se permanentemente. Se tens uma conta **Cloud**, basta fazeres login novamente para recuperar todo o teu histórico financeiro.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 px-1">
              <FileText className="h-3 w-3" />
              Relatórios e Exportação
            </h3>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="rep-1" className="border-muted bg-card/20 px-4 rounded-xl">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline text-left">
                  Como gerar relatórios PDF ou Excel?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  No ecrã de **Análise** (ícone de gráfico no fundo), clica no botão "Exportar" no topo. Podes escolher PDF para um resumo visual bonito ou Excel para analisares os números detalhadamente numa folha de cálculo.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="rep-2" className="border-muted bg-card/20 px-4 rounded-xl">
                <AccordionTrigger className="text-[11px] font-bold uppercase tracking-tight hover:no-underline text-left">
                  O que é o "Dia do Relatório IA"?
                </AccordionTrigger>
                <AccordionContent className="text-[11px] text-muted-foreground leading-relaxed">
                  É o dia em que o teu mês financeiro termina. Podes ajustar este dia nas Definições (ex: dia 25 se recebes o salário nessa data). Nesse dia, a IA gera um dossier completo com as tendências e dicas de poupança do teu mês.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <Card className="p-4 bg-primary/5 border-primary/10 rounded-2xl flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-black uppercase">Ainda com dúvidas?</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Se não encontraste a resposta aqui, visita a nossa página de <strong>Apoio ao Cliente</strong> para falar diretamente connosco via WhatsApp.</p>
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

function BenefitItem({ title, desc }: any) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-muted/20 border border-muted/50">
      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
      </div>
      <div className="space-y-0.5">
        <h4 className="text-[11px] font-black uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
      </div>
    </div>
  );
}

function RightItem({ icon: Icon, title, desc }: any) {
  return (
    <div className="flex gap-3 p-4 rounded-2xl bg-muted/10 border border-muted/30">
      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="space-y-1">
        <h4 className="text-xs font-black uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] text-muted-foreground leading-tight">{desc}</p>
      </div>
    </div>
  );
}
