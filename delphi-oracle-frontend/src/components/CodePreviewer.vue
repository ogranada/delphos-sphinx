<template>
  <div class="CodePreviewer">
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
    <md-speed-dial v-if="!hideFloatingButton" class="right">
      <md-speed-dial-target>
        <md-icon>build</md-icon>
      </md-speed-dial-target>

      <md-speed-dial-content>
        <md-button class="md-icon-button" @click="runCodeHandler">
          <md-icon>play_arrow</md-icon>
        </md-button>
      </md-speed-dial-content>
    </md-speed-dial>

    <md-snackbar
      md-position="center"
      :md-duration="5000"
      :md-active.sync="showSnackbar"
      md-persistent
    >
      <span>{{ snackbarMessage }}</span>
      <md-button class="md-accent" @click="showSnackbar = false">close</md-button>
    </md-snackbar>
  </div>
</template>


<script>
import { mapState } from "vuex";
import { prepareListenRunCode, sendRunCodeMessage } from "@/utils";

export default {
  name: "CodePreview",
  props: ["getExecuteCodeAction", 'hideFloatingButton'],
  data: () => ({
    snackbarMessage: "",
    showSnackbar: false
  }),
  mounted() {
    this.prepareLog();
    prepareListenRunCode(info => {
      this.$set(
        this,
        "snackbarMessage",
        `Code executed by ${info.payload.name}`
      );
      this.$set(this, "showSnackbar", true);
      this.runCode();
    });
    this.getExecuteCodeAction && this.getExecuteCodeAction(this.runCodeHandler.bind(this));
  },
  computed: mapState(...["html", "css", "js"]),
  methods: {
    runCodeHandler() {
      sendRunCodeMessage(
        this.$store.state.room,
        this.$store.state.id || this.$store.getters.userInfo.id,
        this.$store.state.user || this.$store.getters.userInfo.name
      );
      this.runCode();
      this.$set(
        this,
        "snackbarMessage",
        "Code executed by me"
      );
      this.$set(this, "showSnackbar", true);
    },
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
            `with(this) {
              try {
                ${jsCode}
              }catch(error){
                console.error(error)
              }
            }`
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
        const src_elms = {};
        let values = Array.prototype.slice
          .call(arguments)
          .map(element => {
            let strVal = `${element}`;
            switch (Object.prototype.toString.call(element)) {
              case '[object Function]':
                strVal = `${strVal}`.replace(/function/g, '/i/f/ei/');
                break;
              case '[object Array]':
                strVal = `[${strVal}]`
                break;
              case '[object Object]':
                strVal = JSON.stringify(element);
                break;
              default:
                break;
            }
            src_elms[strVal] = element;
            return strVal;
          })
        if(values.length>0 && values[0].includes('%')) {
          const elms = values[0].match(/\%\w/g);
          for(let i=0; i<elms.length; i++) {
            switch (elms[i]) {
              case '%d':
                values[i+1] = parseInt(src_elms[values[i+1]]);
                break;
              case '%f':
                values[i+1] = parseFloat(src_elms[values[i+1]]);
                break;
              default:
                break;
            }
            if(values[i+1] !== undefined) {
              values[0] = values[0].replace(new RegExp(elms[i]), values[i+1]);
              values[i+1] = '<NO_USED>';
            }
          }
          values = values.filter(x => x!=='<NO_USED>');
        }
        
        out.innerHTML = values
          .join(" ")
          .replace(/>/g, "&gt;")
          .replace(/</g, "&lt;")
          .replace(/ /g, "&nbsp;")
          .replace(/\n/g, "<br/>")
          .replace(/\/i\//g, "<i>")
          .replace(/\/ei\//g, "</i>")
          ;
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


