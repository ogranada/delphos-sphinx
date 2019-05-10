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
  name: 'App',
  mounted() {
    
  }
}
</script>


<style lang="scss">
body {
  margin: 0;
  padding: 0;
}
</style>
