export type SchedulingStatus = 'Marcado' | 'Concluído' | 'Cancelado';

export type SchedulingFilterField = 'Nome do Cliente' | 'Data' | 'Status';
export type ClientSearchField = 'Nome' | 'E-mail' | 'CPF';

export interface ClientDoc {
    id: string;
    nomeCompleto: string;
    email: string;
    cpf: string;
    telefone?: string;
    endereco?: string;
    dataNascimento?: string;
    tipoUsuario?: 'funcionario' | 'cliente';
    statusAtivo?: boolean;
}

export interface SchedulingDoc {
    id: string;
    clienteId: string;
    clienteNome: string;
    clienteEmail: string;
    clienteCpf: string;
    clienteEndereco: string;
    clienteTelefone?: string;

    dataAgendada: string; // DD/MM/AAAA
    horaAgendada: string; // HH:MM
    scheduledAt: number;  // timestamp em ms

    status: SchedulingStatus;
    observacoes?: string;

    createdAt: number;
    updatedAt: number;
    concludedAt?: number;
    canceledAt?: number;
    rescheduledAt?: number;
}