export type StatusKanban = 'ABERTO' | 'EM_ANDAMENTO' | 'CONCLUIDO';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}

export interface AbrirChamadoRequest {
  tagPatrimonio: string;
  descricaoProblema: string;
}

export interface AtualizarStatusRequest {
  statusKanban: StatusKanban;
  relatorioTecnico?: string;
}

export interface EquipamentoResumo {
  id?: number;
  tagPatrimonio: string;
  tipo?: string;
  localizacao?: string;
}

export interface Chamado {
  id: number;
  equipamento: EquipamentoResumo;
  descricaoProblema: string;
  statusKanban: StatusKanban;
  relatorioTecnico?: string;
  dataAbertura?: string;
}
