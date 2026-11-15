package com.rodrigo.miniglpi.repository;

import com.rodrigo.miniglpi.model.Chamado;
import com.rodrigo.miniglpi.model.StatusKanban;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;

@Repository
public interface ChamadoRepository extends JpaRepository<Chamado, Long> {
    boolean existsByEquipamentoIdAndStatusKanbanIn(Long equipamentoId, Collection<StatusKanban> statusKanban);

    List<Chamado> findAllByOrderByDataAberturaDesc();

    List<Chamado> findByEquipamentoTagPatrimonioIgnoreCaseOrderByDataAberturaDesc(String trim);
}
