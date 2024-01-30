// all functions here are meant to be injected into the target page

export function getFakeDate() {
    //needs to be defined locally!
    const FAKE_DATE_STORAGE_KEY = 'timeTravelDate'
    return window.sessionStorage.getItem(FAKE_DATE_STORAGE_KEY)
}

export function setFakeDate(date: string) {
    console.log("set fake date called");
    const environment: string  = window.location.host.split('.')[0].split('-')[1]

    console.log(`Updating the time in the environment ${environment} with ${date}`);
    const updateUrl = `https://admin-${environment}.somaspace.medable.tech/updateTime`;
    fetch(updateUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Medable-Client-Key': 'c_axon_demo_app',
        },
        body: JSON.stringify({
            time: date
        })
    }).then(() => console.log(`Updated the time in the environment ${environment} with ${date}`))
        .catch(e => console.error('Error updating time', e));

    // fetch(`https://api.local.medable.com/settime/${date}`).then(r=>r.text()).then(r=>console.log(date, r))
  
    //needs to be defined locally!
    const FAKE_DATE_STORAGE_KEY = 'timeTravelDate'
    if (date)
        window.sessionStorage.setItem(FAKE_DATE_STORAGE_KEY, date)
    else
        window.sessionStorage.removeItem(FAKE_DATE_STORAGE_KEY)

    if (window.__timeTravelCheckToggle)
        window.__timeTravelCheckToggle()
}

export function getTickStartTimestamp(): string | null {
    const TICK_START_STORAGE_KEY = 'timeTravelTickStartTimestamp'
    return window.sessionStorage.getItem(TICK_START_STORAGE_KEY)
}

/** enables clock ticking if nowTimestampStr is non-empty */
export function setTickStartTimestamp(nowTimestampStr: string) {
    const TICK_START_STORAGE_KEY = 'timeTravelTickStartTimestamp'

    if (!nowTimestampStr) {
        window.sessionStorage.removeItem(TICK_START_STORAGE_KEY)
    } else {
        window.sessionStorage.setItem(TICK_START_STORAGE_KEY, nowTimestampStr)
    }
}

/** returns true if the content script was injected and activated after page reload */
export function isContentScriptActive() {
    return window.__timeTravelCheckToggle != undefined
}
