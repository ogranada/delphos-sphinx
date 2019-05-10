import Vue from 'vue';
import Vuex from 'vuex';

import { wsSubscribe } from '@/utils';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    room: null,
    user: null,
    password: null,
    html: '',
    css: '',
    js: ''
  },
  getters: {
    password(state) {
      return localStorage.getItem(`${state.room}:password`);
    }
  },
  mutations: {
    update_room(state, room) {
      state.room = room;
    },
    update_user(state, user) {
      state.user = user;
    },
    update_password(state, password) {
      localStorage.setItem(`${state.room}:password`, password);
      state.password = password;
    },
    update_html(state, html) {
      state.html = html;
    },
    update_css(state, css) {
      state.css = css;
    },
    update_js(state, js) {
      state.js = js;
    }
  },
  actions: {
    register(context) {
      wsSubscribe(
        context.state.room,
        context.state.user,
        context.state.password
      );
    }
  }
});
