<template>
  <div class="MonacoEditor-container">
    <div class="MonacoEditor" :data-language="this.language"></div>
  </div>
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
      `.MonacoEditor[data-language="${this.language}"]`
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
            source: event,
            position: this.editor.getPosition()
          });
        }
      });
      window.addEventListener("resize", () => this.editor.layout());
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
        lineNumbers: true,
        minimap: {
          enabled: false
        },
        scrollbar: {
          // Subtle shadows to the left & top. Defaults to true.
          useShadows: false,
          // Render vertical arrows. Defaults to false.
          verticalHasArrows: false,
          // Render horizontal arrows. Defaults to false.
          horizontalHasArrows: false,
          // Render vertical scrollbar.
          // Accepted values: 'auto', 'visible', 'hidden'.
          // Defaults to 'auto'
          vertical: "hidden",
          // Render horizontal scrollbar.
          // Accepted values: 'auto', 'visible', 'hidden'.
          // Defaults to 'auto'
          horizontal: "hidden",
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
          arrowSize: 10
        },
        renderLineHighlight: "none",
        scrollBeyondLastColumn: 0,
        scrollBeyondLastRow: 0
      });
      this.prepareEvents();
    }
  }
};
</script>

<style lang="scss">
.MonacoEditor {
  height: calc(70vh - 3px);
  width: calc(100% - 1px);
  &-container {
    min-height: 70vh;
    margin: 5px 0;
  }

  .monaco-editor .monaco-scrollable-element .scrollbar.horizontal,
  .monaco-editor .decorationsOverviewRuler,
  .monaco-editor
    .monaco-scrollable-element
    .scrollbar.vertical
    .arrow-background {
    background: rgba(230, 230, 230, 255);
  }
  /* Make vertical scrollbar transparent to allow decorations overview ruler to be visible */
  .monaco-editor .monaco-scrollable-element .scrollbar.vertical {
    background: rgba(0, 0, 0, 0);
    width: 10px !important; // God, forgive me for this... :'(
  }
}
</style>


