var map = L.map('map').setView([43.1279308, -77.6299522], 22);
var userLoc = L.circleMarker([43.1279308, -77.6299522]).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


document.getElementById('access-features').hidden = false;
document.getElementById('directions-container').hidden = true;
document.getElementById('find-route').hidden = false;
document.getElementById('finish-route').hidden = true;

class Node {
    constructor(building, level, id, edges, type, coords, length, route) {
        this.building = building;
        this.level = level;
        this.id = id;
        this.edges = edges;
        this.type = type;
        this.coords = coords;
        this.length = length;
        this.route = route;
    }
}

class Edge {
    constructor(type, id, length, steps, stairs, manual_doors, non_wc_elevators, ada, dir, revDir, report, coords) {
        this.type = type;
        this.id = id;
        this.length = length;
        this.ada = ada;
        this.steps = steps;
        this.stairs = stairs;
        this.manual_doors = manual_doors;
        this.non_wc_elevators = non_wc_elevators;
        this.dir = dir;
        this.revDir = revDir;
        this.report = report;
        this.coords = coords;
    }

    allowEdge(allow_steps, allow_stairs, allow_non_wc_elevators, allow_manual_doors) {
        if (this.ada) {return true;}
        if (this.steps && !allow_steps) {return false;}
        if (this.stairs && !allow_steps) {return false;}
        if (this.stairs && !allow_stairs) {return false;}
        if (this.allow_manual_doors && !allow_manual_doors) {return false;}
        if (this.non_wc_elevators && !allow_non_wc_elevators) {return false;}
        return true;
    }

    findLength() {
        if (this.coords.length < 2) {return}
        else if (this.coords.length == 2) {
            this.length = map.distance(this.coords[0], this.coords[1]);
        }
        else {
            var sum = 0;
            for (let i = 0; i<this.coords.length - 1; i++) {
                sum += map.distance(this.coords[i], this.coords[i+1]);
            }
            this.length = sum;
        }
    }
}

// propogate floor select options
function floorOptions(selectID, floors, main) {
    var floorSelect = document.getElementById(selectID);
    floorSelect.innerHTML = '';
    for (let i = 0; i < floors.length; i++) {
        var opt = document.createElement("option");
        opt.text = floors[i];
        opt.value = floors[i];
        if (floors[i] == main) {opt.selected = true;}
        floorSelect.appendChild(opt);
    }
}
function propogateFloors(selectBuilding, selectFloor) {
    building = document.getElementById(selectBuilding).value;
    var floors;
    var main;
    switch (building) {
    case 'Burton':
        floors = ['0', '1', '2', '3'];
        main = '1';
        break;
    case 'Rettner':
        floors = ['1', '2', '3'];
        main = '1';
        break;
    case 'Lattimore':
        floors = ['1', '2', '3', '4', '5'];
        main = '3';
        break;
    case 'Morey':
        floors = ['1', '2', '3', '4', '5'];
        main = '3';
        break;
    case 'Rush Rhees':
        floors = ['G', '1', '2', '3', '4'];
        main = '1';
        break;
    case 'Hoyt':
        floors = ['1', '2'];
        main = '1';
        break;
    case 'Bausch & Lomb':
        floors = ['1', '2', '3', '4', '5'];
        main = '2';
        break;
    case 'Dewey':
        floors = ['B', '1', '2', '3', '4', '5'];
        main = '2';
        break;
    default:
        floors = ['B', 'G', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        main = '1';
    }

    floorOptions(selectFloor, floors, main);

    if (selectBuilding == 'start-building-overlay' || selectBuilding == 'end-building-overlay') {
        if (document.getElementById('start-building-overlay').value != "" && document.getElementById('end-building-overlay').value != "") {
            document.getElementById('input-overlay').hidden = true;
            document.getElementById('sidebar-container').hidden = false;
            document.getElementById('start-building').value = document.getElementById('start-building-overlay').value;
            document.getElementById('end-building').value = document.getElementById('end-building-overlay').value;
            document.getElementById('start-floor').innerHTML = document.getElementById('start-floor-overlay').innerHTML;
            document.getElementById('start-floor').value = document.getElementById('start-floor-overlay').value;
            document.getElementById('end-floor').innerHTML = document.getElementById('end-floor-overlay').innerHTML;
            document.getElementById('end-floor').value = document.getElementById('end-floor-overlay').value;

            
            document.getElementById('map').style.width = "75vw";
            document.getElementById('map').style.left = "25vw";

            if (selectBuilding == 'start-building-overlay') {floorOptions('start-floor', floors, main);}
            if (selectBuilding == 'end-building-overlay') {floorOptions('end-floor', floors, main);}
            document.getElementById('map').classList.remove('overlay-map');
        }
    }
}
// propogate floors again on refresh
if (document.getElementById('start-building').value != "") {propogateFloors('start-building', 'start-floor');}
if (document.getElementById('end-building').value != "") {propogateFloors('end-building', 'end-floor');}
if (document.getElementById('start-building-overlay').value != "") {propogateFloors('start-building-overlay', 'start-floor-overlay');}
if (document.getElementById('end-building-overlay').value != "") {propogateFloors('end-building-overlay', 'end-floor-overlay');}

var userLat = 43.1279308;
var userLng = -77.6299522;
var located = false;

// user location tracking
function showPosition(position) {
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;
    if (!located) {
        located = true;
        map.flyTo([userLat, userLng], 18);
    }
    userLoc.setLatLng([userLat, userLng]);
    //find building
    var startBuilding = document.getElementById('start-building-overlay');
    if(startBuilding.value == "") {
        if (userLat >= 43.1291045 && userLng >= -77.6315905 && userLat <= 43.1294653 && userLng <= -77.6310999) {
            startBuilding.value = "Burton";
        } else if (userLat >= 43.1283453 && userLng >= -77.6301887 && userLat <= 43.1287222 && userLng <= -77.6299084) {
            startBuilding.value = "Rettner";
        } else if (userLat >= 43.1278795 && userLng >= -77.6310298 && userLat <= 43.1284557 && userLng <= -77.6303584) {
            //startBuilding.value = "Lattimore";
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
        if (startBuilding.value != "") {
            propogateFloors('start-building-overlay', 'start-floor-overlay')
            propogateFloors('start-building', 'start-floor')
        }
    }
}

function switchInput() {
    var tempBuilding = document.getElementById('start-building').value;
    var tempFloor = document.getElementById('start-floor').value;
    document.getElementById('start-building').value = document.getElementById('end-building').value;
    document.getElementById('start-floor').value = document.getElementById('end-floor').value;
    document.getElementById('end-building').value = tempBuilding;
    document.getElementById('end-floor').value = tempFloor;
}


function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(showPosition);
    } else {
      console.log('Geolocation not supported');
      map.flyTo([43.1279308, -77.6299522], 18);
    }
}
getLocation();
    
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
    L.marker([43.1276125, -77.6291051], {icon:ElevatorWCIcon}),
    L.marker([43.1274355, -77.6299342], {icon:ElevatorWCIcon}),
    L.marker([43.1283968, -77.629964], {icon:ElevatorWCIcon}),
    L.marker([43.1287886, -77.6283118], {icon:ElevatorWCIcon}),
    L.marker([43.1285332, -77.6287911], {icon:ElevatorWCIcon}),
])
    
