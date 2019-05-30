<template>
  <div class="Room">
    <div :class="`Room-editors ${isPreviewOpen?' isOpen':''}`">
      <md-toolbar :md-elevation="1">
        <span class="md-title">Coding</span>
        <div class="md-toolbar-section-end">
          <md-menu md-size="small" md-direction="bottom-end" md-align-trigger>
            <md-button class="md-icon-button" md-menu-trigger>
              <md-icon>more_vert</md-icon>
            </md-button>
            <md-menu-content>
              <md-menu-item @click="runCode">
                Run Code
                <md-icon>play_arrow</md-icon>
              </md-menu-item>
              <md-menu-item @click="togglePreview">
                Toggle Results Panel
                <md-icon v-if="isPreviewOpen">toggle_on</md-icon>
                <md-icon v-if="!isPreviewOpen">toggle_off</md-icon>
              </md-menu-item>
            </md-menu-content>
          </md-menu>
        </div>
      </md-toolbar>
      <md-tabs md-sync-route>
        <template slot="md-tab" slot-scope="{ tab }">{{ tab.label }}</template>
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
    <!-- <div class="Room-separator"></div>   -->
    <div :class="`Room-feedback ${isPreviewOpen?' isOpen':''}`">
      <md-toolbar :md-elevation="1">
        <span class="md-title">Preview</span>
        <div class="md-toolbar-section-end">
          <md-button class="md-icon-button" md-menu-trigger @click="runCode">
            <md-icon>play_arrow</md-icon>
          </md-button>
          <md-button class="md-icon-button" md-menu-trigger @click="togglePreview">
            <md-icon>close</md-icon>
          </md-button>
        </div>
      </md-toolbar>
      <code-previewer
        :get-execute-code-action="prepareExecuteCodeAction"
        :hide-floating-button="true"
      ></code-previewer>
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
      room: null,
      isPreviewOpen: false
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
    togglePreview() {
      this.isPreviewOpen = !this.isPreviewOpen;
    },
    prepareExecuteCodeAction(action) {
      this.executeCodeAction = action;
    },
    runCode() {
      if (this.executeCodeAction) {
        this.isPreviewOpen = true;
        this.executeCodeAction();
      }
    }
  }
};
</script>

<style lang="scss">
.Room {
  position: relative;
  display: flex;

  &-tab {
    padding: 0;
  }

  &-editors,
  &-feedback {
    display: inline-block;
    height: calc(100vh - 100px);
    border: 1px solid rgba(#000, 0.12);
    transition: all 0.5s ease;
    z-index: 3000;
  }

  &-editors {
    width: 100%;
    &.isOpen {
      width: 58%;
    }
  }

  &-feedback {
    position: absolute;
    top: 0;
    right: 0;
    height: calc(100vh - 6em);
    transform: rotateY(-90deg);
    transform-origin: right;
    min-width: 40%;
    background: white;
    z-index: 5000;
    overflow-y: hidden;
    &.isOpen {
      transform: none;
      box-shadow: 0 5px 10px rgba(70, 69, 69, 0.8);
    }
  }
}
</style>

