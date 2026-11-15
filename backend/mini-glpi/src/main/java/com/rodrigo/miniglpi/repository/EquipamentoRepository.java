package com.rodrigo.miniglpi.repository;

import com.rodrigo.miniglpi.model.Equipamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EquipamentoRepository extends JpaRepository<Equipamento, Long> {
    Optional<Equipamento> findByTagPatrimonioIgnoreCase(String tagPatrimonio);

}
