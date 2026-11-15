package com.rodrigo.miniglpi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChamadoDTO (
        @NotBlank(message = "A Tag do equipamento é obrigatória.")
        @Size(max = 30)
        String tagPatrimonio,

        @NotBlank(message = "A descrição do problema é obrigatória.")
        @Size(max = 1000)
        String descricaoProblema
) {}

