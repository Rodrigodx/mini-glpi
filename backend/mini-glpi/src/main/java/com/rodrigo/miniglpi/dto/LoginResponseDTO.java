package com.rodrigo.miniglpi.dto;

public record LoginResponseDTO(
        String token,
        String nome,
        String email
) {}
