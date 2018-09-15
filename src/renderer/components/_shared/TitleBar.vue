<template v-if="display">
    <div id="app-titlebar" :class="{fixed: isFixed}"></div>    
</template>

<script>
import { remote } from 'electron'
import ElectronTitlebarWindows from 'electron-titlebar-windows'

var settings = remote.getGlobal('appSettings').settingsObject

export default {
    name: 'app-titlebar',
    data: {
        display: settings.overrideTitleBar 
    },
    props: {
        isFixed: false
    },
    mounted: function () {
        this.$nextTick(function () {
            if(!(settings.overrideTitleBar))
                return

            var _this = this

            let titlebar = new ElectronTitlebarWindows({
                darkMode: false,
                color: 'rgba(255, 255, 255, 0.45)',
                backgroundColor: 'rgba(0,0,0,0)',
                draggable: true,
                fullscreen: false
            })
        
            titlebar.appendTo(document.getElementById("app-titlebar"))

			//attach events
			titlebar.on('close', function(e) {
				_this.$emit('close-button')
			});

			titlebar.on('minimize', function(e) {
				_this.$emit('minimize-button')
			});

			titlebar.on('maximize', function(e) {
				_this.$emit('maximize-button')
			});

			titlebar.on('fullscreen', function(e) {
				_this.$emit('fullscreen-button')
			});
        })
    }
}
</script>

