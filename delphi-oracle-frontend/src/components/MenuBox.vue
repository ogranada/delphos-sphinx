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
  </div>
</template>

<script>
import { personal, technical } from "../config/skills.json";
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
    technical
  })
};
</script>