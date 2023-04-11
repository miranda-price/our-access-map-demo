var map = L.map('map').setView([43.1279308, -77.6299522], 22);
var userLoc = L.circleMarker([43.1279308, -77.6299522]).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// propogate floor select options
function floorOptions(selectID, floors, main) {
    var floorSelect = document.getElementById(selectID);
    floorSelect.innerHTML = '';
    for (let i = 0; i < floors.length; i++) {
        var opt = document.createElement("option");
        opt.text = floors[i];
        opt.value = floors[i];
        if (floors[i] == main) {
            opt.selected = true;
        }
        floorSelect.appendChild(opt);
    }
}
function propogateFloors(selectBuilding, selectFloor) {
    building = document.getElementById(selectBuilding).value;
    switch (building) {
    case 'Burton':
        floorOptions(selectFloor, ['0', '1', '2', '3'], '1');
        break;
    case 'Rettner':
        floorOptions(selectFloor, ['1', '2', '3'], '1');
        break;
    case 'Lattimore':
        floorOptions(selectFloor, ['1', '2', '3', '4', '5'], '3');
        break;
    case 'Morey':
        floorOptions(selectFloor, ['1', '2', '3', '4', '5'], '3');
        break;
    case 'Rush Rhees':
        floorOptions(selectFloor, ['G', '1', '2', '3', '4'], '1');
        break;
    case 'Hoyt':
        floorOptions(selectFloor, ['1', '2'], '1');
        break;
    case 'Bausch & Lomb':
        floorOptions(selectFloor, ['1', '2', '3', '4', '5'], '2');
        break;
    case 'Dewey':
        floorOptions(selectFloor, ['B', '1', '2', '3', '4', '5'], '2');
        break;
    default:
        floorOptions(selectFloor, ['B', 'G', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], '1');
    }
}
// propogate floors again on refresh
if (document.getElementById('start-building').value != "") {propogateFloors('start-building', 'start-floor');}
if (document.getElementById('end-building').value != "") {propogateFloors('end-building', 'end-floor');}

