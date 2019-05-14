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

export default {
  name: "App",
  mounted() {
    if (window.wsConnection) {
      window.wsConnection.answers.on("update", info => {
        this.$store.commit('update_html', atob(info.html));
        this.$store.commit('update_css', atob(info.css));
        this.$store.commit('update_js', atob(info.js));
      });
      window.wsConnection.answers.on("get_room_info",   info => {
        this.$store.commit('update_html', atob(info.code.html));
        this.$store.commit('update_css', atob(info.code.css));
        this.$store.commit('update_js', atob(info.code.js));
      });
      // window.wsConnection.answers.on("get_room_info", info => {
      //   this.html = atob(info.code.html) || this.html;
      //   this.css = atob(info.code.css) || this.css;
      //   this.js = atob(info.code.js) || this.js;
      //   this.updateHTMLContainer();
      //   this.updateCSSStyles();
      //   this.ready_to_update = true;
      // });
    }
  }
};
</script>


<style lang="scss">
body {
  margin: 0;
  padding: 0;
}
</style>
