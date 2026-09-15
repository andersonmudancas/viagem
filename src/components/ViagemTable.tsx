import { useState, useMemo } from 'react';
import { ViagemCalculada } from '../types';
import {
  Calendar,
  Edit2,
  Trash2,
  Filter,
  MapPin,
  Car,
  Search,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  X,
  Gauge,
  DollarSign,
} from 'lucide-react';

interface ViagemTableProps {
  viagens: ViagemCalculada[];
  filtroMes: string;
  onFiltroMesChange: (mes: string) => void;
  onEditar: (viagem: ViagemCalculada) => void;
  onExcluir: (id: string) => void;
}

export function ViagemTable({
  viagens,
  filtroMes,
  onFiltroMesChange,
  onEditar,
  onExcluir,
}: ViagemTableProps) {
  const [busca, setBusca] = useState('');

  const formatMoedaDisplay = (val: number) => `R$ ${val.toFixed(2)}`;

  // Quick filter by search text (client, origin, destination)
  const viagensFiltradas = useMemo(() => {
    if (!busca.trim()) return viagens;
    const termo = busca.toLowerCase().trim();
    return viagens.filter(
      (v) =>
        v.cliente.toLowerCase().includes(termo) ||
        v.origem.toLowerCase().includes(termo) ||
        v.destino.toLowerCase().includes(termo)
    );
  }, [viagens, busca]);

  // Totals for the current table view
  const totalKmVisivel = useMemo(
    () => viagensFiltradas.reduce((acc, v) => acc + (v.kmTotal || 0), 0),
    [viagensFiltradas]
  );
  const totalFreteVisivel = useMemo(
    () => viagensFiltradas.reduce((acc, v) => acc + (v.frete || 0), 0),
    [viagensFiltradas]
  );
  const totalSaldoVisivel = useMemo(
    () => viagensFiltradas.reduce((acc, v) => acc + (v.saldoFinal || 0), 0),
    [viagensFiltradas]
  );

  return (
    <div id="secao-tabela-viagens" className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cliente, origem ou destino..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden transition"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                id="filtroMes"
                type="month"
                value={filtroMes}
                onChange={(e) => onFiltroMesChange(e.target.value)}
                className="pl-3 pr-2 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden bg-slate-50/70 cursor-pointer text-slate-700 font-medium"
              />
            </div>
            {filtroMes && (
              <button
                type="button"
                onClick={() => onFiltroMesChange('')}
                className="text-xs text-slate-500 hover:text-emerald-700 font-medium px-2 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                Ver geral
              </button>
            )}
          </div>
        </div>

        {/* Quick summary counters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-600">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-sans font-medium">
            <strong>{viagensFiltradas.length}</strong>{' '}
            {viagensFiltradas.length === 1 ? 'viagem' : 'viagens'}
          </span>
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            {totalKmVisivel} km
          </span>
          <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            Saldo: {formatMoedaDisplay(totalSaldoVisivel)}
          </span>
        </div>
      </div>

      {/* Modern Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table id="tabela" className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/90 text-slate-600 border-b border-slate-200/80 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3.5">Cliente</th>
                <th className="py-3 px-3.5">Data</th>
                <th className="py-3 px-3.5">Origem → Destino</th>
                <th className="py-3 px-3.5 text-right">KM Total</th>
                <th className="py-3 px-3.5 text-right">Combustível</th>
                <th className="py-3 px-3.5 text-right">Pedágios</th>
                <th className="py-3 px-3.5 text-right">Outros</th>
                <th className="py-3 px-3.5 text-right">Ajudante</th>
                <th className="py-3 px-3.5 text-right">Gastos Totais</th>
                <th className="py-3 px-3.5 text-right">Custo/KM</th>
                <th className="py-3 px-3.5 text-right">Frete</th>
                <th className="py-3 px-3.5 text-right">Saldo Final</th>
                <th className="py-3 px-3.5 text-right">% Lucro</th>
                <th className="py-3 px-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {viagensFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-14 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2.5 max-w-md mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Car className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">
                        Nenhuma viagem encontrada
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {busca
                          ? `Nenhum resultado para "${busca}". Tente limpar a busca ou mudar os filtros.`
                          : filtroMes
                          ? 'Não há registros para este mês. Altere o filtro acima ou cadastre uma nova viagem.'
                          : 'Adicione suas viagens pelo formulário acima para acompanhar os cálculos.'}
                      </p>
                      {busca && (
                        <button
                          type="button"
                          onClick={() => setBusca('')}
                          className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 bg-emerald-50 rounded-lg transition cursor-pointer"
                        >
                          Limpar busca
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                viagensFiltradas.map((viagem) => {
                  const saldoPositivo = viagem.saldoFinal >= 0;
                  const margem = viagem.porcentagemLucro;

                  // Visual profit badge style
                  let profitBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (margem >= 40) {
                    profitBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (margem >= 20) {
                    profitBadgeClass = 'bg-teal-50 text-teal-700 border-teal-200';
                  } else if (margem >= 0) {
                    profitBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  } else {
                    profitBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                  }

                  return (
                    <tr
                      key={viagem.id}
                      className="hover:bg-slate-50/90 transition-colors group"
                      data-mes={viagem.mes}
                      data-km-total={viagem.kmTotal}
                    >
                      {/* Cliente */}
                      <td className="py-3 px-3.5 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {viagem.cliente.charAt(0).toUpperCase()}
                          </span>
                          <span className="truncate max-w-[150px]" title={viagem.cliente}>
                            {viagem.cliente}
                          </span>
                        </div>
                      </td>

                      {/* Data */}
                      <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap font-medium text-xs">
                        {viagem.dataFormatada}
                      </td>

                      {/* Origem -> Destino */}
                      <td className="py-3 px-3.5 text-slate-800 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs">
                          <span className="font-medium text-slate-700">{viagem.origem}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-900">{viagem.destino}</span>
                        </div>
                      </td>

                      {/* KM Total */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono font-medium text-xs">
                          {viagem.kmTotal} km
                        </span>
                      </td>

                      {/* Combustível */}
                      <td className="py-3 px-3.5 text-right text-slate-600 whitespace-nowrap font-mono text-xs">
                        {formatMoedaDisplay(viagem.combustivel)}
                      </td>

                      {/* Pedágios */}
                      <td className="py-3 px-3.5 text-right text-slate-600 whitespace-nowrap font-mono text-xs">
                        {formatMoedaDisplay(viagem.pedagios)}
                      </td>

                      {/* Outros */}
                      <td className="py-3 px-3.5 text-right text-slate-600 whitespace-nowrap font-mono text-xs">
                        {formatMoedaDisplay(viagem.outros)}
                      </td>

                      {/* Ajudante */}
                      <td className="py-3 px-3.5 text-right text-slate-600 whitespace-nowrap font-mono text-xs">
                        {formatMoedaDisplay(viagem.ajudante)}
                      </td>

                      {/* Gastos Totais */}
                      <td className="py-3 px-3.5 text-right font-semibold text-rose-600 whitespace-nowrap font-mono text-xs">
                        {formatMoedaDisplay(viagem.totalGastos)}
                      </td>

                      {/* Custo/KM */}
                      <td className="py-3 px-3.5 text-right text-slate-600 whitespace-nowrap font-mono text-xs">
                        {formatMoedaDisplay(viagem.custoPorKm)}
                      </td>

                      {/* Frete */}
                      <td className="py-3 px-3.5 text-right font-bold text-emerald-700 whitespace-nowrap font-mono">
                        {formatMoedaDisplay(viagem.frete)}
                      </td>

                      {/* Saldo Final */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <span
                          className={`font-bold font-mono ${
                            saldoPositivo ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {formatMoedaDisplay(viagem.saldoFinal)}
                        </span>
                      </td>

                      {/* % Lucro */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold font-mono border ${profitBadgeClass}`}
                        >
                          {margem >= 0 ? (
                            <TrendingUp className="w-3 h-3 shrink-0" />
                          ) : (
                            <TrendingDown className="w-3 h-3 shrink-0" />
                          )}
                          {margem >= 0 ? '+' : ''}
                          {margem.toFixed(1)}%
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditar(viagem)}
                            title="Editar viagem"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onExcluir(viagem.id)}
                            title="Excluir viagem"
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
