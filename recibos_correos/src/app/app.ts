import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="#">
          <i class="bi bi-envelope"></i> Correos - Sistema de Gestión
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/recibo"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
              >
                <i class="bi bi-receipt"></i> Generar Recibo
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/reportes"
                routerLinkActive="active"
              >
                <i class="bi bi-graph-up"></i> Reportes de Ventas
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <router-outlet></router-outlet>
  `,
  styles: [`
    :host ::ng-deep {
      .navbar {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .navbar-brand {
        font-size: 1.3rem;
        letter-spacing: -0.5px;
      }

      .nav-link {
        margin-left: 10px;
        transition: all 0.3s ease;
        border-radius: 4px;
        padding: 8px 12px !important;
      }

      .nav-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .nav-link.active {
        background-color: rgba(255, 255, 255, 0.2);
        font-weight: 600;
      }

      i {
        margin-right: 6px;
      }
    }
  `]
})
export class AppComponent {}