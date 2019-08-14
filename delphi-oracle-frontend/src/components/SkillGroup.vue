<template>
  <div class="SkillGroup">
    <md-subheader>{{groupName}}</md-subheader>
    <md-list>
      <skill-item v-for="skill in group" :key="skill.topic" :skill="skill"></skill-item>
    </md-list>
  </div>
</template>

<script>
import SkillItem from "@/components/SkillItem.vue";

export default {
  name: "SkillGroup",
  components: {
    SkillItem
  },
  props: ["group", "groupName"]
};
</script>