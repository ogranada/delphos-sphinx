<template>
  <div class="CodePreviewer">
    <!--
    <div class="CodePreviewer-actions">
      <div class="CodePreviewer-title">Actions</div>
      <md-button class="md-raised md-primary" @click="runCode">Execute code</md-button>
    </div>
    -->
    <div class="CodePreviewer-previewContainer">
      <md-list class="md-double-line">
        <md-subheader>App</md-subheader>
        <div class="CodePreviewer-preview"></div>
      </md-list>
    </div>
    <div class="CodePreviewer-consoleContainer">
      <md-subheader>Console</md-subheader>
      <div class="CodePreviewer-console"></div>
    </div>
    <md-speed-dial class="right">
      <md-speed-dial-target>
        <md-icon>build</md-icon>
      </md-speed-dial-target>

      <md-speed-dial-content>
        <md-button class="md-icon-button" @click="runCode">
          <md-icon>play_arrow</md-icon>
        </md-button>
      </md-speed-dial-content>
    </md-speed-dial>
  </div>
</template>


<script>
import { mapState } from "vuex";

export default {
  name: "CodePreview",
  props: ["executeCode"],
  mounted() {
    this.prepareLog();
  },
  computed: mapState(...["html", "css", "js"]),
  methods: {
    runCode() {
      this.updateHTMLContainer(this.$store.state.html);
      this.updateStyleSheets(this.$store.state.css);
      this.executeJsCode(this.$store.state.js);
    },
    executeJsCode(jsCode) {
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
      if (this.old_js !== jsCode) {
        try {
          const customFunction = new Function(
            `with(this) { try { ${jsCode} }catch(error){console.error(error)} } `
          );
          document.querySelector(".CodePreviewer-console").innerHTML = "";
          customFunction.call(context);
          this.old_js = jsCode;
        } catch (error) {
          context.console.error(error);
        }
      }
    },
    prepareLog() {
      if (window.log) {
        return;
      }
      const consoleSelector = ".CodePreviewer-console";
      window.log = function() {
        const out = document.createElement("div");
        out.innerHTML = Array.prototype.slice
          .call(arguments)
          .join(" ")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        document.querySelector(consoleSelector).appendChild(out);
      };
      window.error = function() {
        const out = document.createElement("div");
        out.classList.add("error");
        out.innerHTML = Array.prototype.slice
          .call(arguments)
          .join(" ")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        document.querySelector(consoleSelector).appendChild(out);
      };
    },
    updateHTMLContainer(html) {
      try {
        const preview = document.querySelector(".CodePreviewer-preview");
        if (preview) {
          preview.innerHTML = html;
        }
      } catch (e) {
        // TODO: check error management
      }
    },
    updateStyleSheets(css) {
      try {
        const styleSheet = document.querySelector("style#css_custom_styles");
        if (styleSheet) {
          styleSheet.innerHTML = css;
        }
      } catch (e) {
        // TODO: manage exception
      }
    }
  }
};
</script>


<style lang="scss">
.CodePreviewer {
  &-preview,
  &-console {
    position: relative;
    border: 1px solid gray;
    border-radius: 2px;
    margin: 0 1em;
    padding: 5px;
    font-family: monospace;
    color: #40535d;
  }
  &-preview {
    min-height: 45vh;
  }
  &-console {
    min-height: 25vh;
  }
  &-title {
    font-size: 1.3em;
    font-weight: bold;
    margin: 2vh 0 1vh;
  }

  .md-speed-dial {
    position: absolute;
    right: 1.5em;
    bottom: 2.5em;
  }
}
</style>


