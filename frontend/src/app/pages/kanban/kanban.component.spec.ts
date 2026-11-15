import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { KanbanComponent } from './kanban.component';
import { ChamadoService } from '../../core/services/chamado.service';
import { Chamado } from '../../models/chamado.model';

describe('KanbanComponent', () => {
  const listaMock: Chamado[] = [
    { id: 1, equipamento: { tagPatrimonio: 'VILA-REC-02' }, descricaoProblema: 'Sem vídeo', statusKanban: 'ABERTO' },
    { id: 2, equipamento: { tagPatrimonio: 'VILA-ADM-05' }, descricaoProblema: 'Teclado falhando', statusKanban: 'EM_ANDAMENTO' },
    { id: 3, equipamento: { tagPatrimonio: 'VILA-FIN-01' }, descricaoProblema: 'Sem rede', statusKanban: 'CONCLUIDO', relatorioTecnico: 'Cabo RJ45 crimpado novamente.' }
  ];

  const chamadoServiceMock = {
    listarChamados: vi.fn(() => of(listaMock)),
    atualizarStatus: vi.fn()
  };

  beforeEach(async () => {
    chamadoServiceMock.listarChamados.mockClear();
    chamadoServiceMock.atualizarStatus.mockReset();

    await TestBed.configureTestingModule({
      imports: [KanbanComponent],
      providers: [{ provide: ChamadoService, useValue: chamadoServiceMock }]
    }).compileComponents();
  });

  it('deve distribuir chamados corretamente nas colunas ABERTO, EM_ANDAMENTO e CONCLUIDO', () => {
    const fixture = TestBed.createComponent(KanbanComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.abertos().length).toBe(1);
    expect(component.emAndamento().length).toBe(1);
    expect(component.concluidos().length).toBe(1);
  });

  it('não deve concluir chamado se o relatório técnico tiver menos de 10 caracteres', () => {
    const fixture = TestBed.createComponent(KanbanComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.abrirModalEncerramento(listaMock[1]);
    component.laudoForm.setValue({ relatorioTecnico: 'Curto' });
    component.confirmarEncerramento();

    expect(component.laudoForm.invalid).toBe(true);
    expect(chamadoServiceMock.atualizarStatus).not.toHaveBeenCalled();
  });
});
