package com.rodrigo.miniglpi.controller;

import com.rodrigo.miniglpi.dto.AtualizarStatusDTO;
import com.rodrigo.miniglpi.dto.ChamadoDTO;
import com.rodrigo.miniglpi.model.Chamado;
import com.rodrigo.miniglpi.service.ChamadoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chamados")
public class ChamadoController {

    private final ChamadoService service;

    public ChamadoController(ChamadoService service) {
        this.service = service;
    }

    // RF01 + RNF03: Público para abertura na recepção
    @PostMapping
    public ResponseEntity<Chamado> abrir(@Valid @RequestBody ChamadoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.abrirchamado(dto));
    }

    // RF02 + RNF01: Protegido por JWT (Kanban da TI)
    @GetMapping
    public ResponseEntity<List<Chamado>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    // RF04 (Desejável): Histórico por Tag
    @GetMapping("/equipamento/{tag}")
    public ResponseEntity<List<Chamado>> historicoPorTag(@PathVariable String tag) {
        return ResponseEntity.ok(service.buscarHistoricoPorTag(tag));
    }

    // RF03 + RNF01: Protegido por JWT (Atualiza status e exige laudo > 10 chars ao concluir)
    @PutMapping("/{id}/status")
    public ResponseEntity<Chamado> atualizarStatus(@PathVariable Long id, @Valid @RequestBody AtualizarStatusDTO dto) {
        return ResponseEntity.ok(service.atualizarStatus(id, dto));
    }
    
}
