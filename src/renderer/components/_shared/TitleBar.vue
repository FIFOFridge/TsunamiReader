<template v-if="display">
    <div id="app-titlebar"></div>    
</template>

<script>
import { remote } from 'electron'
import titleBar from 'electron-titlebar-windows'

var settings = remote.getGlobal('appSettings').settingsObject

export default {
    data: {
        display: settings.overrideTitleBar 
    },
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

