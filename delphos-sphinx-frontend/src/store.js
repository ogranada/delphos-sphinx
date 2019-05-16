import Vue from 'vue';
import Vuex from 'vuex';

import { wsSubscribe, updateHTML, updateCSS, updateJavascript } from '@/utils';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    room: null,
    id: null,
    user: null,
    password: null,
    html: '',
    css: '',
    js: ''
  },
  getters: {
    password(state) {
      return localStorage.getItem(`${state.room}:password`);
    },
    userInfo() {
      return JSON.parse(localStorage.getItem('USER_INFO'));
    }
  },
  mutations: {
    update_room(state, room) {
      state.room = room;
    },
    update_id(state, id) {
      state.id = id;
    },
    update_user(state, user) {
      state.user = user;
    },
    update_password(state, password) {
      localStorage.setItem(`${state.room}:password`, password);
      state.password = password;
    },
    update_html(state, html) {
      window.console.log(`"${state.html}" -> "${html}"`);
      if (state.html !== html) {
        state.html = html;
        updateHTML(html, state.room, state.id);
      }
    },
    update_css(state, css) {
      window.console.log(`"${state.css}" -> "${css}"`);
      if (state.css !== css) {
        state.css = css;
        updateCSS(css, state.room, state.id);
      }
    },
    update_js(state, js) {
      window.console.log(`"${state.js}" -> "${js}"`);
      if (state.js !== js) {
        state.js = js;
        updateJavascript(js, state.room, state.id);
      }
    }
  },
  actions: {
    register(context) {
      return wsSubscribe(
        context.state.room,
        context.state.user,
        context.state.password,
        context.state.id
      );
    }
  }
});
