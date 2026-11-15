import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChamadoService } from '../../core/services/chamado.service';
import { Chamado } from '../../models/chamado.model';

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section aria-labelledby="titulo-kanban">
      <header class="kanban-header">
        <div>
          <h1 id="titulo-kanban">Painel de Chamados (Kanban)</h1>
          <p class="subtitle">Acompanhe, assuma atendimentos e registre o relatório técnico ao encerrar.</p>
        </div>
        <button type="button" class="btn btn-secondary" (click)="carregarChamados()" [disabled]="carregando()">
          {{ carregando() ? 'Atualizando...' : 'Atualizar Lista' }}
        </button>
      </header>

      @if (erroGeral()) {
        <div class="alert alert-error" role="alert">{{ erroGeral() }}</div>
      }

      <div class="kanban-board">
        <!-- Coluna 1: ABERTO -->
        <div class="kanban-column" aria-labelledby="col-aberto">
          <div class="column-header status-aberto">
            <h2 id="col-aberto">Abertos</h2>
            <span class="badge">{{ abertos().length }}</span>
          </div>

          <div class="column-body">
            @for (item of abertos(); track item.id) {
              <article class="ticket-card">
                <div class="ticket-top">
                  <span class="tag-pill">{{ item.equipamento.tagPatrimonio }}</span>
                  <span class="ticket-id">#{{ item.id }}</span>
                </div>
                <p class="ticket-desc">{{ item.descricaoProblema }}</p>
                @if (item.equipamento.localizacao) {
                  <p class="ticket-meta">Local: <strong>{{ item.equipamento.localizacao }}</strong></p>
                }

                <button type="button" class="btn btn-primary btn-sm" (click)="iniciar(item)">
                  Iniciar Atendimento
                </button>
              </article>
            } @empty {
              <p class="empty-state">Nenhum chamado aguardando atendimento.</p>
            }
          </div>
        </div>

        <!-- Coluna 2: EM_ANDAMENTO -->
        <div class="kanban-column" aria-labelledby="col-andamento">
          <div class="column-header status-andamento">
            <h2 id="col-andamento">Em Andamento</h2>
            <span class="badge">{{ emAndamento().length }}</span>
          </div>

          <div class="column-body">
            @for (item of emAndamento(); track item.id) {
              <article class="ticket-card">
                <div class="ticket-top">
                  <span class="tag-pill">{{ item.equipamento.tagPatrimonio }}</span>
                  <span class="ticket-id">#{{ item.id }}</span>
                </div>
                <p class="ticket-desc">{{ item.descricaoProblema }}</p>
                @if (item.equipamento.localizacao) {
                  <p class="ticket-meta">Local: <strong>{{ item.equipamento.localizacao }}</strong></p>
                }

                <button type="button" class="btn btn-success btn-sm" (click)="abrirModalEncerramento(item)">
                  Encerrar com Laudo
                </button>
              </article>
            } @empty {
              <p class="empty-state">Nenhum chamado em andamento.</p>
            }
          </div>
        </div>

        <!-- Coluna 3: CONCLUIDO -->
        <div class="kanban-column" aria-labelledby="col-concluido">
          <div class="column-header status-concluido">
            <h2 id="col-concluido">Concluídos</h2>
            <span class="badge">{{ concluidos().length }}</span>
          </div>

          <div class="column-body">
            @for (item of concluidos(); track item.id) {
              <article class="ticket-card ticket-done">
                <div class="ticket-top">
                  <span class="tag-pill">{{ item.equipamento.tagPatrimonio }}</span>
                  <span class="ticket-id">#{{ item.id }}</span>
                </div>
                <p class="ticket-desc">{{ item.descricaoProblema }}</p>
                @if (item.relatorioTecnico) {
                  <div class="laudo-box">
                    <strong>Relatório Técnico:</strong>
                    <p>{{ item.relatorioTecnico }}</p>
                  </div>
                }
              </article>
            } @empty {
              <p class="empty-state">Nenhum chamado concluído ainda.</p>
            }
          </div>
        </div>
      </div>

      <!-- Modal Acessível de Encerramento com Laudo -->
      @if (chamadoSelecionado(); as chamado) {
        <div class="modal-backdrop" (click)="fecharModal()">
          <div
            class="modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-laudo"
            (click)="$event.stopPropagation()"
          >
            <header class="modal-header">
              <h2 id="titulo-modal-laudo">Encerrar Chamado #{{ chamado.id }} ({{ chamado.equipamento.tagPatrimonio }})</h2>
              <button type="button" class="btn-close" aria-label="Fechar janela" (click)="fecharModal()">×</button>
            </header>

            <p class="subtitle"><strong>Problema relatado:</strong> {{ chamado.descricaoProblema }}</p>

            @if (erroModal()) {
              <div class="alert alert-error" role="alert">{{ erroModal() }}</div>
            }

            <form [formGroup]="laudoForm" (ngSubmit)="confirmarEncerramento()" novalidate>
              <div class="form-group">
                <label for="relatorioTecnico">Relatório Técnico da Solução *</label>
                <textarea
                  id="relatorioTecnico"
                  rows="4"
                  formControlName="relatorioTecnico"
                  placeholder="Descreva o diagnóstico realizado e a solução aplicada (mínimo 10 caracteres)..."
                ></textarea>
                @if (laudoForm.controls.relatorioTecnico.invalid && laudoForm.controls.relatorioTecnico.touched) {
                  <small class="field-error">O relatório técnico é obrigatório (mínimo 10 caracteres).</small>
                }
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="fecharModal()">Cancelar</button>
                <button type="submit" class="btn btn-success" [disabled]="salvandoLaudo()">
                  {{ salvandoLaudo() ? 'Salvando...' : 'Confirmar Encerramento' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </section>
  `
})
export class KanbanComponent implements OnInit {
  private readonly chamadoService = inject(ChamadoService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly chamados = signal<Chamado[]>([]);
  readonly carregando = signal(false);
  readonly erroGeral = signal<string | null>(null);

  readonly chamadoSelecionado = signal<Chamado | null>(null);
  readonly salvandoLaudo = signal(false);
  readonly erroModal = signal<string | null>(null);

  readonly abertos = computed(() => this.chamados().filter((c) => c.statusKanban === 'ABERTO'));
  readonly emAndamento = computed(() => this.chamados().filter((c) => c.statusKanban === 'EM_ANDAMENTO'));
  readonly concluidos = computed(() => this.chamados().filter((c) => c.statusKanban === 'CONCLUIDO'));

  readonly laudoForm = this.fb.group({
    relatorioTecnico: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit(): void {
    this.carregarChamados();
  }

  carregarChamados(): void {
    this.carregando.set(true);
    this.erroGeral.set(null);

    this.chamadoService.listarChamados().subscribe({
      next: (lista) => {
        this.chamados.set(lista);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erroGeral.set(err?.error?.erro || 'Erro ao carregar os chamados do servidor.');
      }
    });
  }

  iniciar(chamado: Chamado): void {
    this.erroGeral.set(null);
    this.chamadoService.atualizarStatus(chamado.id, { statusKanban: 'EM_ANDAMENTO' }).subscribe({
      next: () => this.carregarChamados(),
      error: (err) => {
        this.erroGeral.set(err?.error?.erro || 'Não foi possível iniciar o atendimento.');
      }
    });
  }

  abrirModalEncerramento(chamado: Chamado): void {
    this.erroModal.set(null);
    this.laudoForm.reset();
    this.chamadoSelecionado.set(chamado);
  }

  fecharModal(): void {
    this.chamadoSelecionado.set(null);
    this.erroModal.set(null);
  }

  confirmarEncerramento(): void {
    const chamado = this.chamadoSelecionado();
    if (!chamado) return;

    if (this.laudoForm.invalid) {
      this.laudoForm.markAllAsTouched();
      return;
    }

    this.salvandoLaudo.set(true);
    this.erroModal.set(null);

    this.chamadoService.atualizarStatus(chamado.id, {
      statusKanban: 'CONCLUIDO',
      relatorioTecnico: this.laudoForm.controls.relatorioTecnico.value.trim()
    }).subscribe({
      next: () => {
        this.salvandoLaudo.set(false);
        this.fecharModal();
        this.carregarChamados();
      },
      error: (err) => {
        this.salvandoLaudo.set(false);
        this.erroModal.set(err?.error?.erro || 'Erro ao encerrar o chamado.');
      }
    });
  }
}
