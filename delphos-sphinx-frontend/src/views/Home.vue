<template>
  <div class="Home">
    <md-card md-with-hover>
      <md-ripple>
        <md-card-header>
          <div class="md-title">Create a test room</div>
          <div class="md-subhead">A great place to have an interview</div>
        </md-card-header>

        <md-card-content>
          <md-field>
            <label>Room Name</label>
            <md-input v-model="roomName"></md-input>
          </md-field>

          <md-field>
            <label>Room Password</label>
            <md-input v-model="roomPassword" type="password"></md-input>
          </md-field>

          <md-field>
            <label>Room Key</label>
            <md-input v-model="roomKey" type="password"></md-input>
          </md-field>
        </md-card-content>

        <md-card-actions>
          <md-button @click="createRoom">Create Room</md-button>
        </md-card-actions>
      </md-ripple>
    </md-card>

    <md-card md-with-hover>
      <md-ripple>
        <md-card-header>
          <div class="md-title">Joint to Room</div>
          <div class="md-subhead">And show us what you got!</div>
        </md-card-header>

        <md-card-content>
          <md-field>
            <md-select
              v-model="joinRoomName"
              name="joinRoomName"
              id="joinRoomName"
              placeholder="Room Name"
            >
              <md-option v-for="room in this.rooms" :key="room.id" :value="room.id">{{room.name}}</md-option>
            </md-select>
          </md-field>

          <md-field>
            <label>User Name</label>
            <md-input v-model="userName"></md-input>
          </md-field>

          <md-field>
            <label>Room Password</label>
            <md-input v-model="joinRoomPassword" type="password"></md-input>
          </md-field>
        </md-card-content>

        <md-card-actions>
          <md-button @click="joinToRoom">Join To Room</md-button>
        </md-card-actions>
      </md-ripple>
    </md-card>

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
// @ is an alias to /src
// import MonacoEditor from '@/components/MonacoEditor.vue'

import "whatwg-fetch";
import { getDataServer } from "@/utils.js";

export default {
  name: "home",
  data() {
    return {
      rooms: [],
      showSnackbar: false,
      userName: "",
      roomName: "",
      roomPassword: "",
      roomKey: "",
      joinRoomName: "",
      joinRoomPassword: "",
      joinRoomKey: "",
      snackbarMessage: ""
    };
  },
  components: {},
  mounted() {
    if (window.wsConnection) {
      window.wsConnection.answers.on("subscribe", info => {
        window.console.log("User subscribed");
        window.console.log(info);
        window.roomName = this.roomName;
        if (info.status === "fail") {
          return alert(info.message);
        }
        this.joinRoomName = "";
        this.userName = "";
        this.joinRoomPassword = "";
        this.$router.push(`/room/${info.room}/${info.name}`);
      });
    }
    this.loadRooms();
  },
  methods: {
    async loadRooms() {
      const response = await fetch(`${getDataServer()}/api/rooms`)
      if (response.status == 200) {
        const json = await response.json();
        this.rooms = json.data.rooms;
      }
    },
    async createRoom() {
      try {
        const response = await fetch(`${getDataServer()}/api/rooms`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify({
            name: this.roomName,
            password: this.roomPassword,
            key: this.roomKey
          })
        });
        const json = await response.json();
        if (response.status == 200) {
          await this.loadRooms()
          this.roomName = '';
          this.roomPassword = '';
          this.roomKey = '';
          this.$set(this, "showSnackbar", true);
          this.$set(this, "snackbarMessage", `Room ${json.data.room.name} created`);
        } else {
          this.$set(this, "showSnackbar", true);
          this.$set(this, "snackbarMessage", json.errors[0].message);
        }
      } catch (error) {
        this.$set(this, "showSnackbar", true);
        this.$set(this, "snackbarMessage", error.message);
      }
    },
    joinToRoom() {
      this.$store.commit("update_room", this.joinRoomName);
      this.$store.commit("update_user", this.userName);
      this.$store.commit("update_password", this.joinRoomPassword);
      this.$store.dispatch("register");
    }
  }
};
</script>

<style lang="scss">
.md-card {
  width: 320px;
  margin: 4px;
  display: inline-block;
  vertical-align: top;
  background-color: #fff;
}

.Home {
  text-align: center;

  &-card {
    border: 1px solid gray;
    border-radius: 3px;
    display: inline-block;
    padding: 1em;
    box-shadow: 0 0 3px gray;

    &:nth-child(n + 2) {
      margin-left: 1em;
    }
  }

  &-container {
    display: grid;
    grid-template-columns: 50% 50%;
    grid-row-gap: 10px;
    margin-bottom: 10px;
  }

  &-cardTitle {
    margin: 0 0 1em 0;
  }
}
</style>

