<template>
  <div>
    <div class="MonacoEditor-container" :data-language="this.language"></div>
  </div>
</template>

<script>
/* global monaco */

import { mapState } from "vuex";

export default {
  name: "MonacoEditor",
  props: ["language"],
  computed: mapState({
    code(state) {
      const lang = this.language == "javascript" ? "js" : this.language;
      return state[lang];
    }
  }),
  watch: {
    code(newCode, oldCode) {
      if(!this.justUpdated) {
        if (this.editor) {
          this.editor.setValue(newCode);
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
      this.editor.onKeyUp(event => {
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
      this.editor = monaco.editor.create(root, {
        value: this.code,
        language: this.language || "javascript"
      });
      this.prepareEvents();
    }
  }
};
</script>

<style lang="scss">
.MonacoEditor {
  &-container {
    height: 30vh;
    border: 1px solid darkgray;
    margin: 2vh;
  }
}
</style>


