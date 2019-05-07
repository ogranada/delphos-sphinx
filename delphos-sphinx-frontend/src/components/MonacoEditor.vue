<template>
  <div class="MonacoEditor-container" :data-language="this.language"></div>
</template>

<script>

export default {
  name: 'MonacoEditor',
  props: ['language', 'code', 'onUpdate', 'onInitialized'],
  mounted(){
    this.container = document.querySelector(`.MonacoEditor-container[data-language="${this.language}"]`);
    this.prepareEditor(this.container);
    this.content = '';
  },
  methods: {
    prepareEvents() {
      this.editor.onKeyUp(event => {
        if(this.content !== this.editor.getValue()) {
          this.content = this.editor.getValue();
          this.onUpdate && this.onUpdate(event, this.editor);
        }
      });
      this.onUpdate && this.onUpdate(null, this.editor);
    },
    async prepareMonaco() {
      return new Promise((resolve, reject) => {
        window.require.config({
          paths: {
            vs: '//cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.15.6/min/vs'
          },
          onError: error => reject(error)
        });
        window.require(['vs/editor/editor.main'], function() {
          resolve(monaco);
        });
      });
    },
    async prepareEditor(root) {
      const monaco = await this.prepareMonaco();
      this.editor = monaco.editor.create(
        root, {
          value: this.code,
          language: this.language || 'javascript'
        }
      );
      this.prepareEvents();
      this.onInitialized && this.onInitialized(this.language, this.editor);
    }
  }
}
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


