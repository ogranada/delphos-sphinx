<template>
  <div class="MonacoEditor-container">
    <div class="MonacoEditor" :data-language="this.language"></div>
  </div>
</template>

<script>
/* global monaco */
/* eslint-disable no-console */

import { mapState } from "vuex";
import enableEmmet from "monaco-emmet";

export default {
  name: "MonacoEditor",
  props: ["language"],
  data: () => ({
    isCollapsed: false,
    cursorItems: {}
  }),
  computed: mapState({
    code(state) {
      const lang = this.language == "javascript" ? "js" : this.language;
      return state[lang];
    },
    cursors(state) {
      return state.cursors;
    }
  }),
  watch: {
    code(newCode /*, oldCode */) {
      if (!this.justUpdated) {
        if (this.editor) {
          this.editor.getPosition();
          this.editor.setValue(newCode);
          // this.editor.setPosition(pos);
        }
      } else {
        this.justUpdated = false;
      }
    },
    cursors() {
      this.makeWidgets();
    }
  },
  mounted() {
    this.lang = this.language == "javascript" ? "js" : this.language;
    this.container = document.querySelector(
      `.MonacoEditor[data-language="${this.language}"]`
    );
    this.editor = null;
    this.prepareEditor(this.container);
    // todo: add cursors
    this.makeWidgets();
  },
  methods: {
    makeWidgets() {
      const stylesSpan = `border: 1px solid red;
                          position: absolute;
                          bottom: 100%;
                          left: 0;
                          display: inline-block;
                          height: 1.6em;`;
      const styles = `padding: 0px 5px;
                      background-color: rgba(255, 255, 255, 0.9);
                      margin-top: 1.5em;
                      border: 1px solid #dddbdb;
                      border-radius: 3px;
                      box-shadow: 0 0.05em 0.2em #000000;`;
      const makeCursor = name => ({
        domNode: null,
        _position: {},
        getId: function() {
          return `monaco.cursor.user.${name}`;
        },
        getDomNode: function() {
          if (!this.domNode) {
            this.son = document.createElement("span");
            this.son.setAttribute("style", stylesSpan);
            this.domNode = document.createElement("div");
            this.domNode.setAttribute("style", styles);
            this.domNode.innerHTML = name;
            this.domNode.appendChild(this.son);
            let flag = 1;
            this.intervalId = setInterval(() => {
              this.son.style.visibility = flag > 0 ? "" : "hidden";
              flag *= -1;
            }, 500);
          }
          return this.domNode;
        },
        getPosition: function() {
          return {
            position: this._position,
            preference: [
              monaco.editor.ContentWidgetPositionPreference.EXACT,
              monaco.editor.ContentWidgetPositionPreference.EXACT
            ]
          };
        }
      });

      Object.keys(this.cursors)
        .map(index => {
          const data = this.cursors[index];
          return {
            language: data.language,
            name: data.name,
            position: { ...data.position }
          };
        })
        .filter(cursor => {
          window.console.log(cursor.language, this.lang);
          return cursor.language === this.lang;
        })
        .map(cursor => {
          console.log("Create or update cursor", cursor.name);
          if (!this.cursorItems[cursor.name]) {
            this.cursorItems[cursor.name] = makeCursor(
              cursor.name,
              cursor.position
            );
          } else {
            this.cursorItems[cursor.name]._position = cursor.position;
          }
          this.editor.addContentWidget(this.cursorItems[cursor.name]);
        });
    },
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


