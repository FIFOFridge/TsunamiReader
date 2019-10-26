<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import * as Promise from 'bluebird'

  const monitoring = process.env.NODE_ENV === 'development'

  Promise.config({
    warnings: true,
    longStackTraces: true,
    cancellation: true,
    monitoring: monitoring
  })

  export default {
    name: 'tsunamireader'
  }
</script>

<style>
  /* CSS */
</style>
