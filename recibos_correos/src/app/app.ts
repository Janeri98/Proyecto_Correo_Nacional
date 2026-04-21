import { Component } from '@angular/core';
import { ReciboComponent } from './recibo/recibo';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReciboComponent],
  template: `<app-recibo></app-recibo>`,
  styles: []
})
export class AppComponent {}