// find user location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
    var userLat = position.coords.latitude;
    var userLng = position.coords.longitude;
    map.flyTo([userLat, userLng], 18);
    userLoc.setLatLng([userLat, userLng]);
    // find building
    var startBuilding = document.getElementById('start-building');
    if (userLat >= 43.1291045 && userLng >= -77.6315905 && userLat <= 43.1294653 && userLng <= -77.6310999) {
        startBuilding.value = "Burton";
    } else if (userLat >= 43.1283453 && userLng >= -77.6301887 && userLat <= 43.1287222 && userLng <= -77.6299084) {
        startBuilding.value = "Rettner";
    } else if (userLat >= 43.1278795 && userLng >= -77.6310298 && userLat <= 43.1284557 && userLng <= -77.6303584) {
        startBuilding.value = "Lattimore";
    } else if (userLat >= 43.1282511 && userLng >= -77.6300449 && userLat <= 43.1286226 && userLng <= -77.6293624) {
        startBuilding.value = "Morey";
    } else if (userLat >= 43.1280746 && userLng >= -77.6289956 && userLat <= 43.1289271 && userLng <= -77.6279555) {
        startBuilding.value = "Rush Rhees";
    } else if (userLat >= 43.1271754 && userLng >= -77.6296437 && userLat <= 43.1275899 && userLng <= -77.6294596) {
        //startBuilding.value = "Hoyt";
    }  else if (userLat >= 43.1271345 && userLng >= -77.6293156 && userLat <= 43.1279928 && userLng <= -77.6289476) {
        //startBuilding.value = "Bausch & Lomb";
    } else if (userLat >= 43.1267433 && userLng >= -77.6302677 && userLat <= 43.1276542 && userLng <= -77.6297637) {
        //startBuilding.value = "Dewey";
    } else if (userLat >= 43.1274794 && userLng >= -77.6285473 && userLat <= 43.1280803 && userLng <= -77.6276703) {
        //startBuilding.value = "Meliora";
    } else if (userLat >= 43.1269482 && userLng >= -77.6286189 && userLat <= 43.1273618 && userLng <= -77.6280461) {
        //startBuilding.value = "Harkness";
    } else if (userLat >= 43.1261294 && userLng >= -77.6292852 && userLat <= 43.1265213 && userLng <= -77.6287662) {
        //startBuilding.value = "Taylor";
    } else if (userLat >= 43.1264211 && userLng >= -77.6294761 && userLat <= 43.1271004 && userLng <= -77.6286707) {
        //startBuilding.value = "Gavett";
    } else if (userLat >= 43.1262774 && userLng >= -77.6302696 && userLat <= 43.1267303 && userLng <= -77.6297088) {
        //startBuilding.value = "Hopeman";
    } else if (userLat >= 43.1260075 && userLng >= -77.6304068 && userLat <= 43.1262774 && userLng <= -77.6296134) {
        //startBuilding.value = "Wegmans";
    }else if (userLat >= 43.1266223 && userLng >= -77.6310156 && userLat <= 43.1271578 && userLng <= -77.6305801) {
        //startBuilding.value = "Gleason";
    }  else if (userLat >= 43.1269663 && userLng >= -77.6312065 && userLat <= 43.1273668 && userLng <= -77.6308008) {
        //startBuilding.value = "Schlegel";
    } else if (userLat >= 43.1268052 && userLng >= -77.6300073 && userLat <= 43.1271578 && userLng <= -77.6297389) {
        //startBuilding.value = "Simon";
    } else if (userLat >= 43.126097 && userLng >= -77.631331 && userLat <= 43.1267153 && userLng <= -77.6306688) {
        //startBuilding.value = "Wallis";
    } else if (userLat >= 43.1257225 && userLng >= -77.6292906 && userLat <= 43.125901 && userLng <= -77.6289923) {
        //startBuilding.value = "Wilmot";
    } else if (userLat >= 43.1251521 && userLng >= -77.6295293 && userLat <= 43.1258471 && userLng <= -77.6290006) {
        //startBuilding.value = "Goergen";
    } else if (userLat >= 43.1248152 && userLng >= -77.6304026 && userLat <= 43.1251635 && userLng <= -77.6300386) {
        //startBuilding.value = "Carlson";
    } else if (userLat >= 43.1249414 && userLng >= -77.6300327 && userLat <= 43.1252898 && userLng <= -77.629627) {
        //startBuilding.value = "Computer Studies";
    } else if (userLat >= 43.1254814 && userLng >= -77.6304324 && userLat <= 43.1256947 && userLng <= -77.6301758) {
        //startBuilding.value = "Hylan";
    } else if (userLat >= 43.124557 && userLng >= -77.6310543 && userLat <= 43.1258211 && userLng <= -77.6304603) {
        //startBuilding.value = "Hutchison";
    } else if (userLat >= 43.1268508 && userLng >= -77.632492 && userLat <= 43.1272209 && userLng <= -77.632152) {
        //startBuilding.value = "Interfaith Chapel";
    } else if (userLat >= 43.1275344 && userLng >= -77.6316866 && userLat <= 43.128083 && userLng <= -77.6313286) {
        //startBuilding.value = "Strong Auditorium";
    } else if (userLat >= 43.1277086 && userLng >= -77.6323309 && userLat <= 43.1282224 && userLng <= -77.6320923) {
        //startBuilding.value = "Sloane Performing Arts Center";
    } else if (userLat >= 43.1279785 && userLng >= -77.6319849 && userLat <= 43.1284575 && userLng <= -77.6315017) {
        //startBuilding.value = "Todd Union";
    } else if (userLat >= 43.1283182 && userLng >= -77.6313465 && userLat <= 43.1288145 && userLng <= -77.6306127) {
        //startBuilding.value = "LeChase";
    } else if (userLat >= 43.1286404 && userLng >= -77.63004 && userLat <= 43.1292064 && userLng <= -77.6294613) {
        //startBuilding.value = "Wilson Commons";
    } else if (userLat >= 43.1287144 && userLng >= -77.6291332 && userLat <= 43.1293806 && userLng <= -77.6285783) {
        //startBuilding.value = "Douglass";
    } else if (userLat >= 43.13028 && userLng >= -77.629055 && userLat <= 43.131488 && userLng <= -77.6282274) {
        //startBuilding.value = "Fauver Stadium";
    } else if (userLat >= 43.1294357 && userLng >= -77.6300989 && userLat <= 43.1311791 && userLng <= -77.6295346) {
        //startBuilding.value = "Goergen Athletic Center";
    } else if (userLat >= 43.1303749 && userLng >= -77.6272715 && userLat <= 43.1308994 && userLng <= -77.6265476) {
        //startBuilding.value = "Spurrier Gym";
    } else if (userLat >= 43.1293766 && userLng >= -77.6272404 && userLat <= 43.1304254 && userLng <= -77.6259561) {
        //startBuilding.value = "Susan B. Anthony";
    } else if (userLat >= 43.1303798 && userLng >= -77.6272821 && userLat <= 43.1309067 && userLng <= -77.6265462) {
        //startBuilding.value = "Genesee";
    } else if (userLat >= 43.1290506 && userLng >= -77.6271478 && userLat <= 43.1293343 && userLng <= -77.6266063) {
        //startBuilding.value = "University Health Service";
    } else if (userLat >= 43.1293783 && userLng >= -77.6308768 && userLat <= 43.1297504 && userLng <= -77.630357) {
        //startBuilding.value = "Crosby";
    } else if (userLat >= 43.1297975 && userLng >= -77.6311238 && userLat <= 43.1303284 && userLng <= -77.6306609) {
        //startBuilding.value = "Hoeing";
    } else if (userLat >= 43.12945 && userLng >= -77.6318601 && userLat <= 43.1300131 && userLng <= -77.6314589) {
        //startBuilding.value = "Lovejoy";
    } else if (userLat >= 43.129968 && userLng >= -77.6322349 && userLat <= 43.1305086 && userLng <= -77.6318116) {
        //startBuilding.value = "Tiernan";
    } else if (userLat >= 43.1302737 && userLng >= -77.6315736 && userLat <= 43.1310653 && userLng <= -77.630996) {
        //startBuilding.value = "Gilbert";
    } else if (userLat >= 43.1308969 && userLng >= -77.625833 && userLat <= 43.131247 && userLng <= -77.6253606) {
        //startBuilding.value = "Sage";
    } else if (userLat >= 43.1313852 && userLng >= -77.6261995 && userLat <= 43.1315629 && userLng <= -77.6257199) {
        //startBuilding.value = "Anderson";
    } else if (userLat >= 43.131677 && userLng >= -77.6257659 && userLat <= 43.1318573 && userLng <= -77.6249119) {
        //startBuilding.value = "O'Brien";
    } else if (userLat >= 43.1311651 && userLng >= -77.6252644 && userLat <= 43.1315099 && userLng <= -77.62501) {
        //startBuilding.value = "Wilder";
    } else if (userLat >= 43.1307307 && userLng >= -77.6232879 && userLat <= 43.1310936 && userLng <= -77.6228528) {
        //startBuilding.value = "Gale";
    } else if (userLat >= 43.1308577 && userLng >= -77.6228155 && userLat <= 43.1312086 && userLng <= -77.6224218) {
        //startBuilding.value = "Fairchild";
    } else if (userLat >= 43.1300562 && userLng >= -77.6233916 && userLat <= 43.1303526 && userLng <= -77.6229605) {
        //startBuilding.value = "Munro";
    } else if (userLat >= 43.1308426 && userLng >= -77.6223264 && userLat <= 43.1312176 && userLng <= -77.6219162) {
        //startBuilding.value = "Chambers";
    } else if (userLat >= 43.1301221 && userLng >= -77.6238099 && userLat <= 43.13047 && userLng <= -77.6234204) {
        //startBuilding.value = "Slater";
    } else if (userLat >= 43.1303339 && userLng >= -77.6231634 && userLat <= 43.1306666 && userLng <= -77.6227283) {
        //startBuilding.value = "Kendrick";
    }
    else {
        startBuilding.value = "";
    }

    if (startBuilding.value != "") {propogateFloors('start-building', 'start-floor')}
    })
} else {
    map.flyTo([43.1279308, -77.6299522], 18);
}

