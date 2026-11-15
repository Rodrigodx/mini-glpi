package com.rodrigo.miniglpi.service;

import com.rodrigo.miniglpi.dto.AtualizarStatusDTO;
import com.rodrigo.miniglpi.dto.ChamadoDTO;
import com.rodrigo.miniglpi.model.Chamado;
import com.rodrigo.miniglpi.model.Equipamento;
import com.rodrigo.miniglpi.model.StatusKanban;
import com.rodrigo.miniglpi.model.TipoEquipamento;
import com.rodrigo.miniglpi.repository.ChamadoRepository;
import com.rodrigo.miniglpi.repository.EquipamentoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChamadoServiceTest {

    @Mock
    private ChamadoRepository chamadoRepository;

    @Mock
    private EquipamentoRepository equipamentoRepository;

    @InjectMocks
    private ChamadoService chamadoService;

    private Equipamento equipamentoAtivo;

    @BeforeEach
    void setUp() {
        equipamentoAtivo = new Equipamento("VILA-REC-02", TipoEquipamento.MONITOR, "Recepção Principal", true);
        ReflectionTestUtils.setField(equipamentoAtivo, "id", 1L);
    }

    @Test
    @DisplayName("RF01: Deve abrir chamado com status ABERTO quando equipamento existe e não há chamado ativo")
    void deveAbrirChamadoComSucesso() {
        ChamadoDTO dto = new ChamadoDTO("  vila-rec-02 ", "Monitor não liga após queda de energia");

        when(equipamentoRepository.findByTagPatrimonioIgnoreCase("vila-rec-02"))
                .thenReturn(Optional.of(equipamentoAtivo));
        when(chamadoRepository.existsByEquipamentoIdAndStatusKanbanIn(1L, List.of(StatusKanban.ABERTO, StatusKanban.EM_ANDAMENTO)))
                .thenReturn(false);
        when(chamadoRepository.save(any(Chamado.class))).thenAnswer(inv -> {
            Chamado salvo = inv.getArgument(0);
            ReflectionTestUtils.setField(salvo, "id", 10L);
            return salvo;
        });

        Chamado resultado = chamadoService.abrirchamado(dto);

        assertNotNull(resultado);
        assertEquals(10L, resultado.getId());
        assertEquals(StatusKanban.ABERTO, resultado.getStatusKanban());
        assertEquals("Monitor não liga após queda de energia", resultado.getDescricaoProblema());
        assertEquals("VILA-REC-02", resultado.getEquipamento().getTagPatrimonio());
        verify(chamadoRepository).save(any(Chamado.class));
    }

    @Test
    @DisplayName("RNF03: Deve lançar 404 NOT_FOUND quando a tag de patrimônio não existir")
    void deveRejeitarTagInexistente() {
        ChamadoDTO dto = new ChamadoDTO("TAG-INEXISTENTE", "Computador sem rede");

        when(equipamentoRepository.findByTagPatrimonioIgnoreCase("TAG-INEXISTENTE"))
                .thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> chamadoService.abrirchamado(dto));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(chamadoRepository, never()).save(any());
    }

    @Test
    @DisplayName("RNF03: Deve lançar 404 NOT_FOUND quando equipamento estiver inativo na rede")
    void deveRejeitarEquipamentoInativo() {
        Equipamento inativo = new Equipamento("VILA-OLD-99", TipoEquipamento.DESKTOP, "Almoxarifado", false);
        ChamadoDTO dto = new ChamadoDTO("VILA-OLD-99", "Equipamento não inicializa");

        when(equipamentoRepository.findByTagPatrimonioIgnoreCase("VILA-OLD-99"))
                .thenReturn(Optional.of(inativo));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> chamadoService.abrirchamado(dto));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(chamadoRepository, never()).save(any());
    }

    @Test
    @DisplayName("RF01/RNF03: Deve lançar 409 CONFLICT quando equipamento já possui chamado ABERTO ou EM_ANDAMENTO")
    void deveBloquearChamadoDuplicadoParaMesmoEquipamento() {
        ChamadoDTO dto = new ChamadoDTO("VILA-REC-02", "Tela piscando intermitentemente");

        when(equipamentoRepository.findByTagPatrimonioIgnoreCase("VILA-REC-02"))
                .thenReturn(Optional.of(equipamentoAtivo));
        when(chamadoRepository.existsByEquipamentoIdAndStatusKanbanIn(1L, List.of(StatusKanban.ABERTO, StatusKanban.EM_ANDAMENTO)))
                .thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> chamadoService.abrirchamado(dto));

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(chamadoRepository, never()).save(any());
    }

    @Test
    @DisplayName("RF03: Deve lançar 400 BAD_REQUEST ao tentar concluir chamado com laudo técnico menor ou igual a 10 caracteres")
    void deveExigirLaudoTecnicoMinimoAoConcluir() {
        Chamado chamadoExistente = new Chamado();
        ReflectionTestUtils.setField(chamadoExistente, "id", 5L);
        chamadoExistente.setEquipamento(equipamentoAtivo);
        chamadoExistente.setStatusKanban(StatusKanban.EM_ANDAMENTO);

        when(chamadoRepository.findById(5L)).thenReturn(Optional.of(chamadoExistente));

        AtualizarStatusDTO dtoCurto = new AtualizarStatusDTO(StatusKanban.CONCLUIDO, "Resolvido.");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> chamadoService.atualizarStatus(5L, dtoCurto));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(chamadoRepository, never()).save(any());
    }

    @Test
    @DisplayName("RF03: Deve concluir chamado e salvar relatório técnico quando laudo tiver mais de 10 caracteres")
    void deveConcluirChamadoComLaudoValido() {
        Chamado chamadoExistente = new Chamado();
        ReflectionTestUtils.setField(chamadoExistente, "id", 5L);
        chamadoExistente.setEquipamento(equipamentoAtivo);
        chamadoExistente.setStatusKanban(StatusKanban.EM_ANDAMENTO);

        when(chamadoRepository.findById(5L)).thenReturn(Optional.of(chamadoExistente));
        when(chamadoRepository.save(any(Chamado.class))).thenAnswer(inv -> inv.getArgument(0));

        AtualizarStatusDTO dtoValido = new AtualizarStatusDTO(
                StatusKanban.CONCLUIDO,
                "Substituído cabo HDMI danificado e testado sinal de vídeo."
        );

        Chamado atualizado = chamadoService.atualizarStatus(5L, dtoValido);

        assertEquals(StatusKanban.CONCLUIDO, atualizado.getStatusKanban());
        assertEquals("Substituído cabo HDMI danificado e testado sinal de vídeo.", atualizado.getRelatorioTecnico());
        verify(chamadoRepository).save(chamadoExistente);
    }
}
