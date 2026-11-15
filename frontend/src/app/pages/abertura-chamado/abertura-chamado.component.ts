import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChamadoService } from '../../core/services/chamado.service';

@Component({
  selector: 'app-abertura-chamado',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="card" aria-labelledby="titulo-abertura">
      <header class="card-header">
        <h1 id="titulo-abertura">Abrir Chamado de Suporte</h1>
        <p class="subtitle">Informe a etiqueta de patrimônio do equipamento e descreva o problema ocorrido.</p>
      </header>

      @if (mensagemSucesso()) {
        <div class="alert alert-success" role="status" aria-live="polite">
          {{ mensagemSucesso() }}
        </div>
      }

      @if (mensagemErro()) {
        <div class="alert alert-error" role="alert" aria-live="assertive">
          {{ mensagemErro() }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="enviar()" novalidate>
        <div class="form-group">
          <label for="tagPatrimonio">Tag de Patrimônio *</label>
          <input
            id="tagPatrimonio"
            type="text"
            formControlName="tagPatrimonio"
            placeholder="Ex.: VILA-REC-02"
            maxlength="30"
            autocomplete="off"
            [attr.aria-invalid]="campoInvalido('tagPatrimonio')"
          />
          @if (campoInvalido('tagPatrimonio')) {
            <small class="field-error">Informe a tag de patrimônio (máximo 30 caracteres).</small>
          }
        </div>

        <div class="form-group">
          <label for="descricaoProblema">Descrição do Problema *</label>
          <textarea
            id="descricaoProblema"
            rows="4"
            formControlName="descricaoProblema"
            maxlength="1000"
            placeholder="Descreva o que acontece, mensagens de erro ou cabos verificados..."
            [attr.aria-invalid]="campoInvalido('descricaoProblema')"
          ></textarea>
          @if (campoInvalido('descricaoProblema')) {
            <small class="field-error">Descreva o problema (mínimo 5 caracteres).</small>
          }
        </div>

        <button type="submit" class="btn btn-primary" [disabled]="enviando()">
          {{ enviando() ? 'Registrando chamado...' : 'Registrar Chamado' }}
        </button>
      </form>
    </section>
  `
})
export class AberturaChamadoComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly chamadoService = inject(ChamadoService);

  readonly enviando = signal(false);
  readonly mensagemSucesso = signal<string | null>(null);
  readonly mensagemErro = signal<string | null>(null);

  readonly form = this.fb.group({
    tagPatrimonio: ['', [Validators.required, Validators.maxLength(30)]],
    descricaoProblema: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]]
  });

  campoInvalido(campo: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.dirty || control.touched);
  }

  enviar(): void {
    this.mensagemSucesso.set(null);
    this.mensagemErro.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const payload = {
      tagPatrimonio: this.form.controls.tagPatrimonio.value.trim().toUpperCase(),
      descricaoProblema: this.form.controls.descricaoProblema.value.trim()
    };

    this.chamadoService.abrirChamado(payload).subscribe({
      next: (chamado) => {
        this.enviando.set(false);
        this.mensagemSucesso.set(
          `Chamado #${chamado.id ?? ''} registrado com sucesso para o equipamento ${payload.tagPatrimonio}.`
        );
        this.form.reset();
      },
      error: (err) => {
        this.enviando.set(false);
        const msg = err?.error?.erro || err?.error?.message || 'Não foi possível registrar o chamado. Verifique a tag de patrimônio.';
        this.mensagemErro.set(msg);
      }
    });
  }
}
