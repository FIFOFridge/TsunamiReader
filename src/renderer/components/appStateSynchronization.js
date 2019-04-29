import electron from 'electron'
import timeoutPromise from '@helpers/timeoutPromise'

export default {
    methods: {
        changeAppState(viewName) {
            return new timeoutPromise(1000, new Promise((resolve, reject) => {
                
                electron.ipcRenderer.send('sync-appstate', viewName)
                electron.ipcRenderer.on('sync-appstate' + '-reply', (event, ...args) => {
                    if(args[0] === true)
                        resolve()
                    else
                        reject()
                })
            }),'Synchronizing app state timed out')
        }
    }
}