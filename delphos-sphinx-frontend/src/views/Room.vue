<template>
  <div class="Room">
    <div class="Room-editors">
      <monaco-editor
        :on-initialized="onInitialized"
        :on-update="updateHTML"
        language="html"
        :code="this.html"
      ></monaco-editor>
      <monaco-editor
        :on-initialized="onInitialized"
        :on-update="updateCSS"
        language="css"
        :code="this.css"
      ></monaco-editor>
      <monaco-editor
        :on-update="updateJavascript"
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
import { wsSubscribe } from "@/utils";

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
    this.editors = {};
    this.room = this.$route.params.room;
    this.username = this.$route.params.username;
    this.roomPassword = localStorage.getItem(`${this.room}:password`);
    this.ready_to_update = false;
    this.prepareIntervalId = setInterval(() => {
      if (window.wsConnection && window.wsConnected) {
        this.prepareUpdates();
        clearInterval(this.prepareIntervalId);
      } else {
        wsSubscribe(this.room, this.username, this.roomPassword);
      }
    }, 800);
  },
  methods: {
    prepareUpdates() {
      if (window.wsConnection && window.wsConnected) {
        window.wsConnection.answers.on("update", info => {
          this.html = atob(info.html);
          this.css = atob(info.css);
          this.js = atob(info.js);
          // this.updateHTML(null, this.editors["html"]);
          // this.updateCSS(null, this.editors["css"]);
          // this.updateJavascript(null, this.editors["js"]);
        });
        window.wsConnection.answers.on("get_room_info", info => {
          this.html = atob(info.code.html) || this.html;
          this.css = atob(info.code.css) || this.css;
          this.js = atob(info.code.js) || this.js;
          this.updateHTMLContainer();
          this.updateCSSStyles();
          this.ready_to_update = true;
        });
        window.wsConnection.send(
          JSON.stringify({
            type: "get_room_info",
            body: {
              password: this.roomPassword,
              room: this.room,
              name: this.name
            }
          })
        );
      }
    },
    onInitialized(lang, editor) {
      this.editors[lang] = editor;
      if (lang === "javascript") {
        this.jsEditor = editor;
      }
    },
    executeCode() {
      if (this.jsEditor) {
        this.executeJsCode(this.jsEditor);
      }
    },
    updateHTMLContainer() {
      try {
        const preview = document.querySelector(".CodePreviewer-preview");
        if (preview) {
          preview.innerHTML = this.html;
        }
      } catch (e) {}
    },
    updateHTML(event, editor) {
      try {
        this.html = editor.getValue();
        this.updateHTMLContainer();
        this.updateServerInfo();
      } catch (error) {
        window.console.log(error);
      }
    },
    updateCSSStyles(event, editor) {
      try {
        const styleSheet = document.querySelector("style#css_custom_styles");
        if (styleSheet) {
          styleSheet.innerHTML = this.css;
        }
      } catch (e) {}
    },
    updateCSS(event, editor) {
      try {
        this.css = editor.getValue();
        this.updateCSSStyles();
        this.updateServerInfo();
      } catch (error) {
        window.console.log(error);
      }
    },
    updateJavascript(event, editor) {
      // JS side
      this.js = editor.getValue();
      if (this.toid) {
        clearInterval(this.toid);
      }
      window.console.log("call jseval", new Date());
      this.toid = setTimeout(() => {
        this.updateServerInfo();
        // this.executeJsCode(editor);
      }, 1000);
    },
    updateServerInfo() {
      if (window.wsConnection && this.ready_to_update) {
        window.wsConnection.send(
          JSON.stringify({
            type: "update",
            body: {
              html: btoa(this.html),
              css: btoa(this.css),
              js: btoa(this.js),
              room: this.room,
              name: this.username,
              password: this.roomPassword
            }
          })
        );
      }
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
  min-height: calc(100vh - 96px);

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