var elevatorsNotWC = L.layerGroup([
    L.marker([43.1280796, -77.6307938], {icon:ElevatorNotWCIcon}),
    L.marker([43.1268674, -77.6298621], {icon:ElevatorNotWCIcon}),
    L.marker([43.1285562, -77.6284588], {icon:ElevatorNotWCIcon}),
    L.marker([43.128426, -77.6282768], {icon:ElevatorNotWCIcon}),
])
    
var stairs = L.layerGroup([
    L.marker([43.1275485, -77.6297659], {icon:stairsIcon}),
    L.marker([43.1275985, -77.629621], {icon:stairsIcon}),
    L.marker([43.1282961, -77.6298432], {icon:stairsIcon}),
    L.marker([43.1283492, -77.6296488], {icon:stairsIcon}),
    L.marker([43.1282856, -77.629008], {icon:stairsIcon}),
    L.marker([43.1275883, -77.6311369], {icon:stairsIcon}),
    L.marker([43.1275439, -77.6310123], {icon:stairsIcon}),
    L.marker([43.1274337, -77.6310388], {icon:stairsIcon}),
    L.marker([43.1279407, -77.6312298], {icon:stairsIcon}),
    L.marker([43.1287609, -77.6289171], {icon:stairsIcon}),
    L.marker([43.1285883, -77.6291013], {icon:stairsIcon}),
    L.marker([43.128738, -77.6290179], {icon:stairsIcon}),
    L.marker([43.1276688, -77.6294263], {icon:stairsIcon}),
    L.marker([43.1278215, -77.629013], {icon:stairsIcon}),
    L.marker([43.1273017, -77.6290454], {icon:stairsIcon}),
    L.marker([43.1293054, -77.631355], {icon:stairsIcon}),
    L.marker([43.1292582, -77.6314721], {icon:stairsIcon}),
    L.marker([43.12934, -77.631243], {icon:stairsIcon}),
    L.marker([43.1269542, -77.6298441], {icon:stairsIcon}),
    L.marker([43.1271962, -77.6299666], {icon:stairsIcon}),
    L.marker([43.1274355, -77.6300423], {icon:stairsIcon}),
    L.marker([43.1273277, -77.6302874], {icon:stairsIcon}),
    L.marker([43.1274329, -77.6295342], {icon:stairsIcon}),
    L.marker([43.1274118, -77.6296135], {icon:stairsIcon}),
    L.marker([43.1283633, -77.6308529], {icon:stairsIcon}),
    L.marker([43.1281519, -77.630689], {icon:stairsIcon}),
    L.marker([43.1284164, -77.6298514], {icon:stairsIcon}),
    L.marker([43.1285104, -77.6296046], {icon:stairsIcon}),
    L.marker([43.1286647, -77.6300753], {icon:stairsIcon}),
    L.marker([43.1285523, -77.6301978], {icon:stairsIcon}),
    L.marker([43.1284771, -77.6284728], {icon:stairsIcon}),
    L.marker([43.1283877, -77.6283713], {icon:stairsIcon}),
    L.marker([43.1285358, -77.6283328], {icon:stairsIcon}),
    L.marker([43.1285179, -77.627899], {icon:stairsIcon}),
    L.marker([43.1283698, -77.6289871], {icon:stairsIcon}),
    L.marker([43.1283162, -77.6286512], {icon:stairsIcon}),
    L.marker([43.1284745, -77.6287526], {icon:stairsIcon}),
])
    
var steps = L.layerGroup([
    L.marker([43.1278898, -77.629309], {icon:stepsIcon}),
    L.marker([43.1292073, -77.6314372], {icon:stepsIcon}),
    L.marker([43.1292527, -77.6313251], {icon:stepsIcon}),
    L.marker([43.1292927, -77.6312056], {icon:stepsIcon}),
    L.marker([43.1275354, -77.6302513], {icon:stepsIcon}),
    L.marker([43.127437, -77.6297163], {icon:stepsIcon}),
    L.marker([43.1275113, -77.6295178], {icon:stepsIcon}),
    L.marker([43.1280086, -77.6305709], {icon:stepsIcon}),
    L.marker([43.1284373, -77.6294587], {icon:stepsIcon}),
])
    
var ramps = L.layerGroup([
    L.marker([43.1278946, -77.6292573], {icon:rampIcon}),
    L.marker([43.1275275, -77.6302802], {icon:rampIcon}),
    L.marker([43.1280017, -77.6305957], {icon:rampIcon}),
    L.marker([43.1284461, -77.6294503], {icon:rampIcon}),
    L.marker([43.1285883, -77.6290144], {icon:rampIcon}),
])
    
var benches = L.layerGroup([
    L.marker([43.1282528, -77.6300452], {icon:benchIcon}),
    L.marker([43.1281894, -77.6302399], {icon:benchIcon}),
    L.marker([43.1286943, -77.6287485], {icon:benchIcon}),
    L.marker([43.1279306, -77.6299444], {icon:benchIcon}),
    L.marker([43.1288705, -77.6290047], {icon:benchIcon}),
    L.marker([43.1276439, -77.6298366], {icon:benchIcon}),
    L.marker([43.1276896, -77.6296767], {icon:benchIcon}),
    L.marker([43.1283067, -77.6297827], {icon:benchIcon}),
    L.marker([43.1284767, -77.6291222], {icon:benchIcon}),
    L.marker([43.128124, -77.6288823], {icon:benchIcon}),
    L.marker([43.1274054, -77.6307613], {icon:benchIcon}),
    L.marker([43.1277758, -77.6310082], {icon:benchIcon}),
    L.marker([43.1289136, -77.6291993], {icon:benchIcon}),
    L.marker([43.129076, -77.6293036], {icon:benchIcon}),
])

