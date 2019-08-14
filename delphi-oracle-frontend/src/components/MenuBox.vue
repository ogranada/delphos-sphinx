<template>
  <div class="MenuBox">
    <md-subheader>Personal</md-subheader>
    <md-list>
      <skill-item v-for="skill in personal.skills" :key="skill.topic" :skill="skill"></skill-item>
    </md-list>
    <skill-group
      v-for="group in Object.keys(technical)"
      :key="group"
      :group="technical[group]"
      :groupName="group"
    ></skill-group>
    <md-button
      title="Export info"
      class="md-icon-button md-raised md-accent"
      @click="exportHandler"
    >
      <md-icon>save</md-icon>
    </md-button>
  </div>
</template>

<script>
import {
  personal,
  technical,
  translation
} from "../config/skills-template.json";
import { generator } from "../modules/generator";
import SkillGroup from "@/components/SkillGroup.vue";
import SkillItem from "@/components/SkillItem.vue";

export default {
  name: "MenuBox",
  components: {
    SkillGroup,
    SkillItem
  },
  data: () => ({
    personal,
    technical,
    translation
  }),
  mounted() {
    console.log(this.$route);
    console.log(this.$store);
  },
  methods: {
    forceFileDownload(response) {
      const url = window.URL.createObjectURL(
        new Blob([JSON.stringify(response, null, 4)])
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${this.$store.state.user}.json`); //or any other extension
      document.body.appendChild(link);
      link.click();
    },
    exportHandler() {
      const personal = { ...this.personal, fullname: this.$store.state.user };
      const json = generator({
        personal,
        technical: this.technical,
        translation: this.translation
      });
      this.forceFileDownload(json);
    }
  }
};
</script>