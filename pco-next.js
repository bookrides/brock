(function () {
    var getData = function(url, callback, auth){
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.setRequestHeader("Authorization", `Basic ${auth}`);

        xhr.onreadystatechange = function () {
            if(xhr.readyState === 4) {
                callback(xhr.responseText)
            }
        }
        xhr.send();
    }

    var tag_id = document.currentScript.getAttribute('tag-id')
    var auth = document.currentScript.getAttribute("auth")
    if(!tag_id || !auth) {
        console.error('No tag_id or auth passed. Cannot load next event')
        return
    }

    var id = `next-event-${tag_id}`
    var div = document.createElement("div")
    div.id = id
    div.style.cssText = "text-align:center;"
    document.currentScript.insertAdjacentElement('afterEnd', div)

    var eventUrl = "https://api.planningcenteronline.com/resources/v2/event_instances?order=starts_at&include=event_times,event&filter=future&where[tag_ids]=" + tag_id;
    
    getData(eventUrl, function(rawData) {
        var data = JSON.parse(rawData).data
        var included = JSON.parse(rawData).included
        var publicEvents = data.filter(e => {
            var eventId = e.relationships.event.data.id
            var eventDetails = included.find(i=>i.id === eventId)
            e["name"] = eventDetails.attributes.name

            return eventDetails && eventDetails.attributes.visible_in_church_center
        })
        var nextEvent = publicEvents.shift()

        if(nextEvent) {
            var d = new Date(nextEvent.attributes.starts_at)
            var end = new Date(nextEvent.attributes.ends_at)

            var dateFormat = {weekday: 'long', day : 'numeric', month : 'short', year : 'numeric'}
            var nextEventDate = d.toLocaleDateString('en-US', dateFormat)
            var nextEventTime = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
            var nextEventEndTime = end.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

            var elem = `<div style="text-align:center;background-color: black;padding: 0.5rem;margin:auto;display:inline-block;">
                <a target="_blank" style="text-decoration: none;font-family: arial;color: white;font-size: 14px; text-align: center;line-height:1rem;"
                    href="https://bethelsrock.churchcenter.com/calendar/event/${nextEvent.id}">${nextEvent.name} <br/> ${nextEventDate} ${nextEventTime} - ${nextEventEndTime}</a>
            </div>`

            var nextEventContainer = document.getElementById(id)
            nextEventContainer.innerHTML = elem
        }
        else {
            console.error('No next event for tag_id passed.')
        }
    }, auth)
}())
