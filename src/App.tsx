import { useState, useEffect, useMemo } from 'react';
import { Viagem, ViagemCalculada } from './types';
import {
  carregarViagensSalvas,
  salvarViagensLocalmente,
  calcularViagem,
  calcularResumo,
  exportarViagensParaExcel,
  obterMesAtualIso,
  formatarMesLegivel,
} from './utils/viagens';
import { ViagemForm } from './components/ViagemForm';
import { ViagemTable } from './components/ViagemTable';
import { ResumoMensal } from './components/ResumoMensal';
import { ConfirmModal } from './components/ConfirmModal';
import {
  Truck,
  TableProperties,
  BarChart3,
  Calendar,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'Viagens' | 'Resumo'>('Viagens');
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [editandoViagem, setEditandoViagem] = useState<Viagem | null>(null);
  const [filtroMes, setFiltroMes] = useState<string>(obterMesAtualIso());
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Modal states
  const [modalLimparAberto, setModalLimparAberto] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<string | null>(null);

  // Load initial data on mount
  useEffect(() => {
    const dadosSalvos = carregarViagensSalvas();
    if (dadosSalvos && dadosSalvos.length > 0) {
      setViagens(dadosSalvos);
    } else {
      // Seed initial example data for the current month so user sees a working app immediately
      const mesAtual = obterMesAtualIso();
      const viagensExemplo: Viagem[] = [
        {
          id: 'v1',
          cliente: 'Transportadora ABC',
          data: `${mesAtual}-05`,
          origem: 'São Paulo - SP',
          destino: 'Campinas - SP',
          kmTotal: 110,
          combustivel: 160.0,
          pedagios: 38.5,
          outros: 15.0,
          ajudante: 80.0,
          frete: 650.0,
        },
        {
          id: 'v2',
          cliente: 'Logística Express',
          data: `${mesAtual}-10`,
          origem: 'Campinas - SP',
          destino: 'Santos - SP',
          kmTotal: 190,
          combustivel: 280.0,
          pedagios: 62.0,
          outros: 25.0,
          ajudante: 120.0,
          frete: 1100.0,
        },
        {
          id: 'v3',
          cliente: 'Distribuidora Vale',
          data: `${mesAtual}-12`,
          origem: 'São Paulo - SP',
          destino: 'São José dos Campos - SP',
          kmTotal: 95,
          combustivel: 140.0,
          pedagios: 26.0,
          outros: 0.0,
          ajudante: 0.0,
          frete: 480.0,
        },
      ];
      setViagens(viagensExemplo);
      salvarViagensLocalmente(viagensExemplo);
    }
  }, []);

  const exibirFeedback = (msg: string) => {
    setMensagemSucesso(msg);
    setTimeout(() => {
      setMensagemSucesso(null);
    }, 3500);
  };

  // Calculate values for all trips
  const todasViagensCalculadas: ViagemCalculada[] = useMemo(() => {
    return viagens.map(calcularViagem);
  }, [viagens]);

  // Filter trips by month
  const viagensFiltradas: ViagemCalculada[] = useMemo(() => {
    if (!filtroMes) return todasViagensCalculadas;
    return todasViagensCalculadas.filter((v) => v.mes === filtroMes);
  }, [todasViagensCalculadas, filtroMes]);

  // Summary for filtered trips
  const resumoFiltrado = useMemo(() => {
    return calcularResumo(viagensFiltradas);
  }, [viagensFiltradas]);

  // Add or update trip
  const handleSalvarViagem = (
    dadosViagem: Omit<Viagem, 'id'>,
    idParaAtualizar?: string
  ) => {
    if (idParaAtualizar) {
      // Update existing
      const novasViagens = viagens.map((v) =>
        v.id === idParaAtualizar ? { ...dadosViagem, id: idParaAtualizar } : v
      );
      setViagens(novasViagens);
      salvarViagensLocalmente(novasViagens);
      setEditandoViagem(null);
      exibirFeedback('Viagem atualizada com sucesso!');
    } else {
      // Add new
      const nova: Viagem = {
        ...dadosViagem,
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      };
      const novasViagens = [nova, ...viagens];
      setViagens(novasViagens);
      salvarViagensLocalmente(novasViagens);
      exibirFeedback('Viagem adicionada com sucesso!');
    }
  };

  // Start editing trip
  const handleEditarViagem = (viagem: ViagemCalculada) => {
    setEditandoViagem(viagem);
    setActiveTab('Viagens');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Confirm delete
  const handleSolicitarExcluir = (id: string) => {
    setIdParaExcluir(id);
  };

  const handleConfirmarExcluir = () => {
    if (!idParaExcluir) return;
    const novasViagens = viagens.filter((v) => v.id !== idParaExcluir);
    setViagens(novasViagens);
    salvarViagensLocalmente(novasViagens);
    if (editandoViagem && editandoViagem.id === idParaExcluir) {
      setEditandoViagem(null);
    }
    setIdParaExcluir(null);
    exibirFeedback('Viagem excluída com sucesso.');
  };

  // Confirm clear table
  const handleConfirmarLimparTabela = () => {
    setViagens([]);
    localStorage.removeItem('viagens');
    setEditandoViagem(null);
    setModalLimparAberto(false);
    exibirFeedback('Todos os registros foram apagados.');
  };

  // Export to Excel
  const handleExportarExcel = () => {
    if (viagensFiltradas.length === 0 && todasViagensCalculadas.length === 0) {
      return;
    }
    const paraExportar =
      viagensFiltradas.length > 0 ? viagensFiltradas : todasViagensCalculadas;
    exportarViagensParaExcel(paraExportar);
    exibirFeedback('Relatório Excel gerado e baixado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans antialiased pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Controle de Viagens
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Gestão Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Controle inteligente de fretes, despesas e faturamento
              </p>
            </div>
          </div>

          {/* Quick stats pills in header */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{filtroMes ? formatarMesLegivel(filtroMes) : 'Geral'}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-900 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Saldo:</span>
              <strong className="font-mono">R$ {resumoFiltrado.totalSaldo.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        {/* Tab Navigation Segmented Control */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-1">
          <div className="tab flex items-center gap-2 border-b border-slate-200/80">
            <button
              id="defaultOpen"
              type="button"
              onClick={() => setActiveTab('Viagens')}
              className={`tablinks relative inline-flex items-center gap-2 py-3 px-4 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'Viagens'
                  ? 'text-emerald-700 font-bold active'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableProperties className="w-4 h-4" />
              <span>Viagens</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                {viagensFiltradas.length}
              </span>
              {activeTab === 'Viagens' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('Resumo')}
              className={`tablinks relative inline-flex items-center gap-2 py-3 px-4 text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'Resumo'
                  ? 'text-emerald-700 font-bold active'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Resumo Mensal</span>
              {activeTab === 'Resumo' && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Animated Feedback Toast */}
        <AnimatePresence>
          {mensagemSucesso && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-medium text-emerald-800 flex items-center justify-between gap-3 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{mensagemSucesso}</span>
              </div>
              <button
                type="button"
                onClick={() => setMensagemSucesso(null)}
                className="text-xs text-emerald-700 hover:underline"
              >
                Dispensar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Viagens */}
        {activeTab === 'Viagens' && (
          <motion.div
            id="Viagens"
            key="tab-viagens"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="tabcontent block space-y-6"
          >
            <ViagemForm
              editandoViagem={editandoViagem}
              onSalvarViagem={handleSalvarViagem}
              onCancelarEdicao={() => setEditandoViagem(null)}
              onExportarExcel={handleExportarExcel}
              onLimparTabela={() => setModalLimparAberto(true)}
              temViagens={viagens.length > 0}
            />

            <ViagemTable
              viagens={viagensFiltradas}
              filtroMes={filtroMes}
              onFiltroMesChange={setFiltroMes}
              onEditar={handleEditarViagem}
              onExcluir={handleSolicitarExcluir}
            />
          </motion.div>
        )}

        {/* Tab Resumo */}
        {activeTab === 'Resumo' && (
          <motion.div
            id="Resumo"
            key="tab-resumo"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="tabcontent block"
          >
            <ResumoMensal
              resumo={resumoFiltrado}
              viagensFiltradas={viagensFiltradas}
              filtroMes={filtroMes}
              onFiltroMesChange={setFiltroMes}
              onIrParaViagens={() => setActiveTab('Viagens')}
            />
          </motion.div>
        )}
      </main>

      {/* Modal: Confirm Delete */}
      <ConfirmModal
        isOpen={Boolean(idParaExcluir)}
        title="Excluir Viagem"
        message="Deseja realmente excluir esta viagem? Esta ação é definitiva e removerá o registro do seu histórico."
        confirmLabel="Sim, Excluir"
        cancelLabel="Cancelar"
        danger={true}
        onConfirm={handleConfirmarExcluir}
        onCancel={() => setIdParaExcluir(null)}
      />

      {/* Modal: Confirm Clear All */}
      <ConfirmModal
        isOpen={modalLimparAberto}
        title="Limpar Todos os Registros"
        message="Tem certeza que deseja apagar todos os dados? Todas as viagens registradas serão permanentemente removidas do navegador."
        confirmLabel="Sim, Apagar Tudo"
        cancelLabel="Cancelar"
        danger={true}
        onConfirm={handleConfirmarLimparTabela}
        onCancel={() => setModalLimparAberto(false)}
      />
    </div>
  );
}
