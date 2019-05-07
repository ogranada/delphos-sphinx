<template>
  <div class="Room">
    <div class="Room-editors">
      <monaco-editor :on-update="updateHTML" language="html" :code="this.html"></monaco-editor>
      <monaco-editor :on-update="updateCSS" language="css" :code="this.css"></monaco-editor>
      <monaco-editor
        :on-initialized="onInitialized"
        :on-updates="updateJavascript"
        language="javascript"
        :code="this.js"
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
  data() {
    return {
      room: null,
      html: `<div class="sample">
  Hello
</div>`,
      css: `.sample {
  color: purple;
}`,
      js: `function main(){
  console.log(1)
}
main();`
    };
  },
  components: {
    MonacoEditor,
    CodePreviewer
  },
  mounted() {
    this.room = this.$route.params.room;
    if (window.wsConnection) {
      window.wsConnection.answers.on("update", info => {
        this.$set(this, 'html', info.html);
        this.$set(this, 'css', info.css);
        this.$set(this, 'js', info.js);
        window.console.log("content updated");
      });
      window.wsConnection.send(
        JSON.stringify({
          type: "get_room_info",
          body: { password: window.roomPassword, room: this.room }
        })
      );
    }
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
        if (window.wsConnection) {
          window.wsConnection.send(
            JSON.stringify({
              type: "update",
              body: {
                html: editor.getValue(),
                css: this.css,
                js: this.js,
                room: this.room,
                password: window.roomPassword
              }
            })
          );
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
        if (window.wsConnection) {
          window.wsConnection.send(
            JSON.stringify({
              type: "update",
              body: {
                html: this.html,
                css: editor.getValue(),
                js: this.js,
                room: this.room,
                password: window.roomPassword
              }
            })
          );
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
        if (window.wsConnection) {
          window.wsConnection.send(
            JSON.stringify({
              type: "update",
              body: {
                html: this.html,
                css: this.css,
                javascript: editor.getValue(),
                room: this.room,
                password: window.roomPassword
              }
            })
          );
        }
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

