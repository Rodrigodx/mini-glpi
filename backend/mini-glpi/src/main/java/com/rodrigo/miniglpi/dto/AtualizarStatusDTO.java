package com.rodrigo.miniglpi.dto;

import com.rodrigo.miniglpi.model.StatusKanban;
import jakarta.validation.constraints.NotNull;

public record AtualizarStatusDTO(
        @NotNull(message = "O status é obrigatório.")
        StatusKanban statusKanban,
        String relatorioTecnico
) { }
