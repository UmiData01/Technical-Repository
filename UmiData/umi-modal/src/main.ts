import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { AdicionarEstadoModalComponent } from './app/adicionar-estado-modal/adicionar-estado-modal';
import { appConfig } from './app/app.config';

(async () => {
  try {
    const app = await createApplication(appConfig);
    const modalElement = createCustomElement(AdicionarEstadoModalComponent, {
      injector: app.injector
    });
    customElements.define('app-adicionar-estado-modal', modalElement);
    console.log('✅ Angular Element registrado com sucesso!');
  } catch (e) {
    console.error('❌ Erro ao registrar Angular Element:', e);
  }
})();