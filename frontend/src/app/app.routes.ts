import { Routes } from '@angular/router';
import { AberturaChamadoComponent } from './pages/abertura-chamado/abertura-chamado.component';
import { LoginComponent } from './pages/login/login.component';
import { KanbanComponent } from './pages/kanban/kanban.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: AberturaChamadoComponent, title: 'Mini-GLPI | Abrir Chamado' },
  { path: 'login', component: LoginComponent, title: 'Mini-GLPI | Login Técnico' },
  { path: 'kanban', component: KanbanComponent, canActivate: [authGuard], title: 'Mini-GLPI | Painel Kanban' },
  { path: '**', redirectTo: '' }
];