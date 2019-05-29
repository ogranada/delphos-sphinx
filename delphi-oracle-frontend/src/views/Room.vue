<template>
  <div class="Room">
    <div class="Room-editors">
      <md-toolbar :md-elevation="1">
        <span class="md-title">Coding</span>
      </md-toolbar>
      <md-tabs md-sync-route>
        <md-tab class="Room-tab" id="tab-html" md-label="html">
          <monaco-editor language="html"></monaco-editor>
        </md-tab>
        <md-tab class="Room-tab" id="tab-css" md-label="css">
          <monaco-editor language="css"></monaco-editor>
        </md-tab>
        <md-tab class="Room-tab" id="tab-js" md-label="js">
          <monaco-editor language="javascript"></monaco-editor>
        </md-tab>
      </md-tabs>
    </div>
    <div class="Room-separator"></div>
    <div class="Room-feedback">
      <md-toolbar :md-elevation="1">
        <span class="md-title">Preview</span>
      </md-toolbar>
      <code-previewer></code-previewer>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import MonacoEditor from '@/components/MonacoEditor.vue'
import MonacoEditor from "@/components/MonacoEditor.vue";
import CodePreviewer from "@/components/CodePreviewer.vue";

export default {
  name: "Room",
  data() {
    return {
      room: null
    };
  },
  components: {
    MonacoEditor,
    CodePreviewer
  },
  mounted() {
    this.editors = {};
    this.room = this.$route.params.room;
    this.username = this.$route.params.username;
    this.roomPassword = localStorage.getItem(`${this.room}:password`);
  },
  methods: {
    // NOTHING TO DO
  }
};
</script>

<style lang="scss">
.Room {
  display: flex;
  &-tab {
    padding: 0;
  }
  &-editors,
  &-feedback {
    width: 49%;
    display: inline-block;
    height: calc(100vh - 100px);
    border: 1px solid rgba(#000, 0.12);
  }
  &-separator {
    width: 2%;
  }
}
</style>

