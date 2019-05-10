import Vue from 'vue';
import { store } from './store';

import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css';

import { prepareWebSocket } from './utils';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

Vue.use(VueMaterial);
prepareWebSocket();
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app');
