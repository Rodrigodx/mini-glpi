package com.rodrigo.miniglpi.service;

import com.rodrigo.miniglpi.dto.LoginDTO;
import com.rodrigo.miniglpi.dto.LoginResponseDTO;
import com.rodrigo.miniglpi.model.Usuario;
import com.rodrigo.miniglpi.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public LoginResponseDTO autenticar(LoginDTO dto) {
        try {
            var auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            dto.email().trim().toLowerCase(),
                            dto.senha()
                    )
            );

            Usuario usuario = (Usuario) auth.getPrincipal();
            String token = jwtService.gerarToken(usuario);

            return new LoginResponseDTO(token, usuario.getNome(), usuario.getEmail());
        } catch (AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha inválidos.");
        }
    }

}
