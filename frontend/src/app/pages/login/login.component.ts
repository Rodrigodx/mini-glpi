import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="card card-narrow" aria-labelledby="titulo-login">
      <header class="card-header">
        <h1 id="titulo-login">Acesso Técnico</h1>
        <p class="subtitle">Entre com suas credenciais para gerenciar o painel Kanban de chamados.</p>
      </header>

      @if (erroLogin()) {
        <div class="alert alert-error" role="alert" aria-live="assertive">
          {{ erroLogin() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="autenticar()" novalidate>
        <div class="form-group">
          <label for="email">E-mail institucional *</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            placeholder="joao.silva@vilaolimpica.org.br"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="senha">Senha *</label>
          <input
            id="senha"
            type="password"
            formControlName="senha"
            placeholder="••••••"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-full" [disabled]="carregando()">
          {{ carregando() ? 'Entrando...' : 'Entrar no Painel' }}
        </button>
      </form>
    </section>
  `
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly erroLogin = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(4)]]
  });

  autenticar(): void {
    this.erroLogin.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando.set(true);
    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/kanban']);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erroLogin.set(err?.error?.erro || 'E-mail ou senha inválidos.');
      }
    });
  }
}
