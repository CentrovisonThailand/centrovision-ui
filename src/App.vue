<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <input-form />
  </div>
</template>

<script>
import InputForm from "./components/InputForm";

export default {
  name: "App",
  components: {
    InputForm,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