// layer controls
var overlayMaps = {
    "<span class='layer-key'><img src='icons/map-icons_elevator-wc-accessible.svg' width=18px /><span>Elevators: WC Accessible</span></span>": elevatorsWC.addTo(map),
    "<span class='layer-key'><img src='icons/map-icons_elevator-wc-inaccessible.svg' width=18px /><span>Elevators: WC Inaccessible</span></span>": elevatorsNotWC.addTo(map),
    "<span class='layer-key'><img src='icons/map-icons_ramp.svg' width=18px /><span>Ramps</span></span>": ramps.addTo(map),
    "<span class='layer-key'><img src='icons/map-icons_stairs.svg' width=18px /><span>Stairs</span></span>": stairs.addTo(map),
    "<span class='layer-key'><img src='icons/map-icons_steps.svg' width=18px /><span>Steps</span></span>": steps.addTo(map),
    "<span class='layer-key'><img src='icons/map-icons-bench.svg' width=18px /><span>Benches</span></span>": benches.addTo(map)
};
var layerControl = L.control.layers(null, overlayMaps).addTo(map);

var start = null;
var end = null;

function find_route(event) {
    event.preventDefault();
    console.log("find route");
    var allow_steps = document.getElementById("allowSteps").checked;
    var allow_stairs = document.getElementById("allowStairs").checked;
    var allow_manual_doors = document.getElementById("allowDoors").checked;
    var allow_non_wc_elevators = document.getElementById("allowElevators").checked;

    // define edges
    // Burton
    BR00BR01 = new Edge('floor', 'BR00BR01', 5, true, true, false, false, false, 'ground floor to first floor', 'first floor to ground floor', null);
    BR00BR02 = new Edge('floor', 'BR00BR02', 10, true, true, false, false, false, 'ground floor to second floor', 'second floor to ground floor', null);
    BR00BR03 = new Edge('floor', 'BR00BR03', 15, true, true, false, false, false, 'ground floor to third floor', 'third floor to ground floor', null);
    BR01BR02 = new Edge('floor', 'BR01BR02', 5, true, true, false, false, false, 'first floor to second floor', 'second floor to first floor', null);
    BR01BR03 = new Edge('floor', 'BR01BR03', 10, true, true, false, false, false, 'first floor to third floor', 'third floor to first floor', null);
    BR00BR00A = new Edge('level', 'BR00BR00A', 0, false, false, false, false, true, null, null, null);
    BR01BR01A = new Edge('level', 'BR01BR01A', 0, false, false, false, false, true, null, null, null);
    BR01BR01B = new Edge('level', 'BR01BR01B', 0, false, false, false, false, true, null, null, null);
    BR01BR01C = new Edge('level', 'BR01BR01C', 0, false, false, false, false, true, null, null, null);

    // Rettner
    RT01RT02 = new Edge('floor', 'RT01RT02', 5, false, false, false, false, true, 'first floor to second floor', 'second floor to first floor', ['Morey/Rettner hall elevator'], null);
    RT01RT03 = new Edge('floor', 'RT01RT03', 10, false, false, false, false, true, 'first floor to third floor', 'third floor to first floor', ['Morey/Rettner hall elevator'], null);
    RT02RT03 = new Edge('floor', 'RT02RT03', 5, false, false, false, false, true, 'second floor to third floor', 'third floor to second floor', ['Morey/Rettner hall elevator'], null);
    RT01RT01A = new Edge('level', 'RT01RT01A', 0, false, false, false, false, true, null, null, null, null);
    RT01RT01B = new Edge('level', 'RT01RT01B', 0, false, false, false, false, true, null, null, null, null);
    RT01RT01C = new Edge('level', 'RT01RT01C', 0, false, false, false, false, true, null, null, null, null);

    // Morey
    MRGMR01 = new Edge('floor', 'MRGMR01', 5, false, false, false, false, true, 'ground floor to first floor', 'second floor to first floor', ['Morey hall elevator'], null);
    MRGMR02 = new Edge('floor', 'MRGMR02', 10, false, false, false, false, true, 'ground floor to second floor', 'first floor to second floor', ['Morey hall elevator'], null);
    MRGMR03 = new Edge('floor', 'MRGMR03', 15, false, false, false, false, true, 'ground floor to third floor', 'third floor to ground floor', ['Morey hall elevator'], null);
    MRGMR04 = new Edge('floor', 'MRGMR04', 20, false, false, false, false, true, 'ground floor to fourth floor', 'fourth floor to ground floor', ['Morey hall elevator'], null);
    MRGMR05 = new Edge('floor', 'MRGMR05', 25, false, false, false, false, true, 'ground floor to fifth floor', 'fifth floor to ground floor', ['Morey hall elevator'], null);
    MR01MR02 = new Edge('floor', 'MR01MR02', 5, false, false, false, false, true, 'first floor to second floor', 'second floor to first floor', ['Morey hall elevator'], null);
    MR01MR03 = new Edge('floor', 'MR01MR03', 10, false, false, false, false, true, 'first floor to third floor', 'third floor to first floor', ['Morey hall elevator'], null);
    MR01MR04 = new Edge('floor', 'MR01MR04', 15, false, false, false, false, true, 'first floor to fourth floor', 'fourth floor to first floor', ['Morey hall elevator'], null);
    MR01MR05 = new Edge('floor', 'MR01MR05', 20, false, false, false, false, true, 'first floor to fifth floor', 'fifth floor to first floor', ['Morey hall elevator'], null);
    MR02MR03 = new Edge('floor', 'MR02MR03', 5, false, false, false, false, true, 'second floor to third floor', 'third floor to second floor', ['Morey hall elevator'], null);
    MR02MR04 = new Edge('floor', 'MR02MR04', 10, false, false, false, false, true, 'second floor to fourth floor', 'fourth floor to second floor', ['Morey hall elevator'], null);
    MR02MR05 = new Edge('floor', 'MR02MR05', 15, false, false, false, false, true, 'second floor to fifth floor', 'fifth floor to second floor', ['Morey hall elevator'], null);
    MR03MR04 = new Edge('floor', 'MR03MR04', 5, false, false, false, false, true, 'third floor to fourth floor', 'fourth floor to third floor', ['Morey hall elevator'], null);
    MR03MR05 = new Edge('floor', 'MR03MR05', 10, false, false, false, false, true, 'third floor to fifth floor', 'fifth floor to third floor', ['Morey hall elevator'], null);
    MR02MR02A = new Edge('level', 'MR02MR02A', 0, false, false, false, false, true, null, null, null);
    MR03MR03A = new Edge('level', 'MR03MR03A', 0, false, false, false, false, true, null, null, null);
    MR03MR03B = new Edge('level', 'MR03MR03B', 0, false, false, false, false, true, null, null, null);
    MR03MR03C = new Edge('level', 'MR03MR03C', 0, false, false, false, false, true, null, null, null);
    MRGRT01 = new Edge('connection', 'MRGRT01', 0, false, false, false, false, true, 'exit the elevator area and enter floor 1 of Rettner', 'enter the elevator area near Morey', ['broken push door button from Rettner 1 to Morey elevator'], null);
    MR01RT01 = new Edge('connection', 'MR01RT01', 0, true, true, false, false, true, 'go down the steps to enter floor 1 of Rettner', 'go up the steps to enter floor 1 of Morey', null, null);
    MR02RT02 = new Edge('connection', 'MR02RT02', 0, false, false, false, false, true, 'take a right before the elevator to enter floor 2 of Rettner', 'go past the seating area to enter floor 2 of Morey', null, null);
    MR03RT03 = new Edge('connection', 'MR03RT03', 0, false, false, false, false, true, 'take a right before the elevator to enter floor 3 of Rettner', 'go past the seating area to enter floor 3 of Morey', null, null);
    MR02ARRGC = new Edge('tunnel', 'MR02ARRGC', 29.6, false, false, false, false, true, 'go through the double doors, take a right at the end of the hall, and enter the ground floor of Rush Rhees', 'turn right by the vending machines and staircase, follow the tunnel, and go through the double doors on the right at the end of the tunnel to enter floor 2 of Morey', ['broken push door button leading to Morey tunnel'], [[43.1284964,-77.6293734],[43.128453,-77.6293403],[43.1285122,-77.6291817],[43.128488,-77.6291669],[43.1285151,-77.6290934]]);

    // Rush Rhees
    RRGRR01 = new Edge('floor', 'RRGRR01', 5, false, false, false, false, true, 'ground floor to first floor', 'first floor to ground floor', ['silver elevator broken', 'green elevator broken', 'yellow elevator broken', 'blue elevator broken'], null);
    RRGRR02 = new Edge('floor', 'RRGRR02', 10, false, false, false, false, true, 'ground floor to second floor', 'second floor to ground floor', ['silver elevator broken', 'green elevator broken', 'yellow elevator broken', 'blue elevator broken'], null);
    RRGRR03 = new Edge('floor', 'RRGRR03', 15, false, false, false, false, true, 'ground floor to third floor', 'third floor to ground floor', ['silver elevator broken', 'green elevator broken', 'yellow elevator broken', 'blue elevator broken'], null);
    RRGRR04 = new Edge('floor', 'RRGRR04', 20, false, false, false, false, true, 'ground floor to fourth floor', 'fourth floor to ground floor', ['silver elevator broken', 'green elevator broken', 'yellow elevator broken', 'blue elevator broken'], null);
    RR01RR02 = new Edge('floor', 'RR01RR02', 5, false, false, false, false, true, 'first floor to second floor', 'second floor to first floor', ['silver elevator broken', 'green elevator broken', 'yellow elevator broken', 'blue elevator broken'], null);
    RR01RR03 = new Edge('floor', 'RR01RR03', 10, false, false, false, false, true, 'first floor to third floor', 'third floor to first floor', ['silver elevator broken', 'green elevator broken', 'yellow elevator broken', 'blue elevator broken'], null);
    RR01RR04 = new Edge('floor', 'RR01RR04', 15, false, false, false, false, true, 'first floor to fourth floor', 'fourth floor to first floor', ['silver elevator broken', 'green elevator broken', 'yellow elevator broken', 'blue elevator broken'], null);
    RRGRRGA = new Edge('level', 'RRGRRGA', 0, false, false, false, false, true, null, null, null);
    RRGRRGB = new Edge('level', 'RRGRRGB', 0, false, false, false, false, true, null, null, null);
    RRGRRGC = new Edge('level', 'RRGRRGC', 0, false, false, false, false, true, null, null, null);
    RR01RR01A = new Edge('level', 'RR01RR01A', 0, false, false, false, false, true, null, null, null);
    RR01RR01B = new Edge('level', 'RR01RR01B', 0, false, false, false, false, true, null, null, null);

    // Eastman Quad
    EQPCMR03A = new Edge('path', 'EQPCMR03A', 5.9, false, false, false, false, true, 'enter Morey hall', 'leave Morey hall', ['broken push door button to Morey from Eastman quad'], [[43.1283983,-77.6294316],[43.1284459,-77.6294641]]);
    EQPBMR03B = new Edge('path', 'EQPBMR03B', 4.8, true, false, true, false, false, 'enter Morey hall', 'leave Morey hall', null, [[43.1283214,-77.6296242],[43.1283587,-77.6296534]]);
    EQPAMR03C = new Edge('path', 'EQPAMR03C', 6.2, true, false, true, false, false, 'enter Morey hall', 'leave Morey hall', null, [[43.1282524,-77.6298131],[43.1283023,-77.6298476]]);
    EQPAEQPB = new Edge('path', 'EQPAEQPB', 17.1, false, false, false, false, true, 'head towards Rush Rhees library', 'head away from Rush Rhees library', null, [[43.1282524,-77.6298131],[43.1283214,-77.6296242]]);
    EQPBEQPC = new Edge('path', 'EQPBEQPC', 17.8, false, false, false, false, true, 'head towards Rush Rhees library', 'head away from Rush Rhees library', null, [[43.1283214,-77.6296242],[43.1283983, -77.6294316]]);
    EQPDRR01B = new Edge('path', 'EQPDRR01B', 23.9, true, true, false, false, false, 'enter Rush Rhees library', 'leave Rush Rhees library', ['broken push door button to Rush Rhees from Eastman quad'], [[43.1282604, -77.6290755],[43.1283107, -77.6289446]]);
    EQPDEQPE = new Edge('path', 'EQPDEQPE', 26.5, false, false, false, false, true, 'head away from Rush Rhees library', 'head towards Rush Rhees library', null, [[43.1282604, -77.6290755],[43.1284752, -77.6292172]]);
    EQPDEQPF = new Edge('path', 'EQPDEQPF', 25.9, false, false, false, false, true, 'head away from Rush Rhees library', 'head towards Rush Rhees library', null, [[43.1282604, -77.6290755],[43.1280535, -77.6289301]]);
    EQPCEQPE = new Edge('path', 'EQPCEQPE', 19.4, false, false, false, false, true, 'head towards Rush Rhees library', 'head away from Rush Rhees library', null, [[43.1283983, -77.6294316],[43.1284752, -77.6292172]]);
    EQPBEQPG = new Edge('path', 'EQPBEQPG', 52.0, false, false, false, false, true, 'head towards Bausch and Lomb', 'head away from Bausch and Lomb', null, [[43.1283214,-77.6296242],[43.1279103, -77.6293189]]);
    EQPFEQPG = new Edge('path', 'EQPFEQPG', 35.3, false, false, false, false, true, 'head towards Bausch and Lomb', 'head away from Bausch and Lomb', null, [[43.1280535, -77.6289301],[43.1279103, -77.6293189]]);

    // Wilson Quad
    BR01AWQPB = new Edge('path', 'BR01AWQPB', 18.3, true, false, true, false, false, 'leave Burton hall', 'enter Burton hall', null, [[43.129296,-77.6311965], [43.129277,-77.6312532],[43.1291688,-77.6311843]]);
    BR01BWQPB = new Edge('path', 'BR01BWQPB', 18.1, true, false, true, false, false, 'leave Burton hall', 'enter Burton hall', null, [[43.1292627,-77.6311965],[43.129277,-77.6312532],[43.1291688,-77.6311843]]);
    BR01BWQPA = new Edge('path', 'BR01BWQPA', 29.6, true, false, true, false, false, 'leave Burton hall', 'enter Burton hall', null, [[43.1292627,-77.6311965],[43.1292248,-77.6313938],[43.1291189,-77.6313241]]);
    BR01CWQPA = new Edge('path', 'BR01CWQPA', 17.7, true, false, true, false, false, 'leave Burton hall', 'enter Burton hall', null, [[43.129204,-77.6314433],[43.1292248,-77.6313938],[43.1291189,-77.6313241]]);
    WQPAWQPB = new Edge('path', 'WQPAWQPB', 5.5, false, false, false, false, true, 'walk towards Crosby hall', 'walk towards Burton hall', null, [[43.1291189,-77.6313241],[43.1291688,-77.6313241]]);
    WQPAWQPE = new Edge('path', 'WQPAWQPE', 20.2, false, false, false, false, true, 'walk towards the fraternity quad', 'walk towards Burton hall', null, [[43.1291189,-77.6313241],[43.1290393,-77.6315472]]);
    WQPBWQPD = new Edge('path', 'WQPBWQPD', 38.8, false, false, false, false, true, 'walk towards Crosby hall', 'walk towards Burton hall', null, [[43.1291688, -77.6311843],[43.1292818,-77.6308716]]);
    WQPEWQPF = new Edge('path', 'WQPEWQPF', 45.2, false, false, false, false, true, 'walk towards LeChase hall', 'walk towards Burton hall', null, [[43.1290393,-77.6315472],[43.1286759,-77.6312982]]);
    WQPCWQPD = new Edge('path', 'WQPCWQPD', 44.2, false, false, false, false, true, 'walk towards the residence halls', 'walk towards LeChase and Rettner hall', null, [[43.1289216,-77.6306342],[43.1292818,-77.6308716]]);
    WQPCWQPF = new Edge('path', 'WQPCWQPF', 60.4, false, false, false, false, true, 'walk towards the fraternity quad', 'walk towards Wilson Commons', null, [[43.1289216,-77.6306342],[43.1286759,-77.6312982]]);
    WQPCWQPG = new Edge('path', 'WQPCWQPG', 52.4, false, false, false, false, true, 'walk towards Rettner hall', 'walk towards Wilson quad', null, [[43.1289216,-77.6306342],[43.1285042,-77.6303344]]);
    WQPGWQPH = new Edge('path', 'WQPGWQPH', 21.3, false, false, false, false, true, 'walk towards Rettner and Morey hall', 'walk towards LeChase hall', null, [[43.1285042,-77.6303344],[43.1283342,-77.6302145]]);
    RT01AWQPG = new Edge('path', 'RT01AWQPG', 21.5, false, false, false, false, true, 'leave Rettner hall', 'enter Rettner hall', ['broken push door button to Rettner entrance facing Wilson Quad'], [[43.1286775,-77.630216],[43.1285042,-77.6303344]]);
    RT01CWQPH = new Edge('path', 'RT01CWQPH', 8.0, false, false, false, false, true, 'leave Rettner hall', 'enter Rettner hall', ['broken push door button to Rettner entrance facing Lattimore'], [[43.1283643,-77.6301248],[43.1283342,-77.6302145]]);

    var all_edges = [BR00BR01, BR00BR02, BR00BR03, BR01BR02, BR01BR03, RT01RT02, RT01RT03, RT01RT02, RT01RT01A, RT01RT01B, RT01RT01C, MRGMR01, MRGMR02, MRGMR03, MRGMR04, MRGMR05, MR01MR02, MR01MR03, MR01MR04, MR01MR05, MR02MR03, MR02MR04, MR02MR05, MR03MR04, MR03MR05, MR02MR02A, MR03MR03A, MR03MR03B, MR03MR03C, MRGRT01, MR01RT01, MR02RT02, MR03RT03, MR02ARRGC, RRGRR01, RRGRR02, RRGRR03, RRGRR04, RRGRRGA, RRGRRGB, RRGRRGC, RR01RR01A, RR01RR01B, EQPCMR03A, EQPBMR03B, EQPAMR03C, EQPAEQPB, EQPBEQPC, EQPDRR01B, EQPDEQPE, EQPDEQPF, EQPCEQPE, EQPBEQPG, EQPFEQPG, BR01AWQPB, BR01BWQPA, BR01BWQPB, BR01CWQPA, WQPAWQPB, WQPAWQPE, WQPBWQPD, WQPEWQPF, WQPCWQPD, WQPCWQPF, WQPCWQPG, WQPGWQPH, RT01AWQPG, RT01CWQPH]

    // define nodes
    // Burton
    BR00 = new Node("Burton", "0", "BR00", [BR00BR01,BR00BR02,BR00BR03,BR00BR00A], "floor", null, Math.min(), []);
    BR01 = new Node("Burton", "1", "BR01", [BR00BR01,BR01BR02,BR01BR03,BR01BR01A,BR01BR01B,BR01BR01C], "floor", null, Math.min(), []);
    BR02 = new Node("Burton", "2", "BR02", [BR00BR02,BR01BR02], "floor", null, Math.min(), []);
    BR03 = new Node("Burton", "3", "BR03", [BR00BR03,BR01BR03], "floor", null, Math.min(), []);
    BR00A = new Node("Burton", "0", "BR00A", [BR00BR00A], "entrance", [43.1293665, -77.6313923], Math.min(), []);
    BR01A = new Node("Burton", "1", "BR01A", [BR01BR01A,BR01AWQPB], "entrance", [43.129296, -77.6311965], Math.min(), []);
    BR01B = new Node("Burton", "1", "BR01B", [BR01BR01B,BR01BWQPB,BR01BWQPA], "entrance", [43.1292627, -77.6313306], Math.min(), []);
    BR01C = new Node("Burton", "1", "BR01C", [BR01BR01C,BR01CWQPA], "entrance", [43.129204, -77.6314433], Math.min(), []);

    // Rettner
    RT01 = new Node("Rettner", "1", "RT01", [RT01RT02,RT01RT03,RT01RT01A,RT01RT01B,RT01RT01C,MRGRT01,MR01RT01,RT01AWQPG,RT01CWQPH], "floor", null, Math.min(), []);
    RT02 = new Node("Rettner", "2", "RT02", [RT01RT02,RT02RT03,MR02RT02], "floor", null, Math.min(), []);
    RT03 = new Node("Rettner", "3", "RT03", [RT01RT03,RT02RT03,MR03RT03], "floor", null, Math.min(), []);
    RT01A = new Node("Rettner", "1", "RT01A", [RT01RT01A,RT01AWQPG], "entrance", [43.1286775, -77.630216], Math.min(), []);
    RT01B = new Node("Rettner", "1", "RT01B", [RT01RT01B], "entrance", [43.1284505, -77.6299049], Math.min(), []);
    RT01C = new Node("Rettner", "1", "RT01C", [RT01RT01C,RT01CWQPH], "entrance", [43.1283643, -77.6301248], Math.min(), []);

    // Morey
    MRG = new Node("Morey", "G", "MRG", [MRGMR01,MRGMR02,MRGMR03,MRGMR04,MRGMR05,MRGRT01], "floor", null, Math.min(), []);
    MR01 = new Node("Morey", "1", "MR01", [MRGMR01,MR01MR02,MR01MR03,MR01MR04,MR01MR05,MR01RT01], "floor", null, Math.min(), []);
    MR02 = new Node("Morey", "2", "MR02", [MRGMR02,MR01MR02,MR02MR03,MR02MR04,MR02MR05,MR02RT02,MR02ARRGC], "floor", null, Math.min(), []);
    MR03 = new Node("Morey", "3", "MR03", [MRGMR03,MR01MR03,MR02MR03,MR03MR04.MR03MR05,MR03MR03A,MR03MR03A,MR03MR03B,MR03MR03C,MR03RT03,EQPCMR03A.EQPBMR03B,EQPAMR03C], "floor", null, Math.min(), []);
    MR04 = new Node("Morey", "4", "MR04", [MRGMR04,MR01MR04,MR02MR04,MR03MR04], "floor", null, Math.min(), []);
    MR05 = new Node("Morey", "5", "MR05", [MRGMR05,MR01MR05,MR02MR05,MR03MR05], "floor", null, Math.min(), []);
    MR02A = new Node("Morey", "2", "MR02A", [MR02ARRGC, MR02MR02A], "entrance", [43.1284964, -77.6293734], Math.min(), []);
    MR03A = new Node("Morey", "3", "MR03A", [MR03MR03A,EQPCMR03A], "entrance", [43.1284459, -77.6294641], Math.min(), []);
    MR03B = new Node("Morey", "3", "MR03B", [MR03MR03B,EQPBMR03B], "entrance", [43.1283587, -77.6296534], Math.min(), []);
    MR03C = new Node("Morey", "3", "MR03C", [MR03MR03C,EQPAMR03C], "entrance", [43.1283023, -77.6298476], Math.min(), []);

    // Rush Rhees
    RRG = new Node("Rush Rhees", "G", "RRG", [RRGRR01,RRGRR02,RRGRR03,RRGRR04,RRGRRGA,RRGRRGB,RRGRRGC,MR02ARRGC], "floor", null, Math.min(), []);
    RR01 = new Node("Rush Rhees", "1", "RR01", [RRGRR01,RR01RR02,RR01RR03,RR01RR04,RR01RR01A,RR01RR01B.EQPDRR01B], "floor", null, Math.min(), []);
    RR02 = new Node("Rush Rhees", "2", "RR02", [RRGRR02,RR01RR02], "floor", null, Math.min(), []);
    RR03 = new Node("Rush Rhees", "3", "RR03", [RRGRR03,RR01RR03], "floor", null, Math.min(), []);
    RR04 = new Node("Rush Rhees", "4", "RR04", [RRGRR04,RR01RR04], "floor", null, Math.min(), []);
    RRGA = new Node("Rush Rhees", "G", "RRGA", [RRGRRGA], "entrance", [43.1287284, -77.6279537], Math.min(), []);
    RRGB = new Node("Rush Rhees", "G", "RRGB", [RRGRRGB], "entrance", [43.1281014, -77.6287809], Math.min(), []);
    RRGC = new Node("Rush Rhees", "G", "RRGC", [RRGRRGC,MR02ARRGC], "entrance", [43.1285151, -77.6290934], Math.min(), []);
    RR01A = new Node("Rush Rhees", "1", "RR01A", [RR01RR01A], "entrance", [43.128743, -77.6286939], Math.min(), []);
    RR01B = new Node("Rush Rhees", "1", "RR01B", [RR01RR01B,EQPDRR01B], "entrance", [43.1283107, -77.6289446], Math.min(), []);

    // Eastman Quad
    EQPA = new Node("Eastman Quad", null, "EQPA", [EQPAMR03C,EQPAEQPB], "intersection", [43.1282524, -77.6298131], Math.min(), []);
    EQPB = new Node("Eastman Quad", null, "EQPB", [EQPBMR03B,EQPAEQPB,EQPBEQPC,EQPBEQPG], "intersection", [43.1283214, -77.6296242], Math.min(), []);
    EQPC = new Node("Eastman Quad", null, "EQPC", [EQPCMR03A,EQPBEQPC,EQPCEQPE], "intersection", [43.1283983, -77.6294316], Math.min(), []);
    EQPD = new Node("Eastman Quad", null, "EQPD", [EQPDRR01B,EQPDEQPE,EQPDEQPF], "intersection", [43.1282604, -77.6290755], Math.min(), []);
    EQPE = new Node("Eastman Quad", null, "EQPE", [EQPDEQPE,EQPCEQPE], "intersection", [43.1284752, -77.6292172], Math.min(), []);
    EQPF = new Node("Eastman Quad", null, "EQPF", [EQPDEQPF,EQPFEQPG], "intersection", [43.1280535, -77.6289301], Math.min(), []);
    EQPG = new Node("Eastman Quad", null, "EQPG", [EQPBEQPG,EQPFEQPG], "intersection", [43.1279103, -77.6293189], Math.min(), []);

    // Wilson Quad
    WQPA = new Node("Wilson Quad", null, "WQPA", [BR01BWQPA,BR01CWQPA,WQPAWQPB,WQPAWQPE], "intersection", [43.1291189, -77.6313241], Math.min(), []);
    WQPB = new Node("Wilson Quad", null, "WQPB", [BR01AWQPB,BR01BWQPB,WQPAWQPB,WQPBWQPD], "intersection", [43.1291688, -77.6311843], Math.min(), []);
    WQPC = new Node("Wilson Quad", null, "WQPC", [WQPCWQPD,WQPCWQPF,WQPCWQPG], "intersection", [43.1289216, -77.6306342], Math.min(), []);
    WQPD = new Node("Wilson Quad", null, "WQPD", [WQPBWQPD,WQPCWQPD], "intersection", [43.1292818, -77.6308716], Math.min(), []);
    WQPE = new Node("Wilson Quad", null, "WQPE", [WQPAWQPE,WQPEWQPF], "intersection", [43.1290393, -77.6315472], Math.min(), []);
    WQPF = new Node("Wilson Quad", null, "WQPF", [WQPEWQPF,WQPCWQPF], "intersection", [43.1286759, -77.6312982], Math.min(), []);
    WQPG = new Node("Wilson Quad", null, "WQPG", [WQPCWQPG,WQPGWQPH,RT01AWQPG], "intersection", [43.1285042, -77.6303344], Math.min(), []);
    WQPH = new Node("Wilson Quad", null, "WQPH", [WQPGWQPH,RT01CWQPH], "intersection", [43.1283342, -77.6302145], Math.min(), []);

    all_nodes = [BR00, BR01, BR02, BR03, BR00A, BR01A, BR01B, BR01C, RT01, RT02, RT03, RT01A, RT01B, RT01C, MRG, MR01, MR02, MR03, MR04, MR05, MR02A, MR03A, MR03B, MR03C, RRG, RR01, RR02, RR03, RR04, RRGA, RRGB, RRGC, RR01A, RR01B, EQPA, EQPB, EQPD, EQPE, EQPF, EQPG, WQPA, WQPB, WQPC, WQPD, WQPE, WQPF, WQPG, WQPH];


    // sort edge accessibility
    var step_edges = [];
    var stair_edges = [];
    var door_edges = [];
    var elevator_edges = [];
    var accessible_edges = [];
    all_edges.forEach(edge => {
        if (edge.ada) {accessible_edges.push(edge);}
        else {
            if (edge.steps) {step_edges.push(edge);} 
            if (edge.stairs) {step_edges.push(edge);}  
            if (edge.manual_doors) {door_edges.push(edge);}  
            if (edge.non_wc_elevators) {elevator_edges.push(edge);}   
        }
    })

    // get accessible edges
    var allowed = [];
    var avoid = [];
    allow_steps ? allowed.push(step_edges) : avoid.push(step_edges);
    allow_stairs ? allowed.push(stair_edges) : avoid.push(stair_edges);
    allow_manual_doors ? allowed.push(door_edges) : avoid.push(door_edges);
    allow_non_wc_elevators ? allowed.push(elevator_edges) : avoid.push(elevator_edges);
    if (allowed.length > 0) {
        allowed.forEach(allowedList => {
            allowedList.forEach(allowedEdge => {
                var add = true;
                if (!accessible_edges.includes(allowedEdge)) {
                    avoid.forEach(avoidList => {if (avoidList.includes(allowedEdge)) {add = false;}});
                    if (add) {accessible_edges.push(allowedEdge);}
                }
            })
        })
    }
    console.log(accessible_edges);

    // get route start and end
    var startBuilding = document.getElementById("start-building").value;
    var startFloor = document.getElementById("start-floor").value;
    var endBuilding = document.getElementById("end-building").value;
    var endFloor = document.getElementById("end-floor").value;
    all_nodes.forEach(node => {
        if(node.type == "floor") {
            if(node.building == startBuilding && node.level == startFloor) {
                start = node;
                return;
            }
            else if(node.building == endBuilding && node.level == endFloor) {
                end = node;
                return;
            }
        }
    });

    // find shortest route
    if (start == null || start == undefined) {
        alert('Starting building and/or floor not selected');
        return
    }
    if (end == null || end == undefined) {
        alert('Destination building and/or floor not selected');
        return
    }
    var unvisited = [];
    var visited = [];

    all_nodes.forEach(node => {unvisited.push(node)})

    // find other node from edge name
    function find_neighbor(node, edge) {
        var neighbor = null;
        var neighborString = edge.id.replace(node.id, "");
        all_nodes.forEach(x => {
            if (x.id == neighborString) {
                neighbor = x;
            }
        });
        return neighbor;
    }

    function next_node() {
        var min_length = Math.min();
        var min_node = unvisited[0];
        unvisited.forEach(node => {
            if (node.length < min_length) {
                min_length = node.length;
                min_node = node;
            }
        })
        return min_node
    }

    function dijkstra_step(node) {
        if (node == start) {
            node.length = 0;
            node.route = [start.id];
        }
        console.log(node)
        var neighbor;
        var dead_end = true;
        node.edges.forEach(edge => {
            if (edge == undefined) {return;}
            if (find_neighbor(node, edge) != null && accessible_edges.includes(edge)) {
                dead_end = false;
                neighbor = find_neighbor(node, edge);
                if(node.length == Math.min()) {node.length = 0;}
                if (node.length + edge.length < neighbor.length) {
                    neighbor.length = node.length + edge.length;
                    neighbor.route = [];
                    node.route.forEach(item => {neighbor.route.push(item)});
                    neighbor.route.push(edge);
                    neighbor.route.push(neighbor);
                }
            }
        })

        // set up next step
        unvisited.splice(unvisited.indexOf(node), 1);
        visited.push(node);

        if (unvisited.length > 0) {
            if(!dead_end){
                dijkstra_step(next_node());
            }
            else {
                console.log('dead end');
                dijkstra_step(next_node());
            }
        }
    }

    dijkstra_step(start);
    console.log(map);
    string_route = []
    end.route.forEach(part => {string_route.push(part.id)})
    console.log('Shortest path distance is: ' + Math.round(3.28084*end.length) + " feet");
    console.log('Shortest path is: ' + string_route);
    if(string_route[string_route.length - 1] == end.id){display()}
    else {alert("Accessible route not found.  Please try adjusting your starting, destination, or accessibility requirements to find a route.")}
}

