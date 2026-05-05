import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="inicio-container">
      <div class="welcome-card">
        <h1>Bienvenido al Sistema de Gestión</h1>
        <p>Correos de Honduras - Recibos de Pago</p>
        
        <div class="features">
          <div class="feature">
            <div class="icon">📋</div>
            <h3>Generar Recibos</h3>
            <p>Crea recibos de pago profesionales con un solo clic</p>
          </div>
          <div class="feature">
            <div class="icon">📊</div>
            <h3>Ver Reportes</h3>
            <p>Análisis detallado de ventas y recibos generados</p>
          </div>
          <div class="feature">
            <div class="icon">🖨️</div>
            <h3>Imprimir y Descargar</h3>
            <p>Imprime recibos o descárgalos en PDF</p>
          </div>
        </div>

        <div class="quick-actions">
          <a routerLink="/recibo" class="action-btn">
            <span>➜</span> Crear Nuevo Recibo
          </a>
          <a routerLink="/reportes" class="action-btn secondary">
            <span>➜</span> Ver Reportes
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inicio-container {
      padding: 40px 20px;
    }

    .welcome-card {
      background: white;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      text-align: center;
    }

    h1 {
      font-size: 32px;
      color: #1a5276;
      margin-bottom: 8px;
      font-weight: 700;
    }

    :host ::ng-deep p {
      font-size: 16px;
      color: #7f8c8d;
      margin-bottom: 40px;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
      margin-bottom: 40px;
    }

    .feature {
      padding: 20px;
      border-radius: 8px;
      background: #f8f9fa;
      transition: all 0.3s ease;
    }

    .feature:hover {
      background: #e8f0f7;
      transform: translateY(-5px);
    }

    .feature .icon {
      font-size: 40px;
      margin-bottom: 15px;
    }

    .feature h3 {
      font-size: 16px;
      color: #1a5276;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .feature p {
      font-size: 13px;
      color: #7f8c8d;
    }

    .quick-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      background: linear-gradient(135deg, #1a5276 0%, #2e86c1 100%);
      color: white;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    .action-btn.secondary {
      background: #e0e6ed;
      color: #1a5276;
    }

    .action-btn.secondary:hover {
      background: #d0d7e0;
    }

    @media (max-width: 768px) {
      .welcome-card {
        padding: 20px;
      }

      h1 {
        font-size: 24px;
      }

      .features {
        grid-template-columns: 1fr;
      }

      .quick-actions {
        flex-direction: column;
      }

      .action-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class InicioComponent {}