// update user location
function updateLoc() {
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        userLoc.setLatLng([position.coords.latitude, position.coords.longitude]);
    })
    }
}
setInterval(updateLoc, 100)
    
// define custom icon classes
var benchIcon = L.icon({
    iconUrl: 'icons/map-icons-bench.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12]
});
var rampIcon = L.icon({
    iconUrl: 'icons/map-icons_ramp.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12]
});
var ElevatorNotWCIcon = L.icon({
    iconUrl: 'icons/map-icons_elevator-wc-inaccessible.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12]
});
var ElevatorWCIcon = L.icon({
    iconUrl: 'icons/map-icons_elevator-wc-accessible.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12]
});
var ElevatorNotWCBrokenIcon = L.icon({
    iconUrl: 'icons/map-icons_elevator-wc-inaccessible-broken.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12]
});
var ElevatorWCBrokenIcon = L.icon({
    iconUrl: 'icons/map-icons_elevator-wc-accessible-broken.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12]
});
var stairsIcon = L.icon({
    iconUrl: 'icons/map-icons_stairs.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12]
});
var stepsIcon = L.icon({
    iconUrl: 'icons/map-icons_steps.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12]
});

// accessibility feature/obstacle icon layers
var elevatorsWC = L.layerGroup([
    L.marker([43.1276125, -77.6291051], {icon: ElevatorWCIcon}),
    L.marker([43.1274355, -77.6299342], {icon: ElevatorWCIcon}),
    L.marker([43.1287886,	-77.6283118], {icon: ElevatorWCIcon}),
    L.marker([43.1285332,	-77.6287911], {icon: ElevatorWCIcon}),
    L.marker([43.1283968,	-77.629964], {icon: ElevatorWCIcon}),
])

