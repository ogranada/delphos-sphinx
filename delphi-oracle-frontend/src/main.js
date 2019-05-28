import Vue from "vue";
import { store } from "./store";

// import VueMaterial from "vue-material";
import {
  MdApp,
  MdButton,
  MdCard,
  MdContent,
  MdField,
  MdList,
  MdMenu,
  MdRipple,
  MdSnackbar,
  MdSpeedDial,
  MdSubheader,
  MdTabs,
  MdToolbar
} from "vue-material/dist/components";
import "vue-material/dist/vue-material.min.css";
import "vue-material/dist/theme/black-green-light.css";

import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;

// Vue.use(VueMaterial);
Vue.use(MdApp);
Vue.use(MdButton);
Vue.use(MdCard);
Vue.use(MdContent);
Vue.use(MdField);
Vue.use(MdList);
Vue.use(MdMenu);
Vue.use(MdRipple);
Vue.use(MdSnackbar);
Vue.use(MdSpeedDial);
Vue.use(MdSubheader);
Vue.use(MdTabs);
Vue.use(MdToolbar);
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount("#app");
