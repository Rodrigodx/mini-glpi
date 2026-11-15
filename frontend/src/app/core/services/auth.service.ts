import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../../models/chamado.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly tokenKey = 'miniglpi_jwt';

  readonly autenticado = signal<boolean>(!!this.obterToken());

  login(credenciais: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credenciais).pipe(
      tap((res) => {
        localStorage.setItem(this.tokenKey, res.token);
        this.autenticado.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.autenticado.set(false);
    this.router.navigate(['/login']);
  }

  obterToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}