var elevatorsNotWC = L.layerGroup([
    L.marker([43.1268674,	-77.6298621], {icon: ElevatorNotWCIcon}),
    L.marker([43.1280796,	-77.6307938], {icon: ElevatorNotWCIcon}),
    L.marker([43.128426,	-77.6282768], {icon: ElevatorNotWCIcon}),
    L.marker([43.1285562,	-77.6284588], {icon: ElevatorNotWCIcon}),
])

var stairs = L.layerGroup([
    L.marker([43.1275485,	-77.6297659], {icon: stairsIcon}),
    L.marker([43.1275985,	-77.629621], {icon: stairsIcon}),
    L.marker([43.1282961,	-77.6298432], {icon: stairsIcon}),
    L.marker([43.1283492,	-77.6296488], {icon: stairsIcon}),
    L.marker([43.1282856,	-77.629008], {icon: stairsIcon}),
    L.marker([43.1275883,	-77.6311369], {icon: stairsIcon}),
    L.marker([43.1275439,	-77.6310123], {icon: stairsIcon}),
    L.marker([43.1274337,	-77.6310388], {icon: stairsIcon}),
    L.marker([43.1279407,	-77.6312298], {icon: stairsIcon}),
    L.marker([43.1287609,	-77.6289171], {icon: stairsIcon}),
    L.marker([43.1285883,	-77.6291013], {icon: stairsIcon}),
    L.marker([43.128738,	-77.6290179], {icon: stairsIcon}),
    L.marker([43.1276688,	-77.6294263], {icon: stairsIcon}),
    L.marker([43.1278215,	-77.629013], {icon: stairsIcon}),
    L.marker([43.1273017,	-77.6290454], {icon: stairsIcon}),
    L.marker([43.1293054,	-77.631355], {icon: stairsIcon}),
    L.marker([43.1292582,	-77.6314721], {icon: stairsIcon}),
    L.marker([43.12934,	-77.631243], {icon: stairsIcon}),
    L.marker([43.1269542,	-77.6298441], {icon: stairsIcon}),
    L.marker([43.1271962,	-77.6299666], {icon: stairsIcon}),
    L.marker([43.1274355,	-77.6300423], {icon: stairsIcon}),
    L.marker([43.1273277,	-77.6302874], {icon: stairsIcon}),
    L.marker([43.1274329,	-77.6295342], {icon: stairsIcon}),
    L.marker([43.1274118,	-77.6296135], {icon: stairsIcon}),
    L.marker([43.1283633,	-77.6308529], {icon: stairsIcon}),
    L.marker([43.1281519,	-77.630689], {icon: stairsIcon}),
    L.marker([43.1284164,	-77.6298514], {icon: stairsIcon}),
    L.marker([43.1285104,	-77.6296046], {icon: stairsIcon}),
    L.marker([43.1286647,	-77.6300753], {icon: stairsIcon}),
    L.marker([43.1285523,	-77.6301978], {icon: stairsIcon}),
    L.marker([43.1284771,	-77.6284728], {icon: stairsIcon}),
    L.marker([43.1283877,	-77.6283713], {icon: stairsIcon}),
    L.marker([43.1285358,	-77.6283328], {icon: stairsIcon}),
    L.marker([43.1285179,	-77.627899], {icon: stairsIcon}),
    L.marker([43.1283698,	-77.6289871], {icon: stairsIcon}),
    L.marker([43.1283162,	-77.6286512], {icon: stairsIcon}),
    L.marker([43.1284745,	-77.6287526], {icon: stairsIcon}),
]);

