<template>
  <div id="app">
    <md-app>
      <md-app-toolbar class="md-primary">
        <span class="md-title">Delphi Sphinx</span>
      </md-app-toolbar>

      <md-app-content>
        <div id="nav">
          <router-link to="/"></router-link>
          <router-link to="/about"></router-link>
        </div>
        <router-view/>
      </md-app-content>
    </md-app>
  </div>
</template>

<script>

import { 
  reconnect,
  prepareListenUpdates
} from "@/utils.js";


export default {
  name: "App",
  mounted() {
    document.querySelector('body').setAttribute('suggestions-muted', true);
    if (this.$route.name == "Room") {
      const room = this.$route.params.room;
      const userInfo = this.$store.getters.userInfo;
      if(!userInfo || !userInfo.name || !userInfo.id) {
        return this.goHome();
      }
      const username = userInfo.name;
      const id = userInfo.id;
      this.$store.commit("update_room", room);
      const password = this.$store.getters.password;
      const reconnection = reconnect(room, id, username, password);
      reconnection
        .then(answer => {
          localStorage.setItem(
            "USER_INFO",
            JSON.stringify(answer.payload.user)
          );
          this.$store.commit("update_id", answer.payload.user.id);
          this.$store.commit("update_user", answer.payload.user.name);
          this.$store.commit("update_html", atob(answer.payload.code.html));
          this.$store.commit("update_css", atob(answer.payload.code.css));
          this.$store.commit("update_js", atob(answer.payload.code.js));
          prepareListenUpdates((language, code /*, info */) => {
            if (this.$store.state[language] != code) {
              this.$store.commit(`update_${language}`, code);
            }
          });
        })
        .catch(error => {
          window.console.error('Error Re-joining', error)
          this.goHome();
        });
    }
  },
  methods: {
    goHome() {
      this.$router.push("/");
    }
  }
};
</script>


<style lang="scss">
body {
  margin: 0;
  padding: 0;
  background: white;

  &[suggestions-muted="true"] .monaco-editor .suggest-widget,
  &[suggestions-muted="true"]
    .monaco-editor
    .suggest-widget
    .monaco-list
    .monaco-list-row {
    display: none !important;
  }
}
</style>
