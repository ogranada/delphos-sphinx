<template>
  <md-list-item>
    <span class="md-list-item-text">{{skill.topic}}</span>
    <star-rating v-model="rating" :item-size="15" :show-rating="false"></star-rating>
  </md-list-item>
</template>

<script>
import { StarRating } from "vue-rate-it";

export default {
  name: "SkillItem",
  components: {
    StarRating
  },
  data: () => ({
    rating: 0
  }),
  props: ["skill"]
};
</script>