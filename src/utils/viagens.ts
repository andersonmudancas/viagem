import * as XLSX from 'xlsx';
import { Viagem, ViagemCalculada, ResumoFinanceiro } from '../types';

export const STORAGE_KEY = 'viagens';

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function formatarData(dataStr: string): string {
  if (!dataStr) return '';
  const partes = dataStr.split('-');
  if (partes.length === 3) {
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }
  return dataStr;
}

export function parseDataBrParaIso(dataBr: string): string {
  if (!dataBr) return '';
  const partes = dataBr.split('/');
  if (partes.length === 3) {
    const [dia, mes, ano] = partes;
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  return dataBr;
}

export function calcularViagem(v: Viagem): ViagemCalculada {
  // Support kmTotal or fallback to legacy kmFinal - kmInicial
  const kmRodado =
    typeof v.kmTotal === 'number' && !isNaN(v.kmTotal)
      ? Math.max(0, v.kmTotal)
      : Math.max(0, (v.kmFinal || 0) - (v.kmInicial || 0));

  const totalGastos =
    (v.combustivel || 0) +
    (v.pedagios || 0) +
    (v.outros || 0) +
    (v.ajudante || 0);
  const custoPorKm = kmRodado > 0 ? totalGastos / kmRodado : 0;
  const saldoFinal = (v.frete || 0) - totalGastos;
  const porcentagemLucro =
    v.frete && v.frete > 0 ? (saldoFinal / v.frete) * 100 : 0;
  const mes = v.data ? v.data.slice(0, 7) : '';

  return {
    ...v,
    kmTotal: kmRodado,
    kmRodado,
    totalGastos,
    custoPorKm,
    saldoFinal,
    porcentagemLucro,
    dataFormatada: formatarData(v.data),
    mes,
  };
}

export function calcularResumo(viagens: ViagemCalculada[]): ResumoFinanceiro {
  let totalKm = 0;
  let totalFrete = 0;
  let totalGastos = 0;
  let totalSaldo = 0;

  for (const v of viagens) {
    totalKm += v.kmRodado;
    totalFrete += v.frete || 0;
    totalGastos += v.totalGastos;
    totalSaldo += v.saldoFinal;
  }

  const mediaCustoKm = totalKm > 0 ? totalGastos / totalKm : 0;
  const margemLucroGeral =
    totalFrete > 0 ? (totalSaldo / totalFrete) * 100 : 0;

  return {
    totalViagens: viagens.length,
    totalKm,
    mediaCustoKm,
    totalFrete,
    totalGastos,
    totalSaldo,
    margemLucroGeral,
  };
}

export function carregarViagensSalvas(): Viagem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Detect legacy format from user's original HTML script
    if (parsed.length > 0 && 'celulas' in parsed[0]) {
      return parsed.map((item, index) => {
        const c = item.celulas || [];
        const cliente = c[0] || '';
        const dataIso = parseDataBrParaIso(c[2] || '');
        const origemDestino = (c[3] || '').split(' → ');
        const origem = origemDestino[0] || '';
        const destino = origemDestino[1] || '';
        const kmInicial = parseFloat(item.kmInicial) || 0;
        const kmFinal = parseFloat(item.kmFinal) || 0;
        const kmTotal = Math.max(0, kmFinal - kmInicial);
        const cleanNumber = (val: string) => {
          if (!val) return 0;
          return parseFloat(val.replace(/[^0-9.-]+/g, '')) || 0;
        };
        const combustivel = cleanNumber(c[5]);
        const pedagios = cleanNumber(c[6]);
        const outros = cleanNumber(c[7]);
        const ajudante = cleanNumber(c[8]);
        const frete = cleanNumber(c[11]);

        return {
          id: `legacy-${Date.now()}-${index}`,
          cliente,
          data: dataIso,
          origem,
          destino,
          kmTotal,
          combustivel,
          pedagios,
          outros,
          ajudante,
          frete,
        };
      });
    }

    return parsed.map((v) => {
      const km =
        typeof v.kmTotal === 'number' && !isNaN(v.kmTotal)
          ? v.kmTotal
          : Math.max(0, (v.kmFinal || 0) - (v.kmInicial || 0));
      return {
        ...v,
        kmTotal: km,
      };
    });
  } catch (err) {
    console.error('Erro ao carregar viagens do localStorage:', err);
    return [];
  }
}

export function salvarViagensLocalmente(viagens: Viagem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(viagens));
  } catch (err) {
    console.error('Erro ao salvar viagens:', err);
  }
}

export function exportarViagensParaExcel(viagens: ViagemCalculada[]): void {
  const dados = viagens.map((v) => ({
    'Cliente': v.cliente,
    'Data': v.dataFormatada,
    'Origem': v.origem,
    'Destino': v.destino,
    'KM Total': v.kmTotal,
    'Combustível (R$)': v.combustivel,
    'Pedágios (R$)': v.pedagios,
    'Outros (R$)': v.outros,
    'Ajudante (R$)': v.ajudante,
    'Gastos Totais (R$)': v.totalGastos,
    'Custo/KM (R$)': Number(v.custoPorKm.toFixed(2)),
    'Frete (R$)': v.frete,
    'Saldo Final (R$)': Number(v.saldoFinal.toFixed(2)),
    'Lucro (%)': `${v.porcentagemLucro.toFixed(1)}%`,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dados);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 22 }, // Cliente
    { wch: 12 }, // Data
    { wch: 20 }, // Origem
    { wch: 20 }, // Destino
    { wch: 12 }, // KM Total
    { wch: 16 }, // Combustivel
    { wch: 14 }, // Pedagios
    { wch: 14 }, // Outros
    { wch: 14 }, // Ajudante
    { wch: 18 }, // Gastos Totais
    { wch: 14 }, // Custo/KM
    { wch: 14 }, // Frete
    { wch: 16 }, // Saldo Final
    { wch: 14 }, // Lucro (%)
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Viagens');
  XLSX.writeFile(workbook, 'controle_viagens.xlsx');
}

export function obterDataHojeIso(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

export function obterMesAtualIso(): string {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}

export function formatarMesLegivel(anoMes: string): string {
  if (!anoMes) return 'Todos os meses';
  const [ano, mes] = anoMes.split('-');
  const data = new Date(Number(ano), Number(mes) - 1, 1);
  return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}
