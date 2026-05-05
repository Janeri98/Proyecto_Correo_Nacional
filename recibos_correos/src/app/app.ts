import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo-section">
  <div class="logo-icon">
    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
      <path d="m22 7-10 7L2 7"></path>
    </svg>
  </div>
  <h2>Correos</h2>
  <p>Sistema de Gestión</p>
</div>

        <nav class="sidebar-nav">
          <a 
            routerLink="/inicio" 
            routerLinkActive="active"
            class="nav-item"
          >
            <i class="icon">🏠</i>
            <span>Inicio</span>
          </a>
          <a 
            routerLink="/recibo" 
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-item"
          >
            <i class="icon">📋</i>
            <span>Recibos</span>
          </a>
          <a 
            routerLink="/reportes" 
            routerLinkActive="active"
            class="nav-item"
          >
            <i class="icon">📊</i>
            <span>Reportes</span>
          </a>
          <a href="#" class="nav-item">
            <i class="icon">🏢</i>
            <span>Agencias</span>
          </a>
          <a href="#" class="nav-item">
            <i class="icon">👥</i>
            <span>Usuarios</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="logout-btn">
            <i class="icon">🚪</i>
            <span>Cerrar Sesión</span>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <header class="header">
          <div class="header-left">
            <h1 class="page-title">Generar Recibo</h1>
          </div>
          <div class="header-right">
            <div class="user-profile">
              <div class="user-avatar">HN</div>
              <div class="user-info">
                <p class="user-name">Usuario</p>
                <p class="user-role">Tesorería</p>
              </div>
              <i class="dropdown-icon">▼</i>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .app-container {
      display: flex;
      height: 100vh;
      background-color: #f5f7fa;
    }

    /* SIDEBAR */
    .sidebar {
      width: 220px;
      background: linear-gradient(180deg, #1a5276 0%, #1e3a5f 100%);
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      position: fixed;
      height: 100vh;
      overflow-y: auto;
      z-index: 1000;
    }

    .logo-section {
      padding: 25px 20px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo-icon {
      font-size: 40px;
      margin-bottom: 10px;
    }

    .logo-section h2 {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 3px;
      letter-spacing: 0.5px;
    }

    .logo-section p {
      font-size: 12px;
      opacity: 0.8;
      font-weight: 300;
    }

    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
      display: flex;
      flex-direction: column;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
      cursor: pointer;
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
      border-left-color: #4a90e2;
    }

    .nav-item.active {
      background-color: rgba(255, 255, 255, 0.15);
      color: white;
      border-left-color: #4a90e2;
      font-weight: 600;
    }

    .nav-item .icon {
      margin-right: 12px;
      font-size: 18px;
    }

    .sidebar-footer {
      padding: 20px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .logout-btn:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
    }

    .logout-btn .icon {
      margin-right: 12px;
      font-size: 18px;
    }

    /* MAIN CONTENT */
    .main-content {
      margin-left: 220px;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* HEADER */
    .header {
      background: white;
      padding: 20px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e0e6ed;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .header-left {
      flex: 1;
    }

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #1a5276;
      letter-spacing: -0.5px;
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    .user-profile {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 8px;
      transition: background-color 0.3s ease;
    }

    .user-profile:hover {
      background-color: #f0f4f8;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #1a5276 0%, #2e86c1 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }

    .user-info {
      text-align: left;
    }

    .user-name {
      font-size: 13px;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
    }

    .user-role {
      font-size: 12px;
      color: #7f8c8d;
      margin: 0;
    }

    .dropdown-icon {
      font-size: 11px;
      color: #95a5a6;
      transition: transform 0.3s ease;
    }

    .user-profile:hover .dropdown-icon {
      transform: rotate(180deg);
    }

    /* CONTENT */
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 30px;
    }

    /* Scrollbar styling */
    .sidebar::-webkit-scrollbar,
    .content::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar::-webkit-scrollbar-track,
    .content::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    .sidebar::-webkit-scrollbar-thumb,
    .content::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
    }

    .sidebar::-webkit-scrollbar-thumb:hover,
    .content::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  `]
})
export class AppComponent {}