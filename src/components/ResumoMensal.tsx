import { useMemo } from 'react';
import { ViagemCalculada, ResumoFinanceiro } from '../types';
import { formatarMesLegivel, obterMesAtualIso } from '../utils/viagens';
import {
  TrendingUp,
  TrendingDown,
  Navigation,
  DollarSign,
  Fuel,
  Receipt,
  Users,
  PieChart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Trophy,
  Gauge,
  MoreHorizontal,
} from 'lucide-react';

interface ResumoMensalProps {
  resumo: ResumoFinanceiro;
  viagensFiltradas: ViagemCalculada[];
  filtroMes: string;
  onFiltroMesChange: (mes: string) => void;
  onIrParaViagens: () => void;
}

export function ResumoMensal({
  resumo,
  viagensFiltradas,
  filtroMes,
  onFiltroMesChange,
  onIrParaViagens,
}: ResumoMensalProps) {
  // Sum breakdown of categories
  const despesasCombustivel = viagensFiltradas.reduce(
    (acc, v) => acc + (v.combustivel || 0),
    0
  );
  const despesasPedagios = viagensFiltradas.reduce(
    (acc, v) => acc + (v.pedagios || 0),
    0
  );
  const despesasAjudante = viagensFiltradas.reduce(
    (acc, v) => acc + (v.ajudante || 0),
    0
  );
  const despesasOutros = viagensFiltradas.reduce(
    (acc, v) => acc + (v.outros || 0),
    0
  );

  const margemLucro =
    resumo.totalFrete > 0 ? (resumo.totalSaldo / resumo.totalFrete) * 100 : 0;

  // Next / Previous month navigators
  const mudarMes = (delta: number) => {
    if (!filtroMes) {
      const hoje = obterMesAtualIso();
      onFiltroMesChange(hoje);
      return;
    }
    const [anoStr, mesStr] = filtroMes.split('-');
    const ano = parseInt(anoStr, 10);
    const mes = parseInt(mesStr, 10) - 1; // 0-indexed
    const novaData = new Date(ano, mes + delta, 1);
    const novoMesStr = `${novaData.getFullYear()}-${String(novaData.getMonth() + 1).padStart(2, '0')}`;
    onFiltroMesChange(novoMesStr);
  };

  // Top profitable trips
  const topViagensLucrativas = useMemo(() => {
    return [...viagensFiltradas]
      .sort((a, b) => b.saldoFinal - a.saldoFinal)
      .slice(0, 3);
  }, [viagensFiltradas]);

  // Proportions of expenses
  const pctCombustivel =
    resumo.totalGastos > 0 ? (despesasCombustivel / resumo.totalGastos) * 100 : 0;
  const pctPedagios =
    resumo.totalGastos > 0 ? (despesasPedagios / resumo.totalGastos) * 100 : 0;
  const pctAjudante =
    resumo.totalGastos > 0 ? (despesasAjudante / resumo.totalGastos) * 100 : 0;
  const pctOutros =
    resumo.totalGastos > 0 ? (despesasOutros / resumo.totalGastos) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Month Navigator Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {filtroMes ? formatarMesLegivel(filtroMes) : 'Todos os Períodos'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {resumo.totalViagens} {resumo.totalViagens === 1 ? 'viagem' : 'viagens'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Indicadores consolidados, despesas operacionais e margem de faturamento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {filtroMes && (
            <button
              type="button"
              onClick={() => mudarMes(-1)}
              title="Mês anterior"
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <input
            type="month"
            value={filtroMes}
            onChange={(e) => onFiltroMesChange(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden bg-slate-50 cursor-pointer text-slate-800"
          />

          {filtroMes && (
            <button
              type="button"
              onClick={() => mudarMes(1)}
              title="Próximo mês"
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {filtroMes && (
            <button
              type="button"
              onClick={() => onFiltroMesChange('')}
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              Ver geral
            </button>
          )}
        </div>
      </div>

      {/* Main Resumo Card */}
      <div id="resumo" className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Frete */}
          <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Total de Frete
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-900 font-mono">
              R$ <span id="resumo-frete">{resumo.totalFrete.toFixed(2)}</span>
            </div>
            <p className="text-xs text-emerald-700 mt-1 font-medium">Receita bruta gerada</p>
          </div>

          {/* Total de Gastos */}
          <div className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                Total de Gastos
              </span>
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-900 font-mono">
              R$ <span id="resumo-gastos">{resumo.totalGastos.toFixed(2)}</span>
            </div>
            <p className="text-xs text-rose-700 mt-1 font-medium">Custos e despesas gerais</p>
          </div>

          {/* Saldo Final (Lucro) */}
          <div
            className={`p-4 rounded-xl border ${
              resumo.totalSaldo >= 0
                ? 'border-emerald-300 bg-emerald-50/80'
                : 'border-rose-300 bg-rose-50/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  resumo.totalSaldo >= 0 ? 'text-emerald-900' : 'text-rose-900'
                }`}
              >
                Saldo Final (Lucro)
              </span>
              <div
                className={`p-1.5 rounded-lg ${
                  resumo.totalSaldo >= 0
                    ? 'bg-emerald-200/70 text-emerald-800'
                    : 'bg-rose-200/70 text-rose-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div
              className={`text-2xl font-bold font-mono ${
                resumo.totalSaldo >= 0 ? 'text-emerald-900' : 'text-rose-900'
              }`}
            >
              R$ <span id="resumo-saldo">{resumo.totalSaldo.toFixed(2)}</span>
            </div>
            <p
              className={`text-xs mt-1 font-semibold ${
                resumo.totalSaldo >= 0 ? 'text-emerald-800' : 'text-rose-800'
              }`}
            >
              Margem de Lucro: {margemLucro.toFixed(1)}%
            </p>
          </div>

          {/* Eficiência & Distância */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Eficiência / KM
              </span>
              <div className="p-1.5 rounded-lg bg-slate-200/80 text-slate-700">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              R$ <span id="resumo-media-km">{resumo.mediaCustoKm.toFixed(2)}</span>
              <span className="text-xs font-normal text-slate-500 ml-1">/km</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              <strong className="font-mono text-slate-800" id="resumo-km">{resumo.totalKm}</strong> km percorridos em{' '}
              <strong id="resumo-viagens">{resumo.totalViagens}</strong> viagens
            </p>
          </div>
        </div>

        {/* Expense Composition Bar & Breakdown Cards */}
        {resumo.totalGastos > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-emerald-600" />
                Composição de Custos Operacionais
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                Total: R$ {resumo.totalGastos.toFixed(2)}
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex mb-4 shadow-xs">
              {pctCombustivel > 0 && (
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${pctCombustivel}%` }}
                  title={`Combustível: ${pctCombustivel.toFixed(1)}%`}
                />
              )}
              {pctPedagios > 0 && (
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${pctPedagios}%` }}
                  title={`Pedágios: ${pctPedagios.toFixed(1)}%`}
                />
              )}
              {pctAjudante > 0 && (
                <div
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${pctAjudante}%` }}
                  title={`Ajudante: ${pctAjudante.toFixed(1)}%`}
                />
              )}
              {pctOutros > 0 && (
                <div
                  className="h-full bg-slate-500 transition-all duration-300"
                  style={{ width: `${pctOutros}%` }}
                  title={`Outros: ${pctOutros.toFixed(1)}%`}
                />
              )}
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Fuel className="w-3.5 h-3.5 text-amber-600" />
                    <span>Combustível</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 font-mono">
                    {pctCombustivel.toFixed(1)}%
                  </span>
                </div>
                <div className="font-bold text-slate-900 font-mono text-base">
                  R$ {despesasCombustivel.toFixed(2)}
                </div>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Pedágios</span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 font-mono">
                    {pctPedagios.toFixed(1)}%
                  </span>
                </div>
                <div className="font-bold text-slate-900 font-mono text-base">
                  R$ {despesasPedagios.toFixed(2)}
                </div>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ajudante</span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 font-mono">
                    {pctAjudante.toFixed(1)}%
                  </span>
                </div>
                <div className="font-bold text-slate-900 font-mono text-base">
                  R$ {despesasAjudante.toFixed(2)}
                </div>
              </div>

              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <MoreHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Outros</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 font-mono">
                    {pctOutros.toFixed(1)}%
                  </span>
                </div>
                <div className="font-bold text-slate-900 font-mono text-base">
                  R$ {despesasOutros.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Profitable Trips Highlight */}
        {topViagensLucrativas.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Rotas com Maior Lucro Líquido
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {topViagensLucrativas.map((v, i) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-800 truncate" title={v.cliente}>
                        {v.cliente}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-100 text-emerald-800">
                        {v.porcentagemLucro.toFixed(0)}% lucro
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600 my-1">
                      <span>{v.origem}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-900">{v.destino}</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">{v.kmTotal} km</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      + R$ {v.saldoFinal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onIrParaViagens}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            ← Voltar para a tabela de Viagens
          </button>
        </div>
      </div>
    </div>
  );
}
