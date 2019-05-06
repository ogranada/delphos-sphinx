<template>
  <div class="CodePreviewer">
    <div class="CodePreviewer-actions">
      <div class="CodePreviewer-title">Actions</div>
      <button @click="runCode">Run</button>
    </div>
    <div class="CodePreviewer-previewContainer">
      <div class="CodePreviewer-title">Preview</div>
      <div class="CodePreviewer-preview"></div>
    </div>
    <div class="CodePreviewer-consoleContainer">
      <div class="CodePreviewer-title">Console</div>
      <div class="CodePreviewer-console"></div>
    </div>
  </div>
</template>


<script>
export default {
  name: "CodePreview",
  props: ['executeCode'],
  mounted() {
    this.prepareLog();
  },
  methods: {
    runCode() {
      this.executeCode && this.executeCode();
    },
    prepareLog() {
      if(window.log) {
        return;
      }
      const consoleSelector = '.CodePreviewer-console';
      window.log = function() {
        const out = document.createElement("div");
        out.innerHTML = Array.prototype.slice.call(arguments).join(" ");
        document.querySelector(consoleSelector).appendChild(out);
      };
      window.error = function() {
        const out = document.createElement("div");
        out.classList.add("error");
        out.innerHTML = Array.prototype.slice.call(arguments).join(" ");
        document.querySelector(consoleSelector).appendChild(out);
      };
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
    margin: 1em;
    padding: 5px;
    font-family: monospace;
    color: #40535d;
    min-height: 35vh;
  }
  &-title {
    font-size: 1.3em;
    font-weight: bold;
    margin: 2vh 0 1vh;
  }
}
</style>


