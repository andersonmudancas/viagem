import React, { useState, useEffect } from 'react';
import { Viagem } from '../types';
import { obterDataHojeIso } from '../utils/viagens';
import {
  Plus,
  Save,
  X,
  FileSpreadsheet,
  Trash2,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Gauge,
  Fuel,
  Receipt,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';

interface ViagemFormProps {
  editandoViagem: Viagem | null;
  onSalvarViagem: (viagem: Omit<Viagem, 'id'>, idParaAtualizar?: string) => void;
  onCancelarEdicao: () => void;
  onExportarExcel: () => void;
  onLimparTabela: () => void;
  temViagens: boolean;
}

export function ViagemForm({
  editandoViagem,
  onSalvarViagem,
  onCancelarEdicao,
  onExportarExcel,
  onLimparTabela,
  temViagens,
}: ViagemFormProps) {
  const [cliente, setCliente] = useState('');
  const [data, setData] = useState(() => obterDataHojeIso());
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [kmTotal, setKmTotal] = useState<string>('');
  const [combustivel, setCombustivel] = useState<string>('');
  const [pedagios, setPedagios] = useState<string>('');
  const [outros, setOutros] = useState<string>('');
  const [ajudante, setAjudante] = useState<string>('');
  const [frete, setFrete] = useState<string>('');
  const [erro, setErro] = useState<string | null>(null);

  // Set today as default date on new trip creation
  useEffect(() => {
    if (editandoViagem) {
      setCliente(editandoViagem.cliente || '');
      setData(editandoViagem.data || '');
      setOrigem(editandoViagem.origem || '');
      setDestino(editandoViagem.destino || '');
      const kmValor =
        editandoViagem.kmTotal !== undefined
          ? editandoViagem.kmTotal
          : editandoViagem.kmFinal !== undefined && editandoViagem.kmInicial !== undefined
          ? Math.max(0, editandoViagem.kmFinal - editandoViagem.kmInicial)
          : 0;
      setKmTotal(kmValor ? String(kmValor) : '');
      setCombustivel(editandoViagem.combustivel ? String(editandoViagem.combustivel) : '');
      setPedagios(editandoViagem.pedagios ? String(editandoViagem.pedagios) : '');
      setOutros(editandoViagem.outros ? String(editandoViagem.outros) : '');
      setAjudante(editandoViagem.ajudante ? String(editandoViagem.ajudante) : '');
      setFrete(editandoViagem.frete ? String(editandoViagem.frete) : '');
      setErro(null);
    } else {
      limparCampos();
    }
  }, [editandoViagem]);

  const limparCampos = () => {
    setCliente('');
    const hoje = obterDataHojeIso();
    setData(hoje);
    setOrigem('');
    setDestino('');
    setKmTotal('');
    setCombustivel('');
    setPedagios('');
    setOutros('');
    setAjudante('');
    setFrete('');
    setErro(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const c = cliente.trim();
    const d = data.trim();
    const o = origem.trim();
    const dest = destino.trim();

    if (!c || !d || !o || !dest) {
      setErro('Por favor, preencha os campos de Cliente, Data, Origem e Destino.');
      return;
    }

    const nKmTotal = parseFloat(kmTotal) || 0;
    if (nKmTotal < 0) {
      setErro('O KM Total não pode ser negativo.');
      return;
    }

    const novaViagem: Omit<Viagem, 'id'> = {
      cliente: c,
      data: d,
      origem: o,
      destino: dest,
      kmTotal: nKmTotal,
      combustivel: parseFloat(combustivel) || 0,
      pedagios: parseFloat(pedagios) || 0,
      outros: parseFloat(outros) || 0,
      ajudante: parseFloat(ajudante) || 0,
      frete: parseFloat(frete) || 0,
    };

    onSalvarViagem(novaViagem, editandoViagem?.id);

    if (!editandoViagem) {
      limparCampos();
    }
  };

  // Preview calculations
  const numKmTotal = parseFloat(kmTotal) || 0;
  const numCombustivel = parseFloat(combustivel) || 0;
  const numPedagios = parseFloat(pedagios) || 0;
  const numOutros = parseFloat(outros) || 0;
  const numAjudante = parseFloat(ajudante) || 0;

  const totalDespesas = numCombustivel + numPedagios + numOutros + numAjudante;
  const valorFrete = parseFloat(frete) || 0;
  const saldoPrevisto = valorFrete - totalDespesas;
  const lucroPrevisto = valorFrete > 0 ? (saldoPrevisto / valorFrete) * 100 : 0;
  const custoPorKmPrevisto = numKmTotal > 0 ? totalDespesas / numKmTotal : 0;

  // Percentage bar
  const percentGastosNoFrete =
    valorFrete > 0 ? Math.min(100, Math.max(0, (totalDespesas / valorFrete) * 100)) : 0;

  // Margin classification
  const getMargemBadge = () => {
    if (valorFrete === 0) return null;
    if (lucroPrevisto >= 45) {
      return { label: 'Margem Excelente', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (lucroPrevisto >= 20) {
      return { label: 'Margem Saudável', color: 'bg-teal-50 text-teal-700 border-teal-200' };
    }
    if (lucroPrevisto >= 0) {
      return { label: 'Margem Apertada', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Prejuízo Operacional', color: 'bg-rose-50 text-rose-700 border-rose-200' };
  };

  const margemBadge = getMargemBadge();

  return (
    <div
      id="container-formulario"
      className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm transition-all"
    >
      {/* Header with status pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              editandoViagem
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {editandoViagem ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {editandoViagem ? 'Editar Viagem' : 'Cadastrar Nova Viagem'}
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  editandoViagem
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    editandoViagem ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
                {editandoViagem ? 'Edição ativa' : 'Novo registro'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {editandoViagem
                ? 'Modifique os parâmetros e clique em salvar alterações'
                : 'Informe a rota, quilometragem, custos e o frete acordado'}
            </p>
          </div>
        </div>

        {editandoViagem && (
          <button
            type="button"
            onClick={onCancelarEdicao}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Cancelar Edição
          </button>
        )}
      </div>

      {erro && (
        <div
          id="alerta-erro-formulario"
          className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-sm text-rose-800"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{erro}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section 1: Itinerário & Cliente */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              1. Rota e Percurso
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Cliente */}
            <div className="lg:col-span-1 sm:col-span-2 md:col-span-1">
              <label htmlFor="cliente" className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  id="cliente"
                  type="text"
                  required
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Nome do cliente ou empresa"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition"
                />
              </div>
            </div>

            {/* Data */}
            <div>
              <label htmlFor="data" className="block text-xs font-semibold text-slate-700 mb-1">
                Data *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <input
                  id="data"
                  type="date"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition cursor-pointer"
                />
              </div>
            </div>

            {/* Origem */}
            <div>
              <label htmlFor="origem" className="block text-xs font-semibold text-slate-700 mb-1">
                Origem *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <input
                  id="origem"
                  type="text"
                  required
                  value={origem}
                  onChange={(e) => setOrigem(e.target.value)}
                  placeholder="Cidade / Estado de saída"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition"
                />
              </div>
            </div>

            {/* Destino */}
            <div>
              <label htmlFor="destino" className="block text-xs font-semibold text-slate-700 mb-1">
                Destino *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <input
                  id="destino"
                  type="text"
                  required
                  value={destino}
                  onChange={(e) => setDestino(e.target.value)}
                  placeholder="Cidade / Estado de entrega"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition"
                />
              </div>
            </div>

            {/* KM Total */}
            <div>
              <label htmlFor="kmTotal" className="block text-xs font-semibold text-slate-700 mb-1">
                KM Total
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Gauge className="w-3.5 h-3.5" />
                </div>
                <input
                  id="kmTotal"
                  type="number"
                  min="0"
                  step="any"
                  value={kmTotal}
                  onChange={(e) => setKmTotal(e.target.value)}
                  placeholder="Ex: 150"
                  className="w-full pl-8 pr-8 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition font-mono font-medium text-slate-900"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-slate-400 font-mono">
                  km
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Despesas & Frete */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              2. Custos Operacionais e Frete
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {/* Combustível */}
            <div>
              <label htmlFor="combustivel" className="block text-xs font-semibold text-slate-700 mb-1">
                Combustível
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-amber-600">
                  <Fuel className="w-3.5 h-3.5" />
                </div>
                <input
                  id="combustivel"
                  type="number"
                  min="0"
                  step="0.01"
                  value={combustivel}
                  onChange={(e) => setCombustivel(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-2.5 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition font-mono"
                />
              </div>
            </div>

            {/* Pedágios */}
            <div>
              <label htmlFor="pedagios" className="block text-xs font-semibold text-slate-700 mb-1">
                Pedágios
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-indigo-600">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <input
                  id="pedagios"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pedagios}
                  onChange={(e) => setPedagios(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-2.5 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition font-mono"
                />
              </div>
            </div>

            {/* Ajudante */}
            <div>
              <label htmlFor="ajudante" className="block text-xs font-semibold text-slate-700 mb-1">
                Ajudante
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-teal-600">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <input
                  id="ajudante"
                  type="number"
                  min="0"
                  step="0.01"
                  value={ajudante}
                  onChange={(e) => setAjudante(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-2.5 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition font-mono"
                />
              </div>
            </div>

            {/* Outros */}
            <div>
              <label htmlFor="outros" className="block text-xs font-semibold text-slate-700 mb-1">
                Outros Custos
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </div>
                <input
                  id="outros"
                  type="number"
                  min="0"
                  step="0.01"
                  value={outros}
                  onChange={(e) => setOutros(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-2.5 py-2 text-sm bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition font-mono"
                />
              </div>
            </div>

            {/* Frete */}
            <div className="col-span-2 sm:col-span-1 md:col-span-1">
              <label htmlFor="frete" className="block text-xs font-bold text-emerald-900 mb-1">
                Valor do Frete (R$) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-emerald-700">
                  <DollarSign className="w-3.5 h-3.5 font-bold" />
                </div>
                <input
                  id="frete"
                  type="number"
                  min="0"
                  step="0.01"
                  value={frete}
                  onChange={(e) => setFrete(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-2.5 py-2 text-sm bg-emerald-50/40 border border-emerald-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 outline-hidden transition font-mono font-bold text-emerald-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Innovative Live Calculation Dashboard */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/70 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulador Financeiro em Tempo Real</span>
            </div>
            {margemBadge && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${margemBadge.color}`}
              >
                {margemBadge.label} ({lucroPrevisto.toFixed(1)}%)
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
              <span className="text-slate-500 text-[11px] block">Distância</span>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {numKmTotal} km
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
              <span className="text-slate-500 text-[11px] block">Despesas Totais</span>
              <span className="text-sm font-bold text-rose-600 font-mono">
                R$ {totalDespesas.toFixed(2)}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
              <span className="text-slate-500 text-[11px] block">Frete Bruto</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">
                R$ {valorFrete.toFixed(2)}
              </span>
            </div>

            <div className="p-2.5 bg-white rounded-lg border border-slate-200/80">
              <span className="text-slate-500 text-[11px] block">Custo Estimado/KM</span>
              <span className="text-sm font-bold text-slate-700 font-mono">
                R$ {custoPorKmPrevisto.toFixed(2)}
              </span>
            </div>

            <div
              className={`p-2.5 col-span-2 sm:col-span-1 rounded-lg border ${
                saldoPrevisto >= 0
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold">Lucro Líquido</span>
                {saldoPrevisto >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                )}
              </div>
              <span className="text-sm font-bold font-mono block">
                R$ {saldoPrevisto.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Mini Visual Distribution Bar */}
          {valorFrete > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200/60">
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-mono">
                <span>Composição: Gastos ({percentGastosNoFrete.toFixed(0)}%)</span>
                <span>Lucro ({Math.max(0, 100 - percentGastosNoFrete).toFixed(0)}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${percentGastosNoFrete}%` }}
                  title={`Despesas: ${percentGastosNoFrete.toFixed(1)}%`}
                />
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${Math.max(0, 100 - percentGastosNoFrete)}%` }}
                  title={`Lucro: ${(100 - percentGastosNoFrete).toFixed(1)}%`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            id="botao-adicionar"
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl transition-all shadow-xs hover:shadow-sm cursor-pointer"
          >
            {editandoViagem ? (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Adicionar Viagem
              </>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-exportar-excel"
              type="button"
              onClick={onExportarExcel}
              disabled={!temViagens}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              Exportar para Excel
            </button>

            <button
              id="btn-limpar-tabela"
              type="button"
              onClick={onLimparTabela}
              disabled={!temViagens}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50/80 border border-rose-200 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              Limpar Tabela
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