var steps = L.layerGroup([
    L.marker([43.1278898,	-77.629309], {icon: stepsIcon}),
    L.marker([43.1292073,	-77.6314372], {icon: stepsIcon}),
    L.marker([43.1292527,	-77.6313251], {icon: stepsIcon}),
    L.marker([43.1292927,	-77.6312056], {icon: stepsIcon}),
    L.marker([43.1275354,	-77.6302513], {icon: stepsIcon}),
    L.marker([43.127437,	-77.6297163], {icon: stepsIcon}),
    L.marker([43.1275113,	-77.6295178], {icon: stepsIcon}),
    L.marker([43.1280086,	-77.6305709], {icon: stepsIcon}),
    L.marker([43.1284373,	-77.6294587], {icon: stepsIcon}),
]);

var ramps = L.layerGroup([
    L.marker([43.1278946,	-77.6292573], {icon: rampIcon}),
    L.marker([43.1275275,	-77.6302802], {icon: rampIcon}),
    L.marker([43.1280017,	-77.6305957], {icon: rampIcon}),
    L.marker([43.1284461,	-77.6294503], {icon: rampIcon}),
    L.marker([43.1285883,	-77.6290144], {icon: rampIcon}),
]);

var benches = L.layerGroup([
    L.marker([43.1282528,	-77.6300452], {icon: benchIcon}),
    L.marker([43.1281894,	-77.6302399], {icon: benchIcon}),
    L.marker([43.1286943,	-77.6287485], {icon: benchIcon}),
    L.marker([43.1279306,	-77.6299444], {icon: benchIcon}),
    L.marker([43.1288705,	-77.6290047], {icon: benchIcon}),
    L.marker([43.1276439,	-77.6298366], {icon: benchIcon}),
    L.marker([43.1276896,	-77.6296767], {icon: benchIcon}),
    L.marker([43.1283067,	-77.6297827], {icon: benchIcon}),
    L.marker([43.1284767,	-77.6291222], {icon: benchIcon}),
    L.marker([43.128124,	-77.6288823], {icon: benchIcon}),
    L.marker([43.1274054,	-77.6307613], {icon: benchIcon}),
    L.marker([43.1277758,	-77.6310082], {icon: benchIcon}),
    L.marker([43.1289136,	-77.6291993], {icon: benchIcon}),
    L.marker([43.129076,	-77.6293036], {icon: benchIcon}),
]);

// layer controls
var overlayMaps = {
    "<span class='layer-key'><img src='icons/map-icons_elevator-wc-accessible.svg' width=18px /><span>Elevators: WC Accessible</span></span>": elevatorsWC.addTo(map),
    "<span class='layer-key'><img src='icons/map-icons_elevator-wc-inaccessible.svg' width=18px /><span>Elevators: WC Inaccessible</span></span>": elevatorsNotWC.addTo(map),
    "<span class='layer-key'><img src='icons/map-icons_ramp.svg' width=18px /><span>Ramps</span></span>": ramps.addTo(map),
    "<span class='layer-key'><img src='icons/map-icons_stairs.svg' width=18px /><span>Stairs</span></span>": stairs.addTo(map),
    "<span class='layer-key'><img src='icons/map-icons_steps.svg' width=18px /><span>Steps</span></span>": steps.addTo(map),
    "<span class='layer-key'><img src='icons/map-icons-bench.svg' width=18px /><span>Benches</span></span>": benches.addTo(map)
};
var layerControl = L.control.layers(null, overlayMaps, {collapsed: false}).addTo(map);