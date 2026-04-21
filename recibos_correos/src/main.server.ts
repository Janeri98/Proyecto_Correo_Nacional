import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { AppComponent } from './app/app';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, {
  providers: []
}, context);

export default bootstrap;