import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, Usuario } from '../services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class InicioComponent implements OnInit {
  mensajeAcceso: string = '';
  usuario: Usuario | null = null;

  constructor(private route: ActivatedRoute, private authService: AuthService) {
    this.route.queryParams.subscribe(params => {
      if (params['mensaje']) {
        this.mensajeAcceso = params['mensaje'];
      }
    });
  }

  ngOnInit() {
    this.usuario = this.authService.getUsuarioActual();
  }
}
