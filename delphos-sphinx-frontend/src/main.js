import Vue from "vue";
import { store } from "./store";

// import VueMaterial from "vue-material";
import {
  MdButton,
  MdContent,
  MdApp,
  MdToolbar,
  MdCard,
  MdSnackbar,
  MdRipple,
  MdField,
  MdMenu,
  MdList,
  MdSpeedDial
} from "vue-material/dist/components";
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/black-green-light.css";

import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

// Vue.use(VueMaterial);
Vue.use(MdApp);
Vue.use(MdButton);
Vue.use(MdContent);
Vue.use(MdToolbar);
Vue.use(MdCard);
Vue.use(MdSnackbar);
Vue.use(MdRipple);
Vue.use(MdField);
Vue.use(MdMenu);
Vue.use(MdList);
Vue.use(MdSpeedDial);
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount("#app");
