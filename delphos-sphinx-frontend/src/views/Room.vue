<template>
  <div class="Room">
    <div class="Room-editors">
      <monaco-editor
        language="html"
      ></monaco-editor>
      <monaco-editor
        language="css"
      ></monaco-editor>
      <monaco-editor
        language="javascript"
      ></monaco-editor>
    </div>
    <div class="Room-feedback">
      <code-previewer></code-previewer>
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
      room: null
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
  },
  methods: {
    // NOTHING TO DO
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

