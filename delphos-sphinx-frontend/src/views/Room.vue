<template>
  <div class="Room">
    <div class="Room-editors">
      <monaco-editor
        :on-update="updateHTML"
        language="html"
        code="<div class='sample'> Hello <div>"
      ></monaco-editor>
      <monaco-editor :on-update="updateCSS" language="css" code=".sample { color: purple;}"></monaco-editor>
      <monaco-editor
        :on-initialized="onInitialized"
        :on-updates="updateJavascript"
        language="javascript"
        code="console.log('OK');"
      ></monaco-editor>
    </div>
    <div class="Room-feedback">
      <code-previewer :execute-code="executeCode"></code-previewer>
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
  components: {
    MonacoEditor,
    CodePreviewer
  },
  methods: {
    onInitialized(lang, editor) {
      if (lang === "javascript") {
        this.jsEditor = editor;
      }
    },
    executeCode() {
      if (this.jsEditor) {
        this.executeJsCode(this.jsEditor);
      }
    },
    updateHTML(event, editor) {
      try {
        const preview = document.querySelector(".CodePreviewer-preview");
        if (preview) {
          preview.innerHTML = editor.getValue();
        }
      } catch (error) {
        window.console.log(error);
      }
    },
    updateCSS(event, editor) {
      try {
        const styleSheet = document.querySelector("style#css_custom_styles");
        if (styleSheet) {
          styleSheet.innerHTML = editor.getValue();
        }
      } catch (error) {
        window.console.log(error);
      }
    },
    updateJavascript(event, editor) {
      // JS side
      if (this.toid) {
        clearInterval(this.toid);
      }
      window.console.log("call jseval", new Date());
      this.toid = setTimeout(() => {
        this.executeJsCode(editor);
      }, 1000);
    },
    executeJsCode(editor) {
      const context = {
        console: {
          log(...args) {
            window.console.log(...args);
            window.log(...args);
          },
          error(...args) {
            window.console.error(...args);
            window.error(...args);
          }
        },
        alert: (...params) => window.alert(...params)
      };
      const jsCode = editor.getValue();
      if (this.old_js !== jsCode) {
        window.console.log("running js");
        const customFunction = new Function(
          `with(this) { try { ${jsCode} }catch(error){console.error(error)} } `
        );
        document.querySelector(".CodePreviewer-console").innerHTML = "";
        customFunction.call(context);
        this.old_js = jsCode;
      }
    }
  }
};
</script>

<style lang="scss">
.Room {
  position: relative;

  &-editors,
  &-feedback {
    width: 48%;
    position: absolute;
    display: inline-block;
    height: 100vh;
  }

  &-editors {
    left: 0;
  }

  &-feedback {
    left: 50%;
  }
}
</style>

