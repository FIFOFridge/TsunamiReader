<template v-if="display">
    <div id="app-titlebar"></div>    
</template>

<script>
import { remote } from 'electron'
import titleBar from 'electron-titlebar-windows'

var settings = remote.getGlobal('appSettings').settingsObject

export default {
    name: 'app-titlebar',
    data: {
        display: settings.overrideTitleBar 
    },
    mounted: function () {
        this.$nextTick(function () {
            if(!(settings.overrideTitleBar))
                return

            let titlebar = new ElectronTitlebarWindows({
                darkMode: false,
                color: 'rgba(0, 0, 0, 0.6)',
                backgroundColor: 'hsla(41, 16%, 85%, 1)',
                draggable: true,
                fullscreen: false
            })
        
            titlebar.appendTo(document.getElementById("app-titlebar"))

			//attach events
			titlebar.on('close', function(e) {
				$emit('close-button')
			});

			titlebar.on('minimize', function(e) {
				$emit('minimize-button')
			});

			titlebar.on('maximize', function(e) {
				$emit('maximize-button')
			});

			titlebar.on('fullscreen', function(e) {
				$emit('fullscreen-button')
			});
        })
    }
}
</script>

