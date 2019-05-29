<template>
  <md-list class="md-double-line">
    <div class="monaco-editor-container">
      <div class="monaco-editor" :data-language="this.language"></div>
    </div>
  </md-list>
</template>

<script>
/* global monaco */

import { mapState } from "vuex";
import enableEmmet from "monaco-emmet";

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
          const pos = this.editor.getPosition();
          this.editor.setValue(newCode);
          this.editor.setPosition(pos);
        }
      } else {
        this.justUpdated = false;
      }
    }
  },
  mounted() {
    this.container = document.querySelector(
      `.monaco-editor[data-language="${this.language}"]`
    );
    this.editor = null;
    this.prepareEditor(this.container);
  },
  methods: {
    prepareEvents() {
      this.editor.onKeyUp(event => {
        if (this.content !== this.editor.getValue()) {
          const update_lang = `update_${
            this.language == "javascript" ? "js" : this.language
          }`;
          this.content = this.editor.getValue();
          this.justUpdated = true;
          this.$store.commit(update_lang, {
            code: this.content,
            source: event
          });
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
        noSyntaxValidation: true,
        extraEditorClassName: "monaco-editor-style"
      });
      this.editor = monaco.editor.create(root, {
        value: this.code,
        language: this.language || "javascript"
      });
      if (this.language == "html") {
        enableEmmet(this.editor);
      }
      this.editor.updateOptions({
        hideCursorInOverviewRuler: true,
        lineDecorationsWidth: 0,
        lineNumbers: false,
        minimap: {
          enabled: false
        },
        renderLineHighlight: "none",
        scrollBeyondLastColumn: 0
      });
      this.prepareEvents();
    }
  }
};
</script>

<style lang="scss">
.monaco-editor {
  height: calc(72vh - 3px);
  width: calc(100% - 1px);
  &-container {
    min-height: 72vh;
    border: 1px solid darkgray;
    margin: 0 2vh;
  }
}
</style>


