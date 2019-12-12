import { isRunningMain } from '@helpers/electronHelper'

if(isRunningMain()) {
    throw new Error(`appWrapperProxy is aviable only from renderer process`)
}

import { remote } from 'electron'

const wrapper = remote.getGlobal('appWrapperInstance')

export function getAppSetting(key) {
    wrapper.settings.get(key)
}
