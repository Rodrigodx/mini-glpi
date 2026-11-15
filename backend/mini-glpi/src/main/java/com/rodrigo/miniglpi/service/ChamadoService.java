package com.rodrigo.miniglpi.service;

import com.rodrigo.miniglpi.dto.AtualizarStatusDTO;
import com.rodrigo.miniglpi.dto.ChamadoDTO;
import com.rodrigo.miniglpi.model.Chamado;
import com.rodrigo.miniglpi.model.Equipamento;
import com.rodrigo.miniglpi.model.StatusKanban;
import com.rodrigo.miniglpi.repository.ChamadoRepository;
import com.rodrigo.miniglpi.repository.EquipamentoRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ChamadoService {
    private final ChamadoRepository chamadoRepository;
    private final EquipamentoRepository equipamentoRepository;

    public ChamadoService(ChamadoRepository chamadoRepository, EquipamentoRepository equipamentoRepository) {
        this.chamadoRepository = chamadoRepository;
        this.equipamentoRepository = equipamentoRepository;
    }

    @Transactional
    public Chamado abrirchamado(ChamadoDTO dto) {
        String tagLimpa = dto.tagPatrimonio().trim();

        Equipamento equipamento = equipamentoRepository.findByTagPatrimonioIgnoreCase(tagLimpa)
                .filter(Equipamento::getAtivoNaRede)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Equipamento não encontrado"
                ));

        boolean jaPossuiChamadoAtivo = chamadoRepository.existsByEquipamentoIdAndStatusKanbanIn(
                equipamento.getId(), List.of(StatusKanban.ABERTO, StatusKanban.EM_ANDAMENTO)
        );

        if (jaPossuiChamadoAtivo) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Já existe um chamado ativo para este equipamento."
            );
        }

        Chamado chamado = new Chamado();
        chamado.setEquipamento(equipamento);
        chamado.setDescricaoProblema(dto.descricaoProblema().trim());
        chamado.setStatusKanban(StatusKanban.ABERTO);

        return chamadoRepository.save(chamado);
    }

    public List<Chamado> listarTodos() {
        return chamadoRepository.findAllByOrderByDataAberturaDesc();
    }

    public List<Chamado> buscarHistoricoPorTag(String tag) {
        return chamadoRepository.findByEquipamentoTagPatrimonioIgnoreCaseOrderByDataAberturaDesc(tag.trim());
    }

    @Transactional
    public Chamado atualizarStatus(Long id, AtualizarStatusDTO dto) {
        Chamado chamado = chamadoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Chamado não encontrado."));

        if (dto.statusKanban() == StatusKanban.CONCLUIDO) {
            String laudo = dto.relatorioTecnico() == null ? "" : dto.relatorioTecnico().trim();
            if (laudo.length() <= 10) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "A descrição da solução é obrigatória (mínimo de 11 caracteres) para encerrar o chamado."
                );
            }
            chamado.setRelatorioTecnico(laudo);
        }

        chamado.setStatusKanban(dto.statusKanban());
        return chamadoRepository.save(chamado);
    }
}
