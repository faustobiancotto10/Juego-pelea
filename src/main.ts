import { AppController } from './game/ui/AppController.js';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app');

new AppController(app).start();
