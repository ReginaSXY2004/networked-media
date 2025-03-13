let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 46.0, lng: -120.5 },
        zoom: 7,
    });

    map.addListener("click", (event) => {
        const lat = event.latLng.lat().toFixed(6);
        const lng = event.latLng.lng().toFixed(6);
        

        document.getElementById("lat").value = lat;
        document.getElementById("lng").value = lng;
        

        const formPopup = document.getElementById("form-popup");
        formPopup.style.display = "block";
    });

    const form = document.getElementById("pollution-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const response = await fetch('/submit-pollution-report', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        alert(result.message);
        
        // add pollution marker
        const marker = new google.maps.Marker({
            position: { lat: parseFloat(result.data.lat), lng: parseFloat(result.data.lng) },
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: 'red',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: 'white'
            }
        });
        
        const contentString = `
            <div>
                <h3>${result.data.pollutionType}</h3>
                ${result.data.imageUrl ? `<img src="${result.data.imageUrl}" alt="Pollution" style="width:100px;">` : ''}
            </div>
        `;
        
        const infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        
        marker.addListener("click", () => {
            infowindow.open(map, marker);
        });
        
        form.reset();
        document.getElementById("form-popup").style.display = "none";
    });
}
window.initMap = initMap;