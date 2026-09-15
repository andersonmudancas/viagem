export interface Viagem {
  id: string;
  cliente: string;
  data: string; // YYYY-MM-DD
  origem: string;
  destino: string;
  kmTotal: number;
  combustivel: number;
  pedagios: number;
  outros: number;
  ajudante: number;
  frete: number;
  // Campos legados opcionais para compatibilidade com dados salvos
  contato?: string;
  kmInicial?: number;
  kmFinal?: number;
}

export interface ViagemCalculada extends Viagem {
  kmRodado: number;
  totalGastos: number;
  custoPorKm: number;
  saldoFinal: number;
  porcentagemLucro: number; // Margem de lucro: ((frete - gastos) / frete) * 100
  dataFormatada: string;
  mes: string; // YYYY-MM
}

export interface ResumoFinanceiro {
  totalViagens: number;
  totalKm: number;
  mediaCustoKm: number;
  totalFrete: number;
  totalGastos: number;
  totalSaldo: number;
  margemLucroGeral: number;
}