// if path directions should be reversed, use ids as input
function ifReverse(edge, next) {
    return edge.substring(0, next.length) == next;
}

var routeMarkers = L.layerGroup();

function display() {
    // display accessibility exceptions
    var allow_steps = document.getElementById("allowSteps").checked;
    var allow_stairs = document.getElementById("allowStairs").checked;
    var allow_manual_doors = document.getElementById("allowDoors").checked;
    var allow_non_wc_elevators = document.getElementById("allowElevators").checked;
    accessSummary = document.getElementById('access-summary');
    accessSummary.hidden = false;
    var allowed = [];
    var avoid = [];
    allow_steps ? allowed.push("steps") : avoid.push("steps");
    allow_stairs ? allowed.push("stairs") : avoid.push("stairs");
    allow_manual_doors ? allowed.push("manual doors") : avoid.push("manual doors");
    allow_non_wc_elevators ? allowed.push("non-wheelchair elevators") : avoid.push("non-wheelchair elevators");
    if (allowed.length == 0) {accessSummary.hidden = true;}
    else {
        allowed.forEach(allowance => {
            if (allowance == allowed[0]) {accessSummary.innerHTML =  accessSummary.innerHTML + allowance}
            else {accessSummary.innerHTML =  accessSummary.innerHTML + ", " + allowance}
        })
    }
    // display route length
    document.getElementById('route-length').innerHTML = Math.round(3.28084*end.length) + " feet";
    // display route directions
    directions = document.getElementById("directions");
    directions.innerHTML = "";
    var mapPoints = [];
    var mapLines = [];
    end.route.forEach(part => {
        if (part.coords != null) {part instanceof Node ? mapPoints.push(part) : mapLines.push(part)}
        if (part instanceof Edge) {
            if (part.dir != null) {
                var li = document.createElement('li');
                var formCheck = document.createElement('div');
                formCheck.classList.add('form-check');
                var checkInput = document.createElement('input');
                checkInput.classList.add('form-check-input');
                checkInput.type = "checkbox";
                checkInput.value = part.id;
                checkInput.id = part.id;
                var checkLabel = document.createElement('label');
                checkLabel.classList.add('form-check-label');
                checkLabel.for = part.id;
                ifReverse(part.id, end.route[end.route.indexOf(part) + 1].id) ? checkLabel.appendChild(document.createTextNode(part.revDir)) : checkLabel.appendChild(document.createTextNode(part.dir));
                formCheck.appendChild(checkInput);
                formCheck.appendChild(checkLabel);
                li.appendChild(formCheck);
                if (part.report != null) {  
                    var span = document.createElement('span');
                    span.innerHTML = '<button class="btn btn-light reportbutton" style="margin-left:25px;" id= "' + part.id +'-report-button" onclick="reportFromDir(' + part.id + ')" data-bs-toggle="modal" data-bs-target="#map-report">Report</button>';
                    li.appendChild(span);
                }
                directions.appendChild(li);
            }
        }
    })
    routeMarkers.clearLayers(); // reset from prev
    if (mapPoints.length > 0){
    startCoords = mapPoints[0].coords;
    map.flyTo(startCoords, 18);
    located = true; // prevents auto center to userloc if userloc found second
    // add markers and route lines
    var startMarker = L.marker(startCoords);
    var endMarker = L.marker(mapPoints[mapPoints.length - 1].coords);
    routeMarkers.addLayer(startMarker);
    routeMarkers.addLayer(endMarker);}
    if (mapLines.length > 0){
    mapLines.forEach(path => {
        routeMarkers.addLayer(L.polyline(path.coords));
    })}
    routeMarkers.addTo(map);
    document.getElementById('access-features').hidden = true;
    document.getElementById('directions-container').hidden = false;
    document.getElementById('find-route').hidden = true;
    document.getElementById('finish-route').hidden = false;
}

