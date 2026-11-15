import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AberturaChamadoComponent } from './abertura-chamado.component';
import { ChamadoService } from '../../core/services/chamado.service';

describe('AberturaChamadoComponent', () => {
  const chamadoServiceMock = {
    abrirChamado: vi.fn()
  };

  beforeEach(async () => {
    chamadoServiceMock.abrirChamado.mockReset();

    await TestBed.configureTestingModule({
      imports: [AberturaChamadoComponent],
      providers: [{ provide: ChamadoService, useValue: chamadoServiceMock }]
    }).compileComponents();
  });

  it('deve impedir envio quando formulário estiver inválido', () => {
    const fixture = TestBed.createComponent(AberturaChamadoComponent);
    const component = fixture.componentInstance;

    component.enviar();

    expect(component.form.invalid).toBe(true);
    expect(chamadoServiceMock.abrirChamado).not.toHaveBeenCalled();
  });

  it('deve normalizar tag para maiúsculas e registrar chamado com sucesso', () => {
    chamadoServiceMock.abrirChamado.mockReturnValue(
      of({
        id: 12,
        equipamento: { tagPatrimonio: 'VILA-REC-02' },
        descricaoProblema: 'Monitor sem imagem na recepção',
        statusKanban: 'ABERTO'
      })
    );

    const fixture = TestBed.createComponent(AberturaChamadoComponent);
    const component = fixture.componentInstance;

    component.form.setValue({
      tagPatrimonio: '  vila-rec-02 ',
      descricaoProblema: 'Monitor sem imagem na recepção'
    });
    component.enviar();

    expect(chamadoServiceMock.abrirChamado).toHaveBeenCalledWith({
      tagPatrimonio: 'VILA-REC-02',
      descricaoProblema: 'Monitor sem imagem na recepção'
    });
    expect(component.mensagemSucesso()).toContain('VILA-REC-02');
  });
});
