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
    js: '',
    writers: {},
    cursors: {},
  },
  getters: {
    password(state) {
      return localStorage.getItem(`${state.room}:password`);
    },
    userInfo() {
      return JSON.parse(localStorage.getItem('USER_INFO')) || {};
    },
  },
  mutations: {
    update_userInfo(state, userData) {
      localStorage.setItem('USER_INFO', JSON.stringify(userData));
      state.id = userData.id;
      state.user = userData.user;
    },
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
    update_html(state, { code, source, position, writer }) {
      const html = code;
      if (state.html !== html) {
        state.html = html;
        if (writer !== undefined) {
          state.writers[writer] = position;
        }
        if (source) {
          updateHTML(html, state.room, state.id, position);
        }
      }
    },
    update_css(state, { code, source, position, writer }) {
      const css = code;
      if (state.css !== css) {
        state.css = css;
        if (writer !== 'undefined') {
          state.writers[writer] = position;
        }
        if (source) {
          updateCSS(css, state.room, state.id, position);
        }
      }
    },
    update_js(state, { code, source, position, writer }) {
      const js = code;
      if (state.js !== js) {
        state.js = js;
        if (writer !== 'undefined') {
          state.writers[writer] = position;
        }
        if (source) {
          updateJavascript(js, state.room, state.id, position);
        }
      }
    },
    update_cursors(state, cursors) {
      state.cursors = Object.values(cursors).filter(
        elm => elm.name !== state.user,
      );
    },
  },
  actions: {
    register(context) {
      return wsSubscribe(
        context.state.room,
        context.state.user,
        context.state.password,
        context.state.id,
      );
    },
  },
});