var expanded = false;

function expandInfo() {
    var info = document.getElementById('route-info');
    var mapBox = document.getElementById('map');
    var mapBoxControls = document.getElementsByClassName('leaflet-control-zoom')[0];
    var findRouteButton = document.getElementById('find-route');
    var finishRouteButton = document.getElementById('finish-route');
    if (!expanded) {
        console.log('expand')
        info.style.top = "15vh";
        mapBox.style.height = "0";
        mapBoxControls.style.hidden = true;
        findRouteButton.style.top = "15vh";
        finishRouteButton.style.top = "15vh";
        document.getElementById('expand-icon').src = "assets/collapse-vertical-regular-24.png";
    }
    else {
        console.log('collapse');
        info.style.top = "70vh";
        mapBox.style.height = "55vh";
        mapBoxControls.style.hidden = false;
        findRouteButton.style.top = "70vh";
        finishRouteButton.style.top = "70vh";
        document.getElementById('expand-icon').src = "assets/expand-vertical-regular-24.png";
    }
    expanded = !expanded;
}

function reportFromDir(reportElement) {
    console.log('report from dir')
    var reportOptions = reportElement.report;
    console.log(reportOptions)
    if (reportOptions.length == 1) {
        document.getElementById('report-single').innerHTML = reportOptions[0];
        document.getElementById('report-single').hidden = false;
    } else {
        reportOptions.forEach(part => {
            var reportRadio = document.createElement('div');
            reportRadio.classList.add('form-check');
            var radioInput = document.createElement('input');
            radioInput.classList.add('form-check-input');
            radioInput.type = "radio";
            radioInput.value = part;
            radioInput.id = part;
            radioInput.required = "true";
            radioInput.name = "report-multiple-radio"
            var radioLabel = document.createElement('label');
            radioLabel.classList.add('form-check-label');
            radioLabel.for = part;
            radioLabel.appendChild(document.createTextNode(part));
            reportRadio.appendChild(radioInput);
            reportRadio.appendChild(radioLabel);
            document.getElementById('report-multiple').appendChild(reportRadio);
        })
        document.getElementById('report-multiple').hidden = false;
    }
}

