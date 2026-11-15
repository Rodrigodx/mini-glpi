package com.rodrigo.miniglpi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "equipamento")
public class Equipamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "tag_patrimonio", nullable = false, unique = true, length = 30)
    private String tagPatrimonio;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoEquipamento tipoEquipamento;

    @NotBlank
    @Column(name = "setor_localizacao", nullable = false, length = 100)
    private String setorLocalizacao;

    @Column(name = "ativo_na_rede", nullable = false)
    private Boolean ativoNaRede = true;

    public Equipamento() {}

    public Equipamento(String tagPatrimonio, TipoEquipamento tipoEquipamento, String setorLocalizacao, boolean ativoNaRede) {
        this.tagPatrimonio = tagPatrimonio;
        this.tipoEquipamento = tipoEquipamento;
        this.setorLocalizacao = setorLocalizacao;
        this.ativoNaRede = ativoNaRede;
    }

    public Long getId() { return id; }
    public String getTagPatrimonio() { return tagPatrimonio; }
    public void setTagPatrimonio(String tagPatrimonio) { this.tagPatrimonio = tagPatrimonio; }
    public TipoEquipamento getTipo() { return tipoEquipamento; }
    public String getSetorLocalizacao() { return setorLocalizacao; }
    public void setSetorLocalizacao(String setorLocalizacao) { this.setorLocalizacao = setorLocalizacao; }
    public Boolean getAtivoNaRede() { return ativoNaRede; }
    public void setAtivoNaRede(Boolean ativoNaRede) { this.ativoNaRede = ativoNaRede; }

    public void setId(long l) {
    }
}
