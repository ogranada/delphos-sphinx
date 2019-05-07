import Vue from 'vue';
import { prepareWebSocket } from './utils';
import App from './App.vue';
import router from './router';

Vue.config.productionTip = false;

prepareWebSocket();
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
