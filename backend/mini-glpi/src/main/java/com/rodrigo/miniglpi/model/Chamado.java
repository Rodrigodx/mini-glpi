package com.rodrigo.miniglpi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


import java.time.LocalDateTime;

@Entity
@Table(name = "chamado")
public class Chamado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "equipamento_id", nullable = false)
    private Equipamento equipamento;

    @Column(name = "data_abertura", nullable = false, updatable = false)
    private LocalDateTime dataAbertura = LocalDateTime.now();

    @NotBlank(message = "A descrição do problema é obrigatória.")
    @Size(max = 1000)
    @Column(name = "descricao_problema", nullable = false, length = 1000)
    private String descricaoProblema;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_kanban", nullable = false, length = 20)
    private StatusKanban statusKanban = StatusKanban.ABERTO;

    @Size(max = 1000)
    @Column(name = "relatorio_tecnico", length = 1000)
    private String relatorioTecnico;

    public Chamado() {}

    public Long getId() { return id; }
    public Equipamento getEquipamento() { return equipamento; }
    public LocalDateTime getDataAbertura() { return dataAbertura; }
    public String getDescricaoProblema() { return descricaoProblema; }
    public void setDescricaoProblema(String descricaoProblema) { this.descricaoProblema = descricaoProblema; }
    public StatusKanban getStatusKanban() { return statusKanban; }
    public String getRelatorioTecnico() { return relatorioTecnico; }
    public void setRelatorioTecnico(String relatorioTecnico) { this.relatorioTecnico = relatorioTecnico; }

    public void setId(Long id) {
        this.id = id;
    }

    public void setEquipamento(Equipamento equipamento) {
        this.equipamento = equipamento;
    }

    public void setDataAbertura(LocalDateTime dataAbertura) {
        this.dataAbertura = dataAbertura;
    }

    public void setStatusKanban(StatusKanban statusKanban) {
        this.statusKanban = statusKanban;
    }
}
