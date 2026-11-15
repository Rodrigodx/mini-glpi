package com.rodrigo.miniglpi.config;

import com.rodrigo.miniglpi.model.*;
import com.rodrigo.miniglpi.repository.ChamadoRepository;
import com.rodrigo.miniglpi.repository.EquipamentoRepository;
import com.rodrigo.miniglpi.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final ChamadoRepository chamadoRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           EquipamentoRepository equipamentoRepository,
                           ChamadoRepository chamadoRepository,
                           PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.chamadoRepository = chamadoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            usuarioRepository.save(new Usuario(
                    "João Silva",
                    "joao.silva@vilaolimpica.org.br",
                    passwordEncoder.encode("VilaOlimpica@2026")
            ));
        }

        if (equipamentoRepository.count() == 0) {
            equipamentoRepository.save(new Equipamento(
                    "VILA-REC-02", TipoEquipamento.MONITOR, "Recepção Principal", true
            ));
            Equipamento adm05 = equipamentoRepository.save(new Equipamento(
                    "VILA-ADM-05", TipoEquipamento.DESKTOP, "Administração", true
            ));

            Chamado chamadoExemplo = new Chamado();
            chamadoExemplo.setEquipamento(adm05);
            chamadoExemplo.setDescricaoProblema("Teclado falhando teclas");
            chamadoExemplo.setStatusKanban(StatusKanban.EM_ANDAMENTO);
            chamadoRepository.save(chamadoExemplo);
        }
    }
}
