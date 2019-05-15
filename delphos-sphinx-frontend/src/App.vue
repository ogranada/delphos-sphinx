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

import { reconnect } from "@/utils";

export default {
  name: "App",
  mounted() {
    if(!this.$store.state.html) {
      this.$store.commit('update_html', `<div class="sample">
  Hello
</div>`);
      this.$store.commit('update_css', `.sample {
  color: purple;
}`);
      this.$store.commit('update_js', `function main(){
  console.log(1)
}
main();
`);
    }
    if (this.$route.name == 'Room') {
      const room = this.$route.params.room;
      const userInfo = this.$store.getters.userInfo;
      const username = userInfo.name;
      const id = userInfo.id;
      this.$store.commit('update_room', room)
      const password = this.$store.getters.password;
      const reconnection = reconnect(room, id, username, password);
      reconnection
        .then(answer => {
          localStorage.setItem('USER_INFO', JSON.stringify(answer.payload.user));
          this.$store.commit('update_html', answer.payload.code.html);
          this.$store.commit('update_css', answer.payload.code.css);
          this.$store.commit('update_js', answer.payload.code.js);
        })
        .catch(answer => {
          this.$router.push('/');
        })
    }
  }
};
</script>


<style lang="scss">
body {
  margin: 0;
  padding: 0;
  background: white;
}
</style>
