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
    div.style.cssText = `display:grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 220px;column-gap:10px;row-gap:10px;`
    document.currentScript.insertAdjacentElement('afterEnd', div)

    var eventUrl = "https://api.planningcenteronline.com/resources/v2/event_instances?order=starts_at&include=tags,event_times,event&filter=future&per_page=3&where[tag_ids]=" + tag_id;
    
    getData(eventUrl, function(rawData) {
        var styles = `
        .pco-featured-event {
            width:100%;
            border:1px solid transparent;
        }
        .pco-featured-event:hover {
            border:1px solid #fff;
            box-shadow: 1px 5px 5px #333;
        }`
        
        var styleSheet = document.createElement("style")
        styleSheet.innerText = styles
        document.head.appendChild(styleSheet)

        var data = JSON.parse(rawData).data
        var included = JSON.parse(rawData).included
        var nextEventContainer = document.getElementById(id)
        
        data.forEach(nextEvent => {
            if(nextEvent) {
                var d = new Date(nextEvent.attributes.starts_at)
                var end = new Date(nextEvent.attributes.ends_at)
                var eventId = nextEvent.relationships.event.data.id
                var eventDetails = included.find(i=>i.id === eventId)

                if(eventDetails && !eventDetails.attributes.visible_in_church_center) {
                    return
                }

                var dateFormat = {weekday: 'long', day : 'numeric', month : 'short', year : 'numeric'}
                var nextEventDate = d.toLocaleDateString('en-US', dateFormat)
                var nextEventTime = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                var nextEventEndTime = end.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
                var nextEventTimeText = `${nextEventDate} ${nextEventTime} - ${nextEventEndTime}`
                var eventText = `${eventDetails.attributes.name} - ${nextEventTimeText}`

                var defaultEventListing = `<div title="${eventText}" style="background-color:dimgrey;
                    color:#fff;width:100%;height:100%;text-decoration:none;display:flex; justify-content:center;align-items:center;text-align:center;">
                    ${eventDetails.attributes.name}<br/>
                    ${nextEventTimeText}
                </div>`

                var imgUrl = eventDetails.attributes.image_url
                var img = imgUrl ? `<img class="pco-featured-event" src="${eventDetails.attributes.image_url}" />` : defaultEventListing

                var elem = document.createElement("a")
                elem.target = "_blank"
                elem.title = eventText
                elem.style.cssText = "text-decoration:none;"
                elem.href = `https://bethelsrock.churchcenter.com/calendar/event/${nextEvent.id}`
                elem.innerHTML = `${img}`

                nextEventContainer.appendChild(elem)
            }
            else {
                console.error('No next event for tag_id passed.')
            }
        })
    }, auth)
}())
