function initMap() {
    const columbiaRiverBounds = {
        north: 49.0,
        south: 45.0,
        west: -124.0,
        east: -116.0
    };

    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 46.5, lng: -119.5 },
        zoom: 7,
        restriction: {
            latLngBounds: columbiaRiverBounds,
            strictBounds: false
        }
    });

    // 添加标记点
    addMarker(map, { lat: 46.5, lng: -123.0 }, "Downstream");
    addMarker(map, { lat: 47.0, lng: -120.0 }, "Midstream");
    addMarker(map, { lat: 48.0, lng: -118.0 }, "Upstream");

    // 点击地图上传报告
    map.addListener("click", (event) => {
        const latLng = event.latLng;
        const reportText = prompt("Enter your pollution report:");

        if (reportText) {
            addMarker(map, latLng, 'yellow');
            saveReportToServer(latLng, reportText);
        }
    });
}

function addMarker(map, position, title) {
    new google.maps.Marker({
        position,
        map,
        title
    });
}

function saveReportToServer(latLng, reportText) {
    fetch("/submit-report", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ lat: latLng.lat(), lng: latLng.lng(), text: reportText })
    }).then(response => response.json())
      .then(data => alert(data.message))
      .catch(error => console.error("Error:", error));
}
window.initMap = initMap;