var selectedReport = "";

function mapReportDetails() {
    if (document.getElementById('report-single').innerHTML != "") {selectedReport = document.getElementById('report-single').innerHTML}
    else {
        options = document.getElementById('report-multiple').children;
        for (let i = 0; i<options.length; i++) {if (options[i].children[0].checked) {selectedReport = options[i].children[0].value}}
    }
    document.getElementById('report-selected').innerHTML = "Report " + selectedReport;
}

function format(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return '' + (m<=9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d) + '/' + y;
}

function confirmMapReport() {
    var today = new Date();
    document.getElementById('you-reported').innerHTML = "Your reported " + selectedReport;
    document.getElementById('confirm-reporter-email').innerHTML = "Email: " + document.getElementById('map-reporter-email').value
    document.getElementById('confirm-reporter-phone').innerHTML = "Phone: " + document.getElementById('map-reporter-phone').value
    document.getElementById('confirm-report-date').innerHTML = "Date: " + format(today);
}

function endRoute() {
    //reset inputs
    document.getElementById('input-overlay').hidden = false;
    document.getElementById('sidebar-container').hidden = true;
    document.getElementById('sidebar').hidden = true;
    document.getElementById('end-building').value = "";
    document.getElementById('end-floor').value = "";
    document.getElementById('end-building-overlay').value = "";
    document.getElementById('end-floor-overlay').value = "";
    getLocation();

    // reset sidebar
    document.getElementById('access-features').hidden = false;
    document.getElementById('directions-container').hidden = true;
    document.getElementById('find-route').hidden = false;
    document.getElementById('finish-route').hidden = true;

    // reset map
    routeMarkers.clearLayers();
    document.getElementById('map').style.width = "100vw";
    document.getElementById('map').style.left = "0px";
    document.getElementById('map').style.top = "10vh";
    document.getElementById('map').style.height = "90vh";
    document.getElementById('map').classList.add('overlay-map');

    // reset find route inputs
    start = null;
    end = null;
}