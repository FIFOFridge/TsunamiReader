<template>
    <div id="app-titlebar"></div>    
</template>

<script>
let titleBar = require('electron-titlebar-windows'); 

export default {
    mounted() {
        const titlebar = new ElectronTitlebarWindows(options);

        titlebar.appendTo("app-titlebar");

        //attach events
        titlebar.on('close', function(e) {
            $emit('close-button');
        });

        titlebar.on('minimize', function(e) {
            $emit('minimize-button');
        });

        titlebar.on('maximize', function(e) {
            $emit('maximize-button');
        });

        titlebar.on('fullscreen', function(e) {
            $emit('fullscreen-button');
        });
    }
}
</script>

