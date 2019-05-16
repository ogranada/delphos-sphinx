<template>
  <div>
    <md-toolbar class="MonacoEditor-header md-dense">
      <h3 class="md-title">{{this.language}}</h3>
      <div class="md-toolbar-section-end">
        <md-button class="md-icon-button" @click="isCollapsed = !isCollapsed">
          <md-icon v-if="isCollapsed">keyboard_arrow_down</md-icon>
          <md-icon v-if="!isCollapsed">keyboard_arrow_up</md-icon>
        </md-button>
      </div>
    </md-toolbar>
    <div :class="`MonacoEditor-collapsable ${isCollapsed?'isCollapsed':''}`">
      <div class="MonacoEditor-container" :data-language="this.language"></div>
    </div>
  </div>
</template>

<script>
/* global monaco */

import { mapState } from "vuex";

export default {
  name: "MonacoEditor",
  props: ["language"],
  data: () => ({
    isCollapsed: false
  }),
  computed: mapState({
    code(state) {
      const lang = this.language == "javascript" ? "js" : this.language;
      return state[lang];
    }
  }),
  watch: {
    code(newCode /*, oldCode */) {
      if (!this.justUpdated) {
        if (this.editor) {
          // const pos = this.editor.getPosition();
          this.editor.setValue(newCode);
          // this.editor.setPosition(pos);
        }
      } else {
        this.justUpdated = false;
      }
    }
  },
  mounted() {
    this.container = document.querySelector(
      `.MonacoEditor-container[data-language="${this.language}"]`
    );
    this.editor = null;
    this.prepareEditor(this.container);
  },
  methods: {
    prepareEvents() {
      this.editor.onKeyUp((/*event*/) => {
        if (this.content !== this.editor.getValue()) {
          const update_lang = `update_${
            this.language == "javascript" ? "js" : this.language
          }`;
          this.content = this.editor.getValue();
          this.justUpdated = true;
          this.$store.commit(update_lang, this.content);
        }
      });
    },
    async prepareMonaco() {
      return new Promise((resolve, reject) => {
        window.require.config({
          paths: {
            vs: "//cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.15.6/min/vs"
          },
          onError: error => reject(error)
        });
        window.require(["vs/editor/editor.main"], function() {
          resolve(monaco);
        });
      });
    },
    async prepareEditor(root) {
      const monaco = await this.prepareMonaco();
      // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noLib: true, allowNonTsExtensions: true });
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true
      });
      this.editor = monaco.editor.create(root, {
        value: this.code,
        language: this.language || "javascript"
      });
      this.editor.updateOptions({
        minimap: {
          enabled: false
        }
      });
      this.prepareEvents();
    }
  }
};
</script>

<style lang="scss">
.MonacoEditor {
  &-container {
    height: 25vh;
    border: 1px solid darkgray;
    margin: 2vh;
  }
  &-collapsable {
    &.isCollapsed {
      max-height: 0;
      overflow: hidden;
    }
  }
}
</style>


