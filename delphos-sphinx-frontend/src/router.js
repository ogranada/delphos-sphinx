import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Room from "./views/Room.vue";
import About from "./views/About.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/room/:room/:username",
      name: "Room",
      component: Room
    },
    {
      path: "/about",
      name: "About",
      component: About
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () =>
    //     import(/* webpackChunkName: "about" */ './views/About.vue')
    // }
  ]
});
