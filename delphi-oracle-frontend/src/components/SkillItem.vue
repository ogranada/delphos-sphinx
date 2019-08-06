<template>
  <md-list-item>
    <span class="md-list-item-text">{{skill.topic}}</span>
    <star-rating v-model="skill.value" :item-size="15" :show-rating="false"></star-rating>
  </md-list-item>
</template>

<script>
import { StarRating } from "vue-rate-it";

export default {
  name: "SkillItem",
  components: {
    StarRating
  },
  props: ["skill"]
};
</script>