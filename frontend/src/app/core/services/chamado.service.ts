import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AbrirChamadoRequest, AtualizarStatusRequest, Chamado } from '../../models/chamado.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChamadoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/chamados`;

  abrirChamado(dados: AbrirChamadoRequest) {
    return this.http.post<Chamado>(this.apiUrl, dados);
  }

  listarChamados() {
    return this.http.get<Chamado[]>(this.apiUrl);
  }

  atualizarStatus(id: number, payload: AtualizarStatusRequest) {
    return this.http.put<Chamado>(`${this.apiUrl}/${id}/status`, payload);
  }
}
