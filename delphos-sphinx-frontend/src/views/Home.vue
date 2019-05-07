<template>
  <div class="Home">
    <h1>Tebas-Sphinx</h1>
    <div class="Home-card Home-createRoom">
      <h2 class="Home-cardTitle">Create room</h2>
      <div class="Home-container">
        <label for="roomName">Room Name</label>
        <input type="text" v-model="roomName" id="roomName" placeholder="MySuperRoom">
        <label for="roomPassword">Room Password</label>
        <input
          type="password"
          v-model="roomPassword"
          id="roomPassword"
          placeholder="simple_password"
        >
        <label for="roomKey">Room Key</label>
        <input type="password" v-model="roomKey" id="roomKey" placeholder="pass_by_sitemgr">
      </div>
      <button @click="createRoom">Create Room</button>
    </div>

    <div class="Home-card Home-createRoom">
      <h2 class="Home-cardTitle">Join to room</h2>
      <div class="Home-container">
        <label for="joinRoomName">Room Name</label>
        <input type="text" v-model="joinRoomName" id="joinRoomName" placeholder="MySuperRoom">
        <label for="userName">User Name</label>
        <input type="text" v-model="userName" id="userName" placeholder="MySuperRoom">
        <label for="joinRoomPassword">Room Password</label>
        <input
          type="password"
          v-model="joinRoomPassword"
          id="joinRoomPassword"
          placeholder="simple_password"
        >
      </div>
      <button @click="joinToRoom">Join to Room</button>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import MonacoEditor from '@/components/MonacoEditor.vue'

export default {
  name: "home",
  data() {
    return {
      userName: "",
      roomName: "",
      roomPassword: "",
      roomKey: "",
      joinRoomName: "",
      joinRoomPassword: "",
      joinRoomKey: ""
    };
  },
  components: {},
  mounted() {
    if (window.wsConnection) {
      window.wsConnection.answers.on("create_room", info => {
        console.log("Room created");
        this.roomName = '';
        this.roomPassword = '';
        this.roomKey = '';
        alert(info.message);
      });
      window.wsConnection.answers.on("subscribe", info => {
        console.log("User subscribed");
        console.log(info);
        window.roomName = this.roomName;
        if(info.status === 'fail') {
          return alert(info.message)
        }
        window.roomPassword = this.joinRoomPassword
        this.joinRoomName = '';
        this.userName = '';
        this.joinRoomPassword = '';
        this.$router.push(`/room/${info.room}/${info.name}`);
      });
    }
  },
  methods: {
    createRoom() {
      if (window.wsConnection) {
        wsConnection.send(
          JSON.stringify({
            type: "create_room",
            body: {
              room_name: this.roomName,
              password: this.roomPassword,
              key: this.roomKey
            }
          })
        );
      } else {
        console.log("WebSocket connection not initialized");
      }
    },
    joinToRoom() {
      if (window.wsConnection) {
        window.wsConnection.send(
          JSON.stringify({
            type: "subscribe",
            body: {
              room: this.joinRoomName,
              name: this.userName,
              password: this.joinRoomPassword
            }
          })
        );
      }
    }
  }
};
</script>

<style lang="scss">
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

