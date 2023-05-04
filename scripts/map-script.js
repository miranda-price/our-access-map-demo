var map = L.map('map').setView([43.1279308, -77.6299522], 22);
var userLoc = L.circleMarker([43.1279308, -77.6299522]).addTo(map);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.setMaxBounds([
    [43.1245598, -77.6332544],
    [43.1331607, -77.6184025]
])


document.getElementById('route-input').hidden = false;
document.getElementById('route-info').hidden = false;
document.getElementById('route-directions').hidden = true;
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
    constructor(type, id, length, steps, stairs, manual_doors, non_wc_elevators, ada, dir, revDir, report, coords, location) {
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
        this.location = location;
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
    case 'Interfaith Chapel':
        floors = ['1', '2', '3'];
        main = '2';
        break;
    case 'Meliora':
        floors = ['1', '2', '3', '4'];
        main = '3';
        break;
    case 'Wilmot':
        floors = ['1', '2', '3', '4', '5'];
        main = '1';
        break;
    case 'Goergen':
        floors = ['1', '2', '3', '4', '5'];
        main = '1';
        break;
    case 'Computer Studies':
        floors = ['2', '4', '5', '6', '7'];
        main = '2';
        break;
    case 'Carlson':
        floors = ['1', '2', '3'];
        main = '2';
        break;
    case 'Hutchinson':
        floors = ['B', '1', '2', '3', '4'];
        main = '1';
        break;
    case 'Hylan':
        floors = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
        main = '1';
        break;
        break;
    case 'Douglass':
        floors = ['1', '2', '3', '4'];
        main = '2';
        break;
    case 'Wilson Commons':
        floors = ['1', '2', '3', '4', '5'];
        main = '2';
        break;
    default:
        floors = ['B', 'G', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        main = '1';
    }

    floorOptions(selectFloor, floors, main);
}
// propogate floors again on refresh
if (document.getElementById('start-building').value != "Starting") {propogateFloors('start-building', 'start-floor');}
if (document.getElementById('end-building').value != "Destination") {propogateFloors('end-building', 'end-floor');}

var userLat = 43.1279308;
var userLng = -77.6299522;
var located = false;

// user location tracking
function showPosition(position) {
    userLat = position.coords.latitude;
    userLng = position.coords.longitude;
    //[43.1245598, -77.6332544],
    //[43.1331607, -77.6184025]
    var inBounds = true;
    if (userLat < 43.1245598 || userLat > 43.1331607) {inBounds = false;}
    if (userLng < -77.6332544 || userLng > -77.6184025) {inBounds = false;}
    if (!located && inBounds) {
        located = true;
        map.flyTo([userLat, userLng], 18);
    }
    userLoc.setLatLng([userLat, userLng]);
    //find building
    var startBuilding = document.getElementById('start-building');
    if(startBuilding.value == "Starting") {
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
            startBuilding.value = "Hoyt";
        }  else if (userLat >= 43.1271345 && userLng >= -77.6293156 && userLat <= 43.1279928 && userLng <= -77.6289476) {
            startBuilding.value = "Bausch & Lomb";
        } else if (userLat >= 43.1267433 && userLng >= -77.6302677 && userLat <= 43.1276542 && userLng <= -77.6297637) {
            startBuilding.value = "Dewey";
        } else if (userLat >= 43.1274794 && userLng >= -77.6285473 && userLat <= 43.1280803 && userLng <= -77.6276703) {
            startBuilding.value = "Meliora";
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
            startBuilding.value = "Wilmot";
        } else if (userLat >= 43.1251521 && userLng >= -77.6295293 && userLat <= 43.1258471 && userLng <= -77.6290006) {
            startBuilding.value = "Goergen";
        } else if (userLat >= 43.1248152 && userLng >= -77.6304026 && userLat <= 43.1251635 && userLng <= -77.6300386) {
            startBuilding.value = "Carlson";
        } else if (userLat >= 43.1249414 && userLng >= -77.6300327 && userLat <= 43.1252898 && userLng <= -77.629627) {
            startBuilding.value = "Computer Studies";
        } else if (userLat >= 43.1254814 && userLng >= -77.6304324 && userLat <= 43.1256947 && userLng <= -77.6301758) {
            startBuilding.value = "Hylan";
        } else if (userLat >= 43.124557 && userLng >= -77.6310543 && userLat <= 43.1258211 && userLng <= -77.6304603) {
            startBuilding.value = "Hutchison";
        } else if (userLat >= 43.1268508 && userLng >= -77.632492 && userLat <= 43.1272209 && userLng <= -77.632152) {
            startBuilding.value = "Interfaith Chapel";
        } else if (userLat >= 43.1275344 && userLng >= -77.6316866 && userLat <= 43.128083 && userLng <= -77.6313286) {
            //startBuilding.value = "Strong Auditorium";
        } else if (userLat >= 43.1277086 && userLng >= -77.6323309 && userLat <= 43.1282224 && userLng <= -77.6320923) {
            //startBuilding.value = "Sloane Performing Arts Center";
        } else if (userLat >= 43.1279785 && userLng >= -77.6319849 && userLat <= 43.1284575 && userLng <= -77.6315017) {
            //startBuilding.value = "Todd Union";
        } else if (userLat >= 43.1283182 && userLng >= -77.6313465 && userLat <= 43.1288145 && userLng <= -77.6306127) {
            //startBuilding.value = "LeChase";
        } else if (userLat >= 43.1286404 && userLng >= -77.63004 && userLat <= 43.1292064 && userLng <= -77.6294613) {
            startBuilding.value = "Wilson Commons";
        } else if (userLat >= 43.1287144 && userLng >= -77.6291332 && userLat <= 43.1293806 && userLng <= -77.6285783) {
            startBuilding.value = "Douglass";
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
            startBuilding.value = "Starting";
        }
        if (startBuilding.value != "Starting") {
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
    iconAnchor:   [12, 12],
    alt: 'icon indicating a bench',
    interactive: false,
});
var rampIcon = L.icon({
    iconUrl: 'icons/map-icons_ramp.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12],
    alt: 'icon indicating a ramp',
    interactive: false,
});
var ElevatorNotWCIcon = L.icon({
    iconUrl: 'icons/map-icons_elevator-wc-inaccessible.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12],
    alt: 'icon indicating a wheelchair inaccessible elevator',
});
var ElevatorWCIcon = L.icon({
    iconUrl: 'icons/map-icons_elevator-wc-accessible.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12],
    alt: 'icon indicating a wheelchair accessible elevator',
});
var ElevatorNotWCBrokenIcon = L.icon({
    iconUrl: 'icons/map-icons_elevator-wc-inaccessible-broken.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12],
    alt: 'icon indicating broken wheelchair inaccessible elevator',
});
var ElevatorWCBrokenIcon = L.icon({
    iconUrl: 'icons/map-icons_elevator-wc-accessible-broken.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12],
    alt: 'icon indicating a broken wheelchair accessible elevator',
});
var stairsIcon = L.icon({
    iconUrl: 'icons/map-icons_stairs.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12],
    alt: 'icon indicating stairs',
    interactive: false,
});
var stepsIcon = L.icon({
    iconUrl: 'icons/map-icons_steps.svg',
    iconSize:     [24, 24],
    iconAnchor:   [12, 12],
    alt: 'icon indicating steps',
    interactive: false,
});

function reportIcon(description) {
    console.log(description)
}

// accessibility feature/obstacle icon layers
var elevatorsWC = L.layerGroup([
    L.marker([43.1276125, -77.6291051], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Bausch & Lomb elevator')}),
    L.marker([43.1274355, -77.6299342], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('main elevator on north side of Dewey')}),
    L.marker([43.1283968, -77.629964], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Morey elevator')}),
    L.marker([43.1287886, -77.6283118], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Rush Rhees green elevators')}),
    L.marker([43.1285332, -77.6287911], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Rush Rhees silver elevators')}),
    L.marker([43.1285692, -77.6280382], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('iZone elevator')}),
    L.marker([43.1285175, -77.6293638], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Morey elevator')}),
    L.marker([43.1282199, -77.6315052], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Todd elevator')}),
    L.marker([43.1291732, -77.6269654], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('UHS elevator')}),
    L.marker([43.1270961, -77.6324882], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Chapel elevator')}),
    L.marker([43.1277821, -77.628313], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Meliora elevator')}),
    L.marker([43.1289073, -77.629718], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Wilson commons elevator')}),   
    L.marker([43.1289347, -77.6285968], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('elevator on south side of Douglass')}),
    L.marker([43.1291539, -77.6287416], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('elevator on north side of Douglass')}),
    L.marker([43.1249443, -77.6308959], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Hutchinson elevator')}),      
    L.marker([43.124915, -77.6306354], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Hutchinson elevator')}),       
    L.marker([43.1256463, -77.630248], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Hylan elevator')}),
    L.marker([43.1250143, -77.6300021], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Computer Studies Building elevator')}),
    L.marker([43.1250429, -77.6301291], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Carlson elevator')}),
    L.marker([43.1256914, -77.6291225], {icon:ElevatorWCIcon}).addEventListener('click', function() {reportIcon('Elevator between Goergen and Wilmot')}),
    ])
    
    var elevatorsNotWC = L.layerGroup([
    L.marker([43.1268674, -77.6298621], {icon:ElevatorNotWCIcon}).addEventListener('click', function() {reportIcon('lower level elevator on south side of Dewey')}),
    L.marker([43.1280796, -77.6307938], {icon:ElevatorNotWCIcon}).addEventListener('click', function() {reportIcon('Lattimore elevator')}),    
    L.marker([43.128426, -77.6282768], {icon:ElevatorNotWCIcon}).addEventListener('click', function() {reportIcon('Rush Rhees yellow elevators')}),
    L.marker([43.1285562, -77.6284588], {icon:ElevatorNotWCIcon}).addEventListener('click', function() {reportIcon('Rush Rhees blue elevators')}),
    ])
    
    var stairs = L.layerGroup([
    L.marker([43.1276688, -77.6294263], {icon:stairsIcon}),
    L.marker([43.1278215, -77.629013], {icon:stairsIcon}),
    L.marker([43.1273017, -77.6290454], {icon:stairsIcon}),
    L.marker([43.1269542, -77.6298441], {icon:stairsIcon}),
    L.marker([43.1271962, -77.6299666], {icon:stairsIcon}),
    L.marker([43.1274355, -77.6300423], {icon:stairsIcon}),
    L.marker([43.1273277, -77.6302874], {icon:stairsIcon}),
    L.marker([43.1274329, -77.6295342], {icon:stairsIcon}),
    L.marker([43.1274118, -77.6296135], {icon:stairsIcon}),
    L.marker([43.1275485, -77.6297659], {icon:stairsIcon}),
    L.marker([43.1275985, -77.629621], {icon:stairsIcon}),
    L.marker([43.1283633, -77.6308529], {icon:stairsIcon}),
    L.marker([43.1281519, -77.630689], {icon:stairsIcon}),
    L.marker([43.1284164, -77.6298514], {icon:stairsIcon}),
    L.marker([43.1285104, -77.6296046], {icon:stairsIcon}),
    L.marker([43.1282961, -77.6298432], {icon:stairsIcon}),
    L.marker([43.1283492, -77.6296488], {icon:stairsIcon}),
    L.marker([43.1286647, -77.6300753], {icon:stairsIcon}),
    L.marker([43.1285523, -77.6301978], {icon:stairsIcon}),
    L.marker([43.1284771, -77.6284728], {icon:stairsIcon}),
    L.marker([43.1283877, -77.6283713], {icon:stairsIcon}),
    L.marker([43.1285358, -77.6283328], {icon:stairsIcon}),
    L.marker([43.1285179, -77.627899], {icon:stairsIcon}),
    L.marker([43.1283698, -77.6289871], {icon:stairsIcon}),
    L.marker([43.1283162, -77.6286512], {icon:stairsIcon}),
    L.marker([43.1284745, -77.6287526], {icon:stairsIcon}),
    L.marker([43.1282856, -77.629008], {icon:stairsIcon}),
    L.marker([43.1275883, -77.6311369], {icon:stairsIcon}),
    L.marker([43.1275439, -77.6310123], {icon:stairsIcon}),
    L.marker([43.1274337, -77.6310388], {icon:stairsIcon}),
    L.marker([43.1279407, -77.6312298], {icon:stairsIcon}),
    L.marker([43.1285883, -77.6291013], {icon:stairsIcon}),
    L.marker([43.128738, -77.6290179], {icon:stairsIcon}),
    L.marker([43.1287609, -77.6289171], {icon:stairsIcon}),
    L.marker([43.1278049, -77.628136], {icon:stairsIcon}),
    L.marker([43.1277523, -77.6280932], {icon:stairsIcon}),
    L.marker([43.127457, -77.6282547], {icon:stairsIcon}),
    L.marker([43.1271664, -77.632281], {icon:stairsIcon}),
    L.marker([43.1289425, -77.6297609], {icon:stairsIcon}),
    L.marker([43.1288016, -77.6297126], {icon:stairsIcon}),
    L.marker([43.1289425, -77.6301096], {icon:stairsIcon}),
    L.marker([43.1292518, -77.6290259], {icon:stairsIcon}),
    L.marker([43.1290717, -77.6287524], {icon:stairsIcon}),
    L.marker([43.1289817, -77.6286934], {icon:stairsIcon}),
    L.marker([43.1288955, -77.6286773], {icon:stairsIcon}),
    L.marker([43.1289778, -77.6290689], {icon:stairsIcon}),
    L.marker([43.1292714, -77.6287148], {icon:stairsIcon}),
    L.marker([43.1255926, -77.630228], {icon:stairsIcon}),
    L.marker([43.1249004, -77.6305753], {icon:stairsIcon}),
    L.marker([43.1250174, -77.6307356], {icon:stairsIcon}),
    L.marker([43.1250177, -77.6299398], {icon:stairsIcon}),
    L.marker([43.1252232, -77.6297066], {icon:stairsIcon}),
    L.marker([43.1250867, -77.6300898], {icon:stairsIcon}),
    L.marker([43.1250429, -77.6301868], {icon:stairsIcon}),
    L.marker([43.1251859, -77.6294734], {icon:stairsIcon}),
    L.marker([43.1255212, -77.6294388], {icon:stairsIcon}),
    L.marker([43.1253738, -77.6294282], {icon:stairsIcon}),
    L.marker([43.1257885, -77.6294586], {icon:stairsIcon}),
    L.marker([43.1291109, -77.62986], {icon:stairsIcon}),
    L.marker([43.1298146, -77.6304179], {icon:stairsIcon}),
    L.marker([43.1293986, -77.6308712], {icon:stairsIcon}),
    L.marker([43.1293438, -77.6310214], {icon:stairsIcon}),
    L.marker([43.1290473, -77.6315109], {icon:stairsIcon}),
    L.marker([43.1274643, -77.6283924], {icon:stairsIcon}),
    L.marker([43.1280888, -77.6277969], {icon:stairsIcon}),
    L.marker([43.1249163, -77.6310522], {icon:stairsIcon}),
    L.marker([43.1254574, -77.6305338], {icon:stairsIcon}),
    ])
    
    var steps = L.layerGroup([
    L.marker([43.1278898, -77.629309], {icon:stepsIcon}),
    L.marker([43.1275354, -77.6302513], {icon:stepsIcon}),
    L.marker([43.127437, -77.6297163], {icon:stepsIcon}),
    L.marker([43.1275113, -77.6295178], {icon:stepsIcon}),
    L.marker([43.1280086, -77.6305709], {icon:stepsIcon}),
    L.marker([43.1284373, -77.6294587], {icon:stepsIcon}),
    L.marker([43.1256315, -77.6292359], {icon:stepsIcon}),
    L.marker([43.1260207, -77.6298532], {icon:stepsIcon}),
    L.marker([43.1259398, -77.6289807], {icon:stepsIcon}),
    L.marker([43.127879, -77.6292976], {icon:stepsIcon}),
    L.marker([43.1282431, -77.629994], {icon:stepsIcon}),
    L.marker([43.1280033, -77.6305666], {icon:stepsIcon}),
    ])
    
    var ramps = L.layerGroup([
    L.marker([43.1278946, -77.6292573], {icon:rampIcon}),
    L.marker([43.1275275, -77.6302802], {icon:rampIcon}),
    L.marker([43.1280017, -77.6305957], {icon:rampIcon}),
    L.marker([43.1284461, -77.6294503], {icon:rampIcon}),
    L.marker([43.1285883, -77.6290144], {icon:rampIcon}),
    L.marker([43.1304014, -77.6288796], {icon:rampIcon}),
    L.marker([43.1279529, -77.6313895], {icon:rampIcon}),
    L.marker([43.1277508, -77.6312232], {icon:rampIcon}),
    L.marker([43.1285032, -77.6313804], {icon:rampIcon}),
    L.marker([43.1287667, -77.6306938], {icon:rampIcon}),
    L.marker([43.1280532, -77.6288312], {icon:rampIcon}),
    L.marker([43.1278104, -77.6293376], {icon:rampIcon}),
    L.marker([43.1279291, -77.6288564], {icon:rampIcon}),
    ])
    
    var benches = L.layerGroup([
    L.marker([43.1284767, -77.6291222], {icon:benchIcon}),
    L.marker([43.128124, -77.6288823], {icon:benchIcon}),
    L.marker([43.1288705, -77.6290047], {icon:benchIcon}),
    L.marker([43.1289136, -77.6291993], {icon:benchIcon}),
    L.marker([43.129076, -77.6293036], {icon:benchIcon}),
    L.marker([43.1283067, -77.6297827], {icon:benchIcon}),
    L.marker([43.1282528, -77.6300452], {icon:benchIcon}),
    L.marker([43.1281894, -77.6302399], {icon:benchIcon}),
    L.marker([43.1277758, -77.6310082], {icon:benchIcon}),
    L.marker([43.1274054, -77.6307613], {icon:benchIcon}),
    L.marker([43.1276439, -77.6298366], {icon:benchIcon}),
    L.marker([43.1276896, -77.6296767], {icon:benchIcon}),
    L.marker([43.1286943, -77.6287485], {icon:benchIcon}),
    L.marker([43.1279176, -77.6299363], {icon:benchIcon}),
    L.marker([43.1269973, -77.6321136], {icon:benchIcon}),
    L.marker([43.1271941, -77.6322544], {icon:benchIcon}),
    L.marker([43.1265114, -77.631798], {icon:benchIcon}),
    L.marker([43.1276986, -77.6275968], {icon:benchIcon}),
    L.marker([43.1274324, -77.6281386], {icon:benchIcon}),
    L.marker([-77.6278225, 43.1285637], {icon:benchIcon}),
    L.marker([-77.6280692, 43.1289141], {icon:benchIcon}),
    L.marker([43.1283835, -77.6304974], {icon:benchIcon}),
    L.marker([43.129525, -77.6271221], {icon:benchIcon}),
    L.marker([43.1296091, -77.6307827], {icon:benchIcon}),
    L.marker([43.129286, -77.6310758], {icon:benchIcon}),
    L.marker([43.1252478, -77.6311562], {icon:benchIcon}),
    L.marker([43.1253149, -77.6302385], {icon:benchIcon}),
    L.marker([43.1253423, -77.6295358], {icon:benchIcon}),
    L.marker([43.1256832, -77.6295462], {icon:benchIcon}),
    L.marker([43.1258222, -77.6295113], {icon:benchIcon}),
    L.marker([43.1262032, -77.6295256], {icon:benchIcon}),
    L.marker([43.1264244, -77.6292573], {icon:benchIcon}),
    L.marker([43.1259037, -77.6290481], {icon:benchIcon}),
    L.marker([43.1269315, -77.6292466], {icon:benchIcon}),
    L.marker([43.1271292, -77.6290589], {icon:benchIcon}),
    L.marker([43.1275452, -77.6294129], {icon:benchIcon}),
    L.marker([43.1266274, -77.6309629], {icon:benchIcon}),
    L.marker([43.1286496, -77.6312097], {icon:benchIcon}),
    L.marker([43.1284402, -77.6317649], {icon:benchIcon}),
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
    BR00_BR02 = new Edge('floor', 'BR00_BR02', 3, true, true, false, false, false, 'Move from ground floor to 2nd floor', 'Move from 2nd floor to ground floor', null, null, 'Burton');
    BR00_BR03 = new Edge('floor', 'BR00_BR03', 4, true, true, false, false, false, 'Move from ground floor to 3rd floor', 'Move from 3rd floor to gorund floor', null, null, 'Burton');
    BR01_BR02 = new Edge('floor', 'BR01_BR02', 2, true, true, false, false, false, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', null, null, 'Burton');
    BR01_BR03 = new Edge('floor', 'BR01_BR03', 3, true, true, false, false, false, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', null, null, 'Burton');
    BR00_BR00A = new Edge('level', 'BR00_BR00A', 1, false, false, false, false, true, null, null, null, null, 'Burton');
    BR01_BR01A = new Edge('level', 'BR01_BR01A', 1, false, false, false, false, true, null, null, null, null, 'Burton');
    BR01_BR01B = new Edge('level', 'BR01_BR01B', 1, false, false, false, false, true, null, null, null, null, 'Burton');
    BR01_BR01C = new Edge('level', 'BR01_BR01C', 1, false, false, false, false, true, null, null, null, null, 'Burton');
    RT01_RT02 = new Edge('floor', 'RT01_RT02', 2, false, false, false, false, true, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', ['broken elevator in Morey/Rettner Hall'], null, 'Rettner');
    RT01_RT03 = new Edge('floor', 'RT01_RT03', 3, false, false, false, false, true, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', ['broken elevator in Morey/Rettner Hall'], null, 'Rettner');
    RT02_RT03 = new Edge('floor', 'RT02_RT03', 2, false, false, false, false, true, 'Move from 2nd floor to 3rd floor', 'Move from 3rd floor to 1st floor', ['broken elevator in Morey/Rettner Hall'], null, 'Rettner');
    RT01_RT01A = new Edge('level', 'RT01_RT01A', 1, false, false, false, false, true, null, null, null, null, 'Rettner');
    RT01_RT01B = new Edge('level', 'RT01_RT01B', 1, false, false, false, false, true, null, null, null, null, 'Rettner');
    RT01_RT01C = new Edge('level', 'RT01_RT01C', 1, false, false, false, false, true, null, null, null, null, 'Rettner');
    MRG_MR01 = new Edge('floor', 'MRG_MR01', 2, false, false, false, false, true, 'Move from ground floor to 1st floor', 'Move from 1st floor to ground floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MRG_MR02 = new Edge('floor', 'MRG_MR02', 3, false, false, false, false, true, 'Move from ground floor to 2nd floor', 'Move from 2nd floor to ground floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MRG_MR03 = new Edge('floor', 'MRG_MR03', 4, false, false, false, false, true, 'Move from ground floor to 3rd floor', 'Move from 3rd floor to ground floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MRG_MR04 = new Edge('floor', 'MRG_MR04', 5, false, false, false, false, true, 'Move from ground floor to 4th floor', 'Move from 4th floor to ground floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MRG_MR05 = new Edge('floor', 'MRG_MR05', 6, false, false, false, false, true, 'Move from ground floor to 5th floor', 'Move from 5th floor to ground floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MR01_MR02 = new Edge('floor', 'MR01_MR02', 2, false, false, false, false, true, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MR01_MR03 = new Edge('floor', 'MR01_MR03', 3, false, false, false, false, true, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MR01_MR04 = new Edge('floor', 'MR01_MR04', 4, false, false, false, false, true, 'Move from 1st floor to 4th floor', 'Move from 4th floor to 1st floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MR01_MR05 = new Edge('floor', 'MR01_MR05', 5, false, false, false, false, true, 'Move from 1st floor to 5th floor', 'Move from 5th floor to 1st floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MR02_MR03 = new Edge('floor', 'MR02_MR03', 2, false, false, false, false, true, 'Move from 2nd floor to 3rd floor', 'Move from 3rd floor to 2ndfloor', ['broken elevator in Morey Hall'], null, 'Morey');
    MR02_MR04 = new Edge('floor', 'MR02_MR04', 3, false, false, false, false, true, 'Move from 2nd floor to 4th floor', 'Move from 4th floor to 2nd floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MR02_MR05 = new Edge('floor', 'MR02_MR05', 4, false, false, false, false, true, 'Move from 2nd floor to 5th floor', 'Move from 5th floor to 2nd floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MR03_MR04 = new Edge('floor', 'MR03_MR04', 2, false, false, false, false, true, 'Move from 3rd floor to 4th floor', 'Move from 4th floor to 3rd floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MR03_MR05 = new Edge('floor', 'MR03_MR05', 3, false, false, false, false, true, 'Move from 3rd floor to 5th floor', 'Move from 5th floor to 3rd floor', ['broken elevator in Morey Hall'], null, 'Morey');
    MR02_MR02A = new Edge('level', 'MR02_MR02A', 1, false, false, false, false, true, null, null, null, null, 'Morey');
    MR03_MR03A = new Edge('level', 'MR03_MR03A', 1, false, false, false, false, true, null, null, null, null, 'Morey');
    MR03_MR03B = new Edge('level', 'MR03_MR03B', 1, false, false, false, false, true, null, null, null, null, 'Morey');
    MR03_MR03C = new Edge('level', 'MR03_MR03C', 1, false, false, false, false, true, null, null, null, null, 'Morey');
    MRG_RT01 = new Edge('connection', 'MRG_RT01', 1, false, false, false, false, true, 'Exit the separate elevator area to enter floor 1 of Rettner', 'Enter the separate elevator area between Rettner and Morey', ['broken push door button from Rettner 1 to Morey elevator'], [[43.1284174, -77.6299371]], 'Morey/Rettner');
    MR01_RT01 = new Edge('connection', 'MR01_RT01', 1, true, true, false, false, false, 'Go down the steps to the right of the elevator to enter floor 1 of Rettner', 'Go up the steps next to the separate elevator area to enter floor 1 of Morey', null, [[43.1284231, -77.6299252]], 'Morey/Rettner');
    MR02_RT02 = new Edge('connection', 'MR02_RT02', 1, false, false, false, false, true, 'Take a right before the elevator to enter floor 2 of Rettner', 'Go past the lounge area and through the open doorway to enter floor 2 of Morey', null, [[43.1284231, -77.6299252]], 'Morey/Rettner');
    MR03_RT03 = new Edge('connection', 'MR03_RT03', 1, false, false, false, false, true, 'Take a right before the elevator to enter floor 3 of Rettner', 'Go past the audio/visual studio and lounge area to enter floor 3 of Morey', null, [[43.1284231, -77.6299252]], 'Morey/Rettner');
    RRG_RR01 = new Edge('floor', 'RRG_RR01', 2, false, false, false, false, true, 'Move from the ground floor to the 1st floor', 'Move from the 1st floor to the ground floor', ['broken silver elevator in Rush Rhees', 'broken green elevator in Rush Rhees', ' broken blue elevator in Rush Rhees', ' broken yellow elevator in Rush Rhees'], null, 'Rush Rhees');
    RRG_RR02 = new Edge('floor', 'RRG_RR02', 3, false, false, false, false, true, 'Move from the ground floor to the 2nd floor', 'Move from the 2nd floor to the ground floor', ['broken silver elevator in Rush Rhees', 'broken green elevator in Rush Rhees', ' broken blue elevator in Rush Rhees', ' broken yellow elevator in Rush Rhees'], null, 'Rush Rhees');
    RRG_RR03 = new Edge('floor', 'RRG_RR03', 4, false, false, false, false, true, 'Move from the ground floor to the 3rd floor', 'Move from the 3rd floor to the ground floor', ['broken silver elevator in Rush Rhees', 'broken green elevator in Rush Rhees', ' broken blue elevator in Rush Rhees', ' broken yellow elevator in Rush Rhees'], null, 'Rush Rhees');
    RRG_RR04 = new Edge('floor', 'RRG_RR04', 5, false, false, false, false, true, 'Move from the ground floor to the 4th floor', 'Move from the 4th floor to the ground floor', ['broken silver elevator in Rush Rhees', 'broken green elevator in Rush Rhees', ' broken blue elevator in Rush Rhees', ' broken yellow elevator in Rush Rhees'], null, 'Rush Rhees');
    RR01_RR02 = new Edge('floor', 'RR01_RR02', 2, false, false, false, false, true, 'Move from the 1st floor to the 2nd floor', 'Move from the 2nd floor to the 1st floor', ['broken silver elevator in Rush Rhees', 'broken green elevator in Rush Rhees', ' broken blue elevator in Rush Rhees', ' broken yellow elevator in Rush Rhees'], null, 'Rush Rhees');
    RR01_RR03 = new Edge('floor', 'RR01_RR03', 3, false, false, false, false, true, 'Move from the 1st floor to the 3rd floor', 'Move from the 3rd floor to the 1st floor', ['broken silver elevator in Rush Rhees', 'broken green elevator in Rush Rhees', ' broken blue elevator in Rush Rhees', ' broken yellow elevator in Rush Rhees'], null, 'Rush Rhees');
    RR01_RR04 = new Edge('floor', 'RR01_RR04', 4, false, false, false, false, true, 'Move from the 1st floor to the 4th floor', 'Move from the 4th floor to the 1st floor', ['broken silver elevator in Rush Rhees', 'broken green elevator in Rush Rhees', ' broken blue elevator in Rush Rhees', ' broken yellow elevator in Rush Rhees'], null, 'Rush Rhees');
    RRG_RRGA = new Edge('level', 'RRG_RRGA', 1, false, false, false, false, true, null, null, null, null, 'Rush Rhees');
    RRG_RRGB = new Edge('level', 'RRG_RRGB', 1, false, false, false, false, true, null, null, null, null, 'Rush Rhees');
    RRG_RRGC = new Edge('level', 'RRG_RRGC', 1, false, false, false, false, true, null, null, null, null, 'Rush Rhees');
    RR01_RR01A = new Edge('level', 'RR01_RR01A', 1, false, false, false, false, true, null, null, null, null, 'Rush Rhees');
    RR01_RR01B = new Edge('level', 'RR01_RR01B', 1, false, false, false, false, true, null, null, null, null, 'Rush Rhees');
    MR02A_RRGC = new Edge('tunnel', 'MR02A_RRGC', null, false, false, false, false, true, 'Go through the double doors to exit Morey; take a right at the end of the hall; continue through the tunnel and enter the ground floor of Rush Rhees', 'Pass vending machines and staircase; follow the tunnel; go past the tunnel to Starbucks and go through the double doors on the right to enter Morey', ['broken push door button entering Morey/Rush Rhees tunnel'], [[43.1284964, -77.6293734],[43.128453, -77.6293403],[43.1285122, -77.6291817],[43.128488, -77.6291669],[43.1285151, -77.6290934]], 'Eastman Quad');
    EQPC_MR03A = new Edge('path', 'EQPC_MR03A', null, false, false, false, false, true, 'Enter Morey hall', 'Leave Morey hall', ['broken push door button entering Morey from Eastman Quad'], [[43.1283983, -77.6294316],[43.1284459, -77.6294641]], 'Eastman Quad');       
    EQPB_MR03B = new Edge('path', 'EQPB_MR03B', null, true, false, true, false, false, 'Enter Morey hall', 'Leave Morey hall', null, [[43.1283214, -77.6296242],[43.1283587, -77.6296534]], 'Eastman Quad');
    EQPA_MR03C = new Edge('path', 'EQPA_MR03C', null, true, false, true, false, false, 'Enter Morey hall', 'Leave Morey hall', null, [[43.1282524, -77.6298131],[43.1283023, -77.6298476]], 'Eastman Quad');
    EQPA_EQPB = new Edge('path', 'EQPA_EQPB', null, false, false, false, false, true, 'Head towards Rush Rhees library', 'Head away from Rush Rhees library', null, [[43.1282524, -77.6298131],[43.1283214, -77.6296242]], 'Eastman Quad');
    EQPB_EQPC = new Edge('path', 'EQPB_EQPC', null, false, false, false, false, true, 'Head towards Rush Rhees library', 'Head away from Rush Rhees library', null, [[43.1283214, -77.6296242],[43.1283983,  -77.6294316]], 'Eastman Quad');
    EQPD_RR01B = new Edge('path', 'EQPD_RR01B', null, true, true, false, false, false, 'Go up the stairs to enter Rush Rhees library', 'Leave Rush Rhees library', ['broken push door button entering Rush Rhees from Eastman Quad'], [[43.1282604,  -77.6290755],[43.1284752, -77.6290755]], 'Eastman Quad');
    EQPD_EQPE = new Edge('path', 'EQPD_EQPE', null, false, false, false, false, true, 'Head away from Rush Rhees library', 'Head towards Rush Rhees library', null, [[43.1282604,  -77.6290755],[43.1284752,  -77.6292172]], 'Eastman Quad');
    EQPD_EQPF = new Edge('path', 'EQPD_EQPF', null, false, false, false, false, true, 'Head away from Rush Rhees library', 'Head towards Rush Rhees library', null, [[43.1282604,  -77.6290755],[43.1280535,  -77.6289301]], 'Eastman Quad');
    EQPC_EQPE = new Edge('path', 'EQPC_EQPE', null, false, false, false, false, true, 'Head towards Rush Rhees library', 'Head away from Rush Rhees library', null, [[43.1283983,  -77.6294316],[43.1284752,  -77.6292172]], 'Eastman Quad');
    EQPB_EQPG = new Edge('path', 'EQPB_EQPG', null, false, false, false, false, true, 'Head towards Bausch and Lomb', 'Head away from Bausch and Lomb', null, [[43.1283214, -77.6296242],[43.1279103,  -77.6293189]], 'Eastman Quad');
    EQPF_EQPG = new Edge('path', 'EQPF_EQPG', null, false, false, false, false, true, 'Head towards Bausch and Lomb', 'Head away from Bausch and Lomb', null, [[43.1280535,  -77.6289301],[43.1279103,  -77.6293189]], 'Eastman Quad');
    BR01A_WQPB = new Edge('path', 'BR01A_WQPB', null, true, false, true, false, false, 'Leave Burton hall', 'Enter Burton hall', null, [[43.129296, -77.6311965],[43.129277, -77.6312532],[43.1291711, -77.6311815]], 'Wilson Quad');
    BR01B_WQPB = new Edge('path', 'BR01B_WQPB', null, true, false, true, false, false, 'Leave Burton hall', 'Enter Burton hall', null, [[43.1292627, -77.6311965],[43.129277, -77.6312532],[43.1291711, -77.6311815]], 'Wilson Quad');
    BR01B_WQPA = new Edge('path', 'BR01B_WQPA', null, true, false, true, false, false, 'Leave Burton hall', 'Enter Burton hall', null, [[43.1292627, -77.6311965],[43.1292248, -77.6313938],[43.1291189, -77.6313241]], 'Wilson Quad');
    BR01C_WQPA = new Edge('path', 'BR01C_WQPA', null, true, false, true, false, false, 'Leave Burton hall', 'Enter Burton hall', null, [[43.129204, -77.6314433],[43.1292248, -77.6313938],[43.1291189, -77.6313241]], 'Wilson Quad');
    WQPA_WQPB = new Edge('path', 'WQPA_WQPB', null, false, false, false, false, true, 'Head towards Crosby hall', 'Head towards Burton hall', null, [[43.1291189, -77.6313241],[43.1291711, -77.6311815]], 'Wilson Quad');
    WQPA_WQPE = new Edge('path', 'WQPA_WQPE', null, false, false, false, false, true, 'Head towards the fraternity quad', 'Head towards Burton hall', null, [[43.1291189, -77.6313241],[43.1290393, -77.6315472]], 'Wilson Quad');
    WQPB_WQPD = new Edge('path', 'WQPB_WQPD', null, false, false, false, false, true, 'Head towards Crosby hall', 'Head towards Burton hall', null, [[43.1291711, -77.6311815],[43.1292818, -77.6308716]], 'Wilson Quad');
    WQPE_WQPF = new Edge('path', 'WQPE_WQPF', null, false, false, false, false, true, 'Head towards LeChase hall', 'Head towards Burton hall', null, [[43.1290393, -77.6315472],[43.1286759, -77.6312982]], 'Wilson Quad');
    WQPC_WQPD = new Edge('path', 'WQPC_WQPD', null, false, false, false, false, true, 'Head towards the residence halls', 'Head towards LeChase and Rettner hall', null, [[43.1289216, -77.6306342],[43.1292818, -77.6308716]], 'Wilson Quad');
    WQPC_WQPF = new Edge('path', 'WQPC_WQPF', null, false, false, false, false, true, 'Head towards the fraternity quad', 'Head towards Wilson Commons', null, [[43.1289216, -77.6306342],[43.1286759, -77.6312982]], 'Wilson Quad');
    WQPC_WQPG = new Edge('path', 'WQPC_WQPG', null, false, false, false, false, true, 'Head towards Rettner hall', 'Head towards Wilson quad', null, [[43.1289216, -77.6306342],[43.1285042, -77.6303344]], 'Wilson Quad');
    WQPG_WQPH = new Edge('path', 'WQPG_WQPH', null, false, false, false, false, true, 'Head towards Rettner and Morey hall', 'Head towards LeChase hall', null, [[43.1285042, -77.6303344],[43.1283342, -77.6302145]], 'Wilson Quad');
    RT01A_WQPG = new Edge('path', 'RT01A_WQPG', null, false, false, false, false, true, 'Leave Rettner hall', 'Enter Rettner hall', ['broken push door button to Burton entrance facing Wilson Quad'], [[43.1286775, -77.630216],[43.1285042, -77.6303344]], 'Wilson Quad');
    RT01C_WQPH = new Edge('path', 'RT01C_WQPH', null, false, false, false, false, true, 'Leave Rettner hall', 'Enter Rettner hall', ['broken push door button to Burton entrance facing Lattimore'], [[43.1283643, -77.6301248],[43.1283342, -77.6302145]], 'Wilson Quad'); 
    BL01_BL02 = new Edge('floor', 'BL01_BL02', 2, false, false, false, false, true, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', ['broken elevator in Bausch & Lomb Hall'], null, 'Bausch & Lomb');
    BL01_BL03 = new Edge('floor', 'BL01_BL03', 3, false, false, false, false, true, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', ['broken elevator in Bausch & Lomb Hall'], null, 'Bausch & Lomb');
    BL01_BL04 = new Edge('floor', 'BL01_BL04', 4, false, false, false, false, true, 'Move from 1st floor to 4th floor', 'Move from 4th floor to 1st floor', ['broken elevator in Bausch & Lomb Hall'], null, 'Bausch & Lomb');
    BL01_BL05 = new Edge('floor', 'BL01_BL05', 5, true, true, false, false, false, 'Move from 1st floor to 5th floor', 'Move from 5th floor to 1st floor', null, null, 'Bausch & Lomb');
    BL02_BL03 = new Edge('floor', 'BL02_BL03', 2, false, false, false, false, true, 'Move from 2nd floor to 3rd floor', 'Move from 3rd floor to 2nd floor', ['broken elevator in Bausch & Lomb Hall'], null, 'Bausch & Lomb');
    BL02_BL04 = new Edge('floor', 'BL02_BL04', 3, false, false, false, false, true, 'Move from 2nd floor to 4th floor', 'Move from 4th floor to 2nd floor', ['broken elevator in Bausch & Lomb Hall'], null, 'Bausch & Lomb');
    BL02_BL05 = new Edge('floor', 'BL02_BL05', 4, true, true, false, false, false, 'Move from 2nd floor to 5th floor', 'Move from 5th floor to 2nd floor', null, null, 'Bausch & Lomb');
    BL01_BL01A = new Edge('level', 'BL01_BL01A', 1, false, false, false, false, true, null, null, null, null, 'Bausch & Lomb');
    BL01_BL01B = new Edge('level', 'BL01_BL01B', 1, false, false, false, false, true, null, null, null, null, 'Bausch & Lomb');
    BL01_BL01C = new Edge('level', 'BL01_BL01C', 1, false, false, false, false, true, null, null, null, null, 'Bausch & Lomb');
    BL02_BL02A = new Edge('level', 'BL02_BL02A', 1, false, false, false, false, true, null, null, null, null, 'Bausch & Lomb');
    DWB_DW01 = new Edge('floor', 'DWB_DW01', 2, false, false, false, true, false, 'Move from basement to 1st floor', 'Move from 1st floor to basement', ['broken elevator on south side of Dewey Hall'], null, 'Dewey');
    DW01_DW02 = new Edge('floor', 'DW01_DW02', 3, false, false, false, false, true, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', ['broken elevator on north side of Dewey Hall'], null, 'Dewey');
    DW01_DW03 = new Edge('floor', 'DW01_DW03', 3, false, false, false, false, true, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', ['broken elevator on north side of Dewey Hall'], null, 'Dewey');
    DW01_DW04 = new Edge('floor', 'DW01_DW04', 4, false, false, false, false, true, 'Move from 1st floor to 4th floor', 'Move from 4th floor to 1st floor', ['broken elevator on north side of Dewey Hall'], null, 'Dewey');
    DW01_DW05 = new Edge('floor', 'DW01_DW05', 5, true, true, false, false, false, 'Move from 1st floor to 5th floor', 'Move from 5th floor to 1st floor', ['broken elevator on north side of Dewey Hall'], null, 'Dewey');
    DW02_DW03 = new Edge('floor', 'DW02_DW03', 2, false, false, false, false, true, 'Move from 2nd floor to 3rd floor', 'Move from 3rd floor to 2nd floor', ['broken elevator on north side of Dewey Hall'], null, 'Dewey');
    DW02_DW04 = new Edge('floor', 'DW02_DW04', 3, false, false, false, false, true, 'Move from 2nd floor to 4th floor', 'Move from 4th floor to 2nd floor', ['broken elevator on north side of Dewey Hall'], null, 'Dewey');
    DW02_DW05 = new Edge('floor', 'DW02_DW05', 4, true, true, false, false, false, 'Move from 2nd floor to 5th floor', 'Move from 5th floor to 2nd floor', ['broken elevator on north side of Dewey Hall'], null, 'Dewey');
    DW01_DW01A = new Edge('level', 'DW01_DW01A', 1, false, false, false, false, true, null, null, null, null, 'Dewey');
    DW01_DW01B = new Edge('level', 'DW01_DW01B', 1, false, false, false, false, true, null, null, null, null, 'Dewey');
    DW01_DW01C = new Edge('level', 'DW01_DW01C', 1, false, false, false, false, true, null, null, null, null, 'Dewey');
    DW01_DW01D = new Edge('level', 'DW01_DW01D', 1, false, false, false, false, true, null, null, null, null, 'Dewey');
    DW02_DW02A = new Edge('level', 'DW02_DW02A', 1, false, false, false, false, true, null, null, null, null, 'Dewey');
    HT01_HT02 = new Edge('floor', 'HT01_HT02', 2, true, true, false, false, false, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', null, null, 'Hoyt');
    HT01_HT01A = new Edge('level', 'HT01_HT01A', 1, false, false, false, false, true, null, null, null, null, 'Hoyt');
    HT01_HT01B = new Edge('level', 'HT01_HT01B', 1, false, false, false, false, true, null, null, null, null, 'Hoyt');
    HT01_HT01C = new Edge('level', 'HT01_HT01C', 1, false, false, false, false, true, null, null, null, null, 'Hoyt');
    HT01_HT01D = new Edge('level', 'HT01_HT01D', 1, false, false, false, false, true, null, null, null, null, 'Hoyt');
    HT01_HT01E = new Edge('level', 'HT01_HT01E', 1, false, false, false, false, true, null, null, null, null, 'Hoyt');
    HT01_HT01F = new Edge('level', 'HT01_HT01F', 1, false, false, false, false, true, null, null, null, null, 'Hoyt');
    HT02_HT02A = new Edge('level', 'HT02_HT02A', 1, false, false, false, false, true, null, null, null, null, 'Hoyt');
    LT01_LT02 = new Edge('floor', 'LT01_LT02', 2, false, false, false, true, false, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', ['broken elevator in Lattimore Hall'], null, 'Lattimore');
    LT01_LT03 = new Edge('floor', 'LT01_LT03', 3, false, false, false, true, false, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', ['broken elevator in Lattimore Hall'], null, 'Lattimore');
    LT01_LT04 = new Edge('floor', 'LT01_LT04', 4, false, false, false, true, false, 'Move from 1st floor to 4th floor', 'Move from 4th floor to 1st floor', ['broken elevator in Lattimore Hall'], null, 'Lattimore');
    LT01_LT05 = new Edge('floor', 'LT01_LT05', 5, false, false, false, true, false, 'Move from 1st floor to 5th floor', 'Move from 5th floor to 1st floor', ['broken elevator in Lattimore Hall'], null, 'Lattimore');
    LT02_LT03 = new Edge('floor', 'LT02_LT03', 2, false, false, false, true, false, 'Move from 2nd floor to 3rd floor', 'Move from 3rd floor to 2nd floor', ['broken elevator in Lattimore Hall'], null, 'Lattimore');
    LT02_LT04 = new Edge('floor', 'LT02_LT04', 3, false, false, false, true, false, 'Move from 2nd floor to 4th floor', 'Move from 4th floor to 2nd floor', ['broken elevator in Lattimore Hall'], null, 'Lattimore');
    LT02_LT05 = new Edge('floor', 'LT02_LT05', 4, false, false, false, true, false, 'Move from 2nd floor to 5th floor', 'Move from 5th floor to 2nd floor', ['broken elevator in Lattimore Hall'], null, 'Lattimore');
    LT03_LT04 = new Edge('floor', 'LT03_LT04', 2, false, false, false, true, false, 'Move from 3rd floor to 4th floor', 'Move from 4th floor to 3rd floor', ['broken elevator in Lattimore Hall'], null, 'Lattimore');
    LT03_LT05 = new Edge('floor', 'LT03_LT05', 3, false, false, false, true, false, 'Move from 3rd floor to 5th floor', 'Move from 5th floor to 3rd floor', ['broken elevator in Lattimore Hall'], null, 'Lattimore');
    LT01_LT01A = new Edge('level', 'LT01_LT01A', 1, false, false, false, false, true, null, null, null, null, 'Lattimore');
    LT02_LT02A = new Edge('level', 'LT02_LT02A', 1, false, false, false, false, true, null, null, null, null, 'Lattimore');
    LT03_LT03A = new Edge('level', 'LT03_LT03A', 1, false, false, false, false, true, null, null, null, null, 'Lattimore');
    IF01_IF02 = new Edge('floor', 'IF01_IF02', 2, false, false, false, false, true, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', null, null, 'Interfaith Chapel');
    IF01_IF03 = new Edge('floor', 'IF01_IF03', 3, false, false, false, false, true, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', null, null, 'Interfaith Chapel');
    IF02_IF03 = new Edge('floor', 'IF02_IF03', 2, false, false, false, false, true, 'Move from 2nd floor to 1st floor', 'Move from 3rd floor to 2nd floor', null, null, 'Interfaith Chapel');
    IF01_IF01A = new Edge('level', 'IF01_IF01A', 1, false, false, false, false, true, null, null, null, null, 'Interfaith Chapel');     
    IF01_IF01B = new Edge('level', 'IF01_IF01B', 1, false, false, false, false, true, null, null, null, null, 'Interfaith Chapel');     
    IF03_IF03A = new Edge('level', 'IF03_IF03A', 1, false, false, false, false, true, null, null, null, null, 'Interfaith Chapel');     
    EQPJ_LT03A = new Edge('path', 'EQPJ_LT03A', null, false, false, false, false, true, 'Enter 3rd floor of Lattimore Hall', 'Leave 3rd floor of Lattimore Hall', ['broken push door button to 3rd floor entrance of Lattimore'], [[43.1279743,  -77.630548],[43.1280116,  -77.6305737]], 'Eastman Quad');
    EQPO_LT02A = new Edge('tunnel', 'EQPO_LT02A', null, false, false, false, false, true, 'Enter 2nd floor of Lattimore to the left when leaving the painted tunnel', 'Leave 2nd floor of Lattimore keeping the painted tunnel to the right', ['broken push door button to 2nd floor entrance of Lattimore from tunnel area'], [[43.1282065,  -77.6301582],[43.1281765,  -77.6302765]], 'Morey/Lattimore');     
    EQPO_MR02B = new Edge('tunnel', 'EQPO_MR02B', null, false, false, false, false, true, 'Enter 2nd floor of Morey to the right when leaving the painted tunnel', 'Leave 2nd floor of Morey keeping the painted tunnel to the left', ['broken push door button to 2nd floor entrance of Morey from tunnel area'], [[43.1282065,  -77.6301582],[43.128263,  -77.6300103]], 'Morey/Lattimore');
    EQPO_EQPP = new Edge('tunnel', 'EQPO_EQPP', null, false, false, false, false, true, 'Move through the painted tunnel away from Morey and Lattimore', 'Move through the painted tunnel away from Hoyt Hall', null, [[43.1282065,  -77.6301582],[43.1276582,  -77.6297745]], 'Eastman Quad');
    EQPH_EQPI = new Edge('path', 'EQPH_EQPI', null, false, false, false, false, true, 'Cross Eastman Quad heading towards Morey and Lattimore', 'Cross Eastman Quad heading towards Dewey and Bausch & Lomb', null, [[43.127733,  -77.6297917],[43.1281471,  -77.6300906]], 'Eastman Quad');
    EQPA_EQPI = new Edge('path', 'EQPA_EQPI', null, false, false, false, false, true, 'Head in the direction of Lattimore Hall', 'Head in the direction of Rush Rhees and Morey Hall', null, [[43.1282524,  -77.6298131],[43.1281471,  -77.6300906]], 'Eastman Quad');      
    EQPG_EQPH = new Edge('path', 'EQPG_EQPH', null, false, false, false, false, true, 'Head in the direction of Hoyt and Dewey Hall', 'Head in the direction of Bausch & Lomb and Rush Rhees', null, [[43.1279103,  -77.6293189],[43.127733,  -77.6297917]], 'Eastman Quad');
    EQPI_EQPJ = new Edge('path', 'EQPI_EQPJ', null, false, false, false, false, true, 'Head in the direction of Lattimore Hall', 'Head in the direction of Morey and Rush Rhees', null, [[43.1281471,  -77.6300906],[43.1279743,  -77.630548]], 'Eastman Quad');
    EQPH_EQPK = new Edge('path', 'EQPH_EQPK', null, false, false, false, false, true, 'Head in the direction of Dewey Hall', 'Head in the direction of Bausch & Lomb and Rush Rhees', null, [[43.127733,  -77.6297917],[43.1275533,  -77.6302701]], 'Eastman Quad');        
    EQPJ_EQPN = new Edge('path', 'EQPJ_EQPN', null, false, false, false, false, true, 'Head in the direction of Strong Auditorium', 'Head in the direction of Lattimore Hall', null, [[43.1279743,  -77.630548],[43.1277695,  -77.6311172]], 'Eastman Quad');
    EQPK_EQPL = new Edge('path', 'EQPK_EQPL', null, false, false, false, false, true, 'Head in the direction of the business school and chapel', 'Head in the direction of Dewey Hall', null, [[43.1275533,  -77.6302701],[43.12735,  -77.6308183]], 'Eastman Quad');       
    EQPJ_EQPK = new Edge('path', 'EQPJ_EQPK', null, false, false, false, false, true, 'Cross Eastman Quad heading towards Dewey', 'Cross Eastman Quad heading towards Lattimore', null, [[43.1279743,  -77.630548],[43.1275533,  -77.6302701]], 'Eastman Quad');
    EQPM_EQPN = new Edge('path', 'EQPM_EQPN', null, false, false, false, false, true, 'Head towards Lattimore Hall', 'Head in the direction of Dewey Hall', null, [[43.1275608,  -77.6309685],[43.1277695,  -77.6311172]], 'Eastman Quad');
    EQPL_EQPM = new Edge('path', 'EQPL_EQPM', null, false, false, false, false, true, 'Head in the direction of Lattimore Hall', 'Head towards Dewey Hall', null, [[43.12735,  -77.6308183],[43.1275608,  -77.6309685]], 'Eastman Quad');
    EQPM_IF03A = new Edge('path', 'EQPM_IF03A', null, false, false, false, false, true, 'Head away from Eastman Quad and enter the Interfaith Chapel', 'Leave the Interfaith Chapel and head towards Eastman Quad', ['broken push door button entering 3rd floor of the Interfaith Chapel'], [[43.1275608,  -77.6309685],[43.1270898,  -77.6321881]], 'Eastman Quad');
    BL02A_EQPG = new Edge('path', 'BL02A_EQPG', null, false, false, false, false, true, 'Leave the 2nd floor of Bausch & Lomb', 'Enter the 2nd floor of Bausch & Lomb', ['broken push door button to 2nd floor entrance of Bausch & Lomb'], [[43.1278652,  -77.6292931],[43.1279103,  -77.6293189]], 'Eastman Quad');
    DW02A_EQPK = new Edge('path', 'DW02A_EQPK', null, false, false, false, false, true, 'Leave the 2nd floor of Dewey Hall', 'Enter the 2nd floor of Dewey Hall', ['broken push door button to 2nd floor entrance of Dewey'], [[43.1275255,  -77.6302473],[43.1275533,  -77.6302701]], 'Eastman Quad');
    EQPG_EQPJ = new Edge('path', 'EQPG_EQPJ', null, false, false, false, false, true, 'Diagonally cross Eastman Quad heading towards Lattimore', 'Diagonally cross Eastman Quad heading towards Bausch & Lomb', null, [[43.1279103,  -77.6293189],[43.1279743,  -77.630548]], 'Eastman Quad');
    EQPB_EQPK = new Edge('path', 'EQPB_EQPK', null, false, false, false, false, true, 'Diagonally cross Eastman Quad heading towards Dewey', 'Diagonally cross Eastman Quad heading towards Morey', null, [[43.1283214,  -77.6296242],[43.1275533,  -77.6302701]], 'Eastman Quad');
    EQPB_EQPD = new Edge('path', 'EQPB_EQPD', null, false, false, false, false, true, 'Diagonally cross Eastman Quad heading to Rush Rhees', 'Diagonally cross Eastman Quad heading to Morey', null, [[43.1283214,  -77.6296242],[43.1282604,  -77.6290755]], 'Eastman Quad');
    EQPD_EQPG = new Edge('path', 'EQPD_EQPG', null, false, false, false, false, true, 'Diagonally cross Eastman Quad heading towards Bausch & Lomb', 'Diagonally cross Eastman Quad heading towards Rush Rhees', null, [[43.1282604,  -77.6290755],[43.1279103,  -77.6293189]], 'Eastman Quad');
    EQPJ_EQPM = new Edge('path', 'EQPJ_EQPM', null, false, false, false, false, true, 'Diagonally cross Eastman Quad heading towards the steps leaving the quad', 'Diagonally cross Eastman Quad heading towards Lattimore', null, [[43.1279743,  -77.630548],[43.1275608,  -77.6309685]], 'Eastman Quad');
    EQPK_EQPM = new Edge('path', 'EQPK_EQPM', null, false, false, false, false, true, 'Diagonally cross Eastman Quad heading towards the steps leaving the quad', 'Diagonally cross Eastman Quad heading towards Dewey', null, [[43.1275533,  -77.6302701],[43.1275608,  -77.6309685]], 'Eastman Quad');
    EQPP_HT01A = new Edge('tunnel', 'EQPP_HT01A', null, false, false, false, false, true, 'Enter Hoyt Hall through the door at the end of the tunnel', 'Leave Hoyt Hall to enter the tunnel area', ['broken push door button entering Hoyt from the tunnels'], [[43.1276582,  -77.6297745],[43.1274836,  -77.629653]], 'Eastman Quad');
    EQPR_HT01B = new Edge('path', 'EQPR_HT01B', null, true, false, true, false, false, 'Enter Hoyt Hall', 'Leave Hoyt Hall', null, [[43.1273606,  -77.6293079],[43.1275458,  -77.6294423],[43.1275262,  -77.629496],[43.127635,  -77.6296616]], 'Outside Hoyt');
    EQPQ_HT01E = new Edge('path', 'EQPQ_HT01E', null, true, false, true, false, false, 'Enter Hoyt Hall', 'Leave Hoyt Hall', null, [[43.1272868,  -77.6297036],[43.1274317,  -77.6297281],[43.1274348,  -77.629703]], 'Outside Hoyt');
    EQPQ_HT01F = new Edge('path', 'EQPQ_HT01F', null, false, false, false, false, true, 'Enter Hoyt Hall', 'Leave Hoyt Hall', ['broken push door button to the 1st floor Hoyt entrance facing Dewey'], [[43.1272868,  -77.6297036],[43.1274317,  -77.6297281],[43.1274637,  -77.6296951]], 'Outside Hoyt');
    EQPR_HT02A = new Edge('path', 'EQPR_HT02A', null, true, true, false, false, false, 'Enter Hoyt Hall', 'Leave Hoyt Hall', null, [[43.1273606,  -77.6293079],[43.127547,  -77.6294428],[43.127527,  -77.6294949],[43.127563,  -77.6295909],[43.1276391,  -77.6296539],[43.1276141,  -77.6297259]], 'Outside Hoyt');
    EQPQ_HT02A = new Edge('path', 'EQPQ_HT02A', null, true, true, false, false, false, 'Enter Hoyt Hall', 'Leave Hoyt Hall', null, [[43.1272868,  -77.6297036],[43.127433,  -77.6297307],[43.127503,  -77.6297335],[43.1275871,  -77.629791],[43.1276141,  -77.6297259]], 'Outside Hoyt');
    BL01A_RRGB = new Edge('tunnel', 'BL01A_RRGB', null, true, true, true, false, false, 'Enter tunnels; take left door at the end of the hall; follow the tunnel; take a left at the intersection; continue; go through door marked Rush Rhees', 'Go through the door to enter the tunnel; follow the tunnel; take a right at the intersection; continue and take a right after the next door; enter main tunnel area', null, [[43.1279425,  -77.6290296],[43.1279647,  -77.6290445],[43.1279875,  -77.6289774],[43.1280148,  -77.6289992],[43.1280951,  -77.6287784]], 'Eastman Quad');
    BL01B_EQPR = new Edge('path', 'BL01B_EQPR', null, true, true, true, false, false, 'Leave the 1st floor of Bausch & Lomb', 'Enter the 1st floor of Bausch & Lomb', null, [[43.1279416,  -77.6290303],[43.1273606,  -77.6293079]], 'Outside Hoyt');
    BL01C_EQPP = new Edge('tunnel', 'BL01C_EQPP', null, false, false, false, false, true, 'Leave Bausch & Lomb and enter the tunnel area', 'Enter Bausch & Lomb from the tunnel area', ['broken push door button to the Bausch & Lomb entrance facing Hoyt'], [[43.1274095,  -77.6291748],[43.1276582,  -77.6297745]], 'Outside Hoyt');
    DW01A_EQPP = new Edge('tunnel', 'DW01A_EQPP', null, false, false, false, false, true, 'Leave Dewey Hall and enter the tunnel area', 'Enter Dewey Hall from the tunnel area', ['broken push door button to the Dewey entrance facing Hoyt'], [[43.1276196,  -77.6298712],[43.1276582,  -77.6297745]], 'Outside Hoyt');
    DW01B_EQPQ = new Edge('path', 'DW01B_EQPQ', null, false, false, true, false, false, 'Leave the 1st floor of Dewey Hall', 'Enter the 1st floor of Dewey Hall', null, [[43.1272197,  -77.629882],[43.1272868,  -77.6297036]], 'Outside Hoyt');
    ML01_ML02 = new Edge('floor', 'ML01_ML02', 2, false, false, false, false, true, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', ['broken elevator in Meliora'], null, 'Meliora');
    ML01_ML03 = new Edge('floor', 'ML01_ML03', 3, false, false, false, false, true, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', ['broken elevator in Meliora'], null, 'Meliora');
    ML02_ML03 = new Edge('floor', 'ML02_ML03', 2, false, false, false, false, true, 'Move from 2nd floor to 3rd floor', 'Move from 3rd floor to 2nd floor', ['broken elevator in Meliora'], null, 'Meliora');
    ML02_ML04 = new Edge('floor', 'ML02_ML04', 3, false, false, false, false, true, 'Move from 2nd floor to 4th floor', 'Move from 4th floor to 2nd floor', ['broken elevator in Meliora'], null, 'Meliora');
    ML03_ML04 = new Edge('floor', 'ML03_ML04', 2, false, false, false, false, true, null, null, null, null, 'Meliora');
    ML02_ML02A = new Edge('level', 'ML02_ML02A', 1, false, false, false, false, true, null, null, null, null, 'Meliora');
    ML02_ML02B = new Edge('level', 'ML02_ML02B', 1, false, false, false, false, true, null, null, null, null, 'Meliora');
    ML03_ML03A = new Edge('level', 'ML03_ML03A', 1, false, false, false, false, true, null, null, null, null, 'Meliora');
    ML03_ML03B = new Edge('level', 'ML03_ML03B', 1, false, false, false, false, true, null, null, null, null, 'Meliora');
    EQPAB_EQPQ = new Edge('path', 'EQPAB_EQPQ', null, false, false, false, false, true, 'Move towards Hoyt Hall', 'Move towards Gavett Hall', null, [[43.1269221,  -77.6294539],[43.1272868,  -77.6297136]], 'Eastman Quad');
    EQPAA_EQPR = new Edge('path', 'EQPAA_EQPR', null, false, false, false, false, true, 'Move towards Hoyt Hall', 'Move towards Gavett Hall', null, [[43.1270544,  -77.6290913],[43.1273606,  -77.6293079]], 'Eastman Quad');
    EQPAA_EQPAB = new Edge('path', 'EQPAA_EQPAB', null, false, false, false, false, true, 'Move past Gavette hall towards the Science Quad', 'Move past Gavette towards Meliora Hall', null, [[43.1270544,  -77.6290913],[43.1269221,  -77.6294539]], 'Eastman Quad');      
    EQPAA_EQPZ = new Edge('path', 'EQPAA_EQPZ', null, false, false, false, false, true, 'Move away from Gavette towards Meliora', 'Move away from Meliora towards Gavett', null, [[43.1270544,  -77.6290913],[43.1273025,  -77.6284454]], 'Eastman Quad');
    EQPS_EQPT = new Edge('path', 'EQPS_EQPT', null, false, false, false, false, true, 'Move along Meliora plaza away from Bausch & Lomb', 'Move along Meliora plaza towards Bausch & Lomb', null, [[43.1274348,  -77.6285361],[43.1274698,  -77.6284278],[43.127423,  -77.6283975],[43.127614,  -77.6278789]], 'Eastman Quad');
    EQPS_EQPZ = new Edge('path', 'EQPS_EQPZ', null, true, true, false, false, false, 'Exit Meliora plaza by the staircase', 'Enter Meliora plaza by the staircase', null, [[43.1274348,  -77.6285361],[43.1273025,  -77.6284454]], 'Eastman Quad');
    EQPS_EQPV = new Edge('path', 'EQPS_EQPV', null, false, false, false, false, true, 'Move along Meliora plaza towards from Rush Rhees', 'Move along Meliora plaza away from Rush Rhees', null, [[43.1274348,  -77.6285361],[43.1277656,  -77.628706]], 'Eastman Quad');   
    EQPU_EQPV = new Edge('path', 'EQPU_EQPV', null, false, false, false, false, true, 'Move along Meliora plaza towards Bausch & Lomb', 'Move along Meliora plaza away from Bausch & Lomb', null, [[43.1280854,  -77.6278033],[43.1277656,  -77.628706]], 'Eastman Quad');  
    EQPV_EQPW = new Edge('path', 'EQPV_EQPW', null, false, false, false, false, true, 'Leave Eastman Quad and head towards Rush Rhees', 'Head towards Eastman Quad', null, [[43.1277656,  -77.628706],[43.128022,  -77.6288722]], 'Eastman Quad');
    EQPW_EQPY = new Edge('path', 'EQPW_EQPY', null, true, true, false, false, false, 'Move along Rush Rhees away from Eastman Quad', 'Move along Rush Rhees towards Eastman Quad', null, [[43.128022,  -77.6288722],[43.1284383,  -77.6277806]], 'Eastman Quad');
    EQPU_EQPX = new Edge('path', 'EQPU_EQPX', null, false, false, false, false, true, 'Head away from Meliora towards the road', 'Head towards Meliora Hall', null, [[43.1280854,  -77.6278033],[43.1277077,  -77.6274823]], 'Eastman Quad');
    EQPU_EQPY = new Edge('path', 'EQPU_EQPY', null, false, false, false, false, true, 'Head away from Meliora towards the road', 'Head towards Meliora Hall', null, [[43.1280854,  -77.6278033],[43.1284383,  -77.6277806]], 'Eastman Quad');
    EQPX_EQPAE = new Edge('path', 'EQPX_EQPAE', null, false, false, false, false, true, 'Continue to a intersection of sidewalks', 'Move away from the road alongside Meliora', null, [[43.1277077,  -77.6274823],[43.1275754,  -77.6277278]], 'Eastman Quad');
    EQPAC_EQPAE = new Edge('path', 'EQPAC_EQPAE', null, false, false, false, false, true, 'Continue alongside Meliora', 'Continue alongside Meliora', null, [[43.1273935,  -77.6282075],[43.1275754,  -77.6277278]], 'Eastman Quad');
    EQPT_ML03B = new Edge('path', 'EQPT_ML03B', null, false, false, false, false, true, 'Enter the 3rd floor of Meliora', 'Leave the 3rd floor of Meliora', ['broken push door button to 3rd floor Meliora entrance facing Harkness'], [[43.127614,  -77.6278789],[43.1276646,  -77.6279163]], 'Eastman Quad');
    EQPAC_ML02B = new Edge('path', 'EQPAC_ML02B', null, true, true, false, false, false, 'Enter the 2nd floor of Meliora', 'Leave the 2nd floor of Meliora', null, [[43.1273935,  -77.6282075],[43.1274581,  -77.6282562]], 'Eastman Quad');
    EQPAD_ML03A = new Edge('path', 'EQPAD_ML03A', null, false, false, false, false, true, 'Enter the 3rd floor of Meliora', 'Leave the 3rd floor of Meliora', ['broken push door button to 3rd floor Meliora entrance facing Eastman Quad'], [[43.1278979,  -77.628317],[43.1278794,  -77.6283018]], 'Eastman Quad');
    EQPX_EQPY = new Edge('path', 'EQPX_EQPY', null, false, false, false, false, true, 'Take a slight left; continue to the road; turn left and head towards Rush Rhees', 'Move alongside the road until just before a curve in the sidewalk and follow the path to the right', null, [[43.1277077,  -77.6274823],[43.1279881,  -77.6273626],[43.1284383,  -77.6277806]], 'Eastman Quad');
    EQPF_EQPV = new Edge('path', 'EQPF_EQPV', null, false, false, false, false, true, 'Leave Eastman Quad and head towards Meliora', 'Head towards Eastman Quad', null, [[43.1280535,  -77.6289301],[43.1280212,  -77.6288848],[43.1277656,  -77.628706]], 'Eastman Quad'); 
    EQPF_EQPW = new Edge('path', 'EQPF_EQPW', null, false, false, false, false, true, 'Leave Eastman Quad and head towards Rush Rhees', 'Head towards Eastman Quad', null, [[43.1280535,  -77.6289301],[43.128022,  -77.6288722]], 'Eastman Quad');
    EQPAF_RRGA = new Edge('path', 'EQPAF_RRGA', null, false, false, false, false, true, 'Enter ground floor of Rush Rhees', 'Leave ground floor of Rush Rhees', null, [[43.1287332,  -77.6279317],[43.1287284,  -77.6279537]], 'Eastman Quad');
    EQPAF_EQPY = new Edge('path', 'EQPAF_EQPY', null, false, false, false, false, true, 'Move alongside Rush Rhees towards the entrance', 'Move alongside Rush Rhees away from the entrance', null, [[43.1287332,  -77.6279317],[43.1284383,  -77.6277806]], 'Eastman Quad');
    EQPAE_EQPT = new Edge('path', 'EQPAE_EQPT', null, true, true, false, false, false, 'Go up the steps to the plaza', 'Go down the steps from the plaza', null, [[43.1275754,  -77.6277278],[43.1276518,  -77.6277819],[43.127614,  -77.6278789]], 'Eastman Quad');        
    ML02A_RRGB = new Edge('tunnel', 'ML02A_RRGB', null, true, true, true, false, false, 'Take a right after the door to the tunnels; follow the tunnel; take a right at the intersection; continue to a door marked Rush Rhees', 'Go through the door to enter the tunnel; follow the tunnel; take a left at the intersection; continue; enter the door at the end of the hall on the left', null, [[43.1277552,  -77.6287196],[43.1280019,  -77.6289377],[43.1279881,  -77.6289792],[43.1280157,  -77.6290019],[43.1281014,  -77.6287809]], 'Eastman Quad');
    BL01A_ML02A = new Edge('tunnel', 'BL01A_ML02A', null, true, true, true, false, false, 'Enter tunnels; take left door at the end of the hall; follow the tunnel; take a right at the intersection; continue; enter the door at the end of the hall on the left', 'Take a right after the door to the tunnels; follow the tunnel; take a left at the intersection; continue to the door to Bausch and Lomb', null, [[43.1277064,  -77.6296434],[43.1280019,  -77.6289377],[43.1279633,  -77.6290434],[43.1277552,  -77.6287196]], 'Eastman Quad');
    DG01_DG02 = new Edge('floor', 'DG01_DG02', 2, false, false, false, false, true, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', ['broken elevator in Douglass'], null, 'Douglass');
    DG01_DG03 = new Edge('floor', 'DG01_DG03', 3, false, false, false, false, true, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', ['broken elevator in Douglass'], null, 'Douglass');
    DG01_DG04 = new Edge('floor', 'DG01_DG04', 4, false, false, false, false, true, 'Move from 1st floor to 4th floor', 'Move from the 4th floor to 1st floor', ['broken elevator in Douglass'], null, 'Douglass');
    DG02_DG03 = new Edge('floor', 'DG02_DG03', 2, false, false, false, false, true, 'Move from 2nd floor to 3rd floor', 'Move from 3rd floor to 2nd floor', ['broken elevator in Douglass'], null, 'Douglass');
    DG02_DG04 = new Edge('floor', 'DG02_DG04', 3, false, false, false, false, true, 'Move from 2nd floor to 4th floor', 'Move from 4th floor to 2nd floor', ['broken elevator in Douglass'], null, 'Douglass');
    DG03_DG04 = new Edge('floor', 'DG03_DG04', 4, false, false, false, false, true, 'Move from 3rd floor to 4th floor', 'Move from 4th floor to 3rd floor', ['broken elevator in Douglass'], null, 'Douglass');
    DG01_DG01A = new Edge('level', 'DG01_DG01A', 1, false, false, false, false, true, null, null, null, null, 'Douglass');
    DG02_DG02A = new Edge('level', 'DG02_DG02A', 1, false, false, false, false, true, null, null, null, null, 'Douglass');
    DG02_DG02B = new Edge('level', 'DG02_DG02B', 1, false, false, false, false, true, null, null, null, null, 'Douglass');
    DG02_DG02C = new Edge('level', 'DG02_DG02C', 1, false, false, false, false, true, null, null, null, null, 'Douglass');
    DG03_DG03A = new Edge('level', 'DG03_DG03A', 1, false, false, false, false, true, null, null, null, null, 'Douglass');
    WC01_WC02 = new Edge('floor', 'WC01_WC02', 2, false, false, false, false, true, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', ['broken elevator in Wilson Commons'], null, 'Wilson Commons');
    WC01_WC03 = new Edge('floor', 'WC01_WC03', 3, false, false, false, false, true, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', ['broken elevator in Wilson Commons'], null, 'Wilson Commons');
    WC01_WC04 = new Edge('floor', 'WC01_WC04', 4, false, false, false, false, true, 'Move from 1st floor to 4th floor', 'Move from the 4th floor to 1st floor', ['broken elevator in Wilson Commons'], null, 'Wilson Commons');
    WC01_WC05 = new Edge('floor', 'WC01_WC05', 5, false, false, false, false, true, 'Move from 1st floor to 5th floor', 'Move from 5th floor to 1st floor', ['broken elevator in Wilson Commons'], null, 'Wilson Commons');
    WC02_WC03 = new Edge('floor', 'WC02_WC03', 2, false, false, false, false, true, 'Move from 2nd floor to 3rd floor', 'Move from 3rd floor to 2nd floor', ['broken elevator in Wilson Commons'], null, 'Wilson Commons');
    WC02_WC04 = new Edge('floor', 'WC02_WC04', 3, false, false, false, false, true, 'Move from 2nd floor to 4th floor', 'Move from 4th floor to 2nd floor', ['broken elevator in Wilson Commons'], null, 'Wilson Commons');
    WC02_WC05 = new Edge('floor', 'WC02_WC05', 4, false, false, false, false, true, 'Move from 2nd floor to 5th floor', 'Move from 5th floor to 2nd floor', ['broken elevator in Wilson Commons'], null, 'Wilson Commons');
    WC03_WC04 = new Edge('floor', 'WC03_WC04', 2, false, false, false, false, true, 'Move from 3rd floor to 4th floor', 'Move from 4th floor to 3rd floor', ['broken elevator in Wilson Commons'], null, 'Wilson Commons');
    WC03_WC05 = new Edge('floor', 'WC03_WC05', 3, false, false, false, false, true, 'Move from 3rd floor to 5th floor', 'Move from 5th floor to 3rd floor', ['broken elevator in Wilson Commons'], null, 'Wilson Commons');
    WC04_WC05 = new Edge('floor', 'WC04_WC05', 2, false, false, false, false, true, 'Move from 4th floor to 5th floor', 'Move from 5th floor to 4th floor', ['broken elevator in Wilson Commons'], null, 'Wilson Commons');
    WC02_WC02A = new Edge('level', 'WC02_WC02A', 1, false, false, false, false, true, null, null, null, null, 'Wilson Commons');        
    WC02_WC02B = new Edge('level', 'WC02_WC02B', 1, false, false, false, false, true, null, null, null, null, 'Wilson Commons');        
    WC03_WC03A = new Edge('level', 'WC03_WC03A', 1, false, false, false, false, true, null, null, null, null, 'Wilson Commons');        
    WC03_WC03B = new Edge('level', 'WC03_WC03B', 1, false, false, false, false, true, null, null, null, null, 'Wilson Commons');        
    WC04_WC04A = new Edge('level', 'WC04_WC04A', 1, false, false, false, false, true, null, null, null, null, 'Wilson Commons');        
    DG02C_WC03A = new Edge('tunnel', 'DG02C_WC03A', null, false, false, false, false, true, 'move through the tunnel to enter Wilson Commons', 'move through the tunnel to enter Douglass', ['broken push door button entering 3rd floor of Wilson commons from the tunnels', ' broken push door button entering 2nd floor of Douglass from the tunnels'], [[43.1289934,  -77.6291547],[43.1289073,  -77.6293854]], 'Eastman Quad');
    RRGC_WC03B = new Edge('tunnel', 'RRGC_WC03B', null, false, false, false, false, true, 'Take a right when exiting 3rd floor of Wilson Commons; take a left at the end of the hall; continue through the tunnel and enter the ground floor of Rush Rhees', 'Pass vending machines and staircase; follow the tunnel; take the first right after the tunnel turns left; enter Wilson Commons at the end of the hall', ['broken push door button entering 3rd floor of Wilson commons from the tunnels'], [[43.128517,  -77.6290924],[43.1284887,  -77.6291643],[43.1288542,  -77.6294326]], 'Eastman Quad');
    DG03A_RR01A = new Edge('tunnel', 'DG03A_RR01A', null, false, false, false, false, true, 'move through the builidng connection to enter Rush Rhees', 'move through the building connection to enter Douglass', null, [[43.1287898,  -77.6287309],[43.128743,  -77.6286939]], 'Eastman Quad');
    HUB_HU01 = new Edge('floor', 'HUB_HU01', 2, false, false, false, false, true, 'Move from basement to 1st floor', 'Move from 1st floor to basement', ['broken elevator in Hutchinson'], null, 'Hutchinson');
    HU01_HU02 = new Edge('floor', 'HU01_HU02', 2, false, false, false, false, true, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', ['broken elevator in Hutchinson'], null, 'Hutchinson');
    HU01_HU03 = new Edge('floor', 'HU01_HU03', 3, false, false, false, false, true, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', ['broken elevator in Hutchinson'], null, 'Hutchinson');
    HU01_HU04 = new Edge('floor', 'HU01_HU04', 4, false, false, false, false, true, 'Move from 1st floor to 4th floor', 'Move from the 4th floor to 1st floor', ['broken elevator in Hutchinson'], null, 'Hutchinson');
    HU02_HU03 = new Edge('floor', 'HU02_HU03', 2, false, false, false, false, true, 'Move from 2nd floor to 3rd floor', 'Move from 3rd floor to 2nd floor', ['broken elevator in Hutchinson'], null, 'Hutchinson');
    HU02_HU04 = new Edge('floor', 'HU02_HU04', 3, false, false, false, false, true, 'Move from 2nd floor to 4th floor', 'Move from 4th floor to 2nd floor', ['broken elevator in Hutchinson'], null, 'Hutchinson');
    HL01_HL02 = new Edge('floor', 'HL01_HL02', 2, false, false, false, false, true, 'Move from 1st floor to 2nd floor', 'Move from 2nd floor to 1st floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL01_HL03 = new Edge('floor', 'HL01_HL03', 3, false, false, false, false, true, 'Move from 1st floor to 3rd floor', 'Move from 3rd floor to 1st floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL01_HL04 = new Edge('floor', 'HL01_HL04', 4, false, false, false, false, true, 'Move from 1st floor to 4th floor', 'Move from the 4th floor to 1st floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL01_HL05 = new Edge('floor', 'HL01_HL05', 5, false, false, false, false, true, 'Move from 1st floor to 5th floor', 'Move from 5th floor to 1st floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL01_HL06 = new Edge('floor', 'HL01_HL06', 6, false, false, false, false, true, 'Move from 1st floor to 6th floor', 'Move from 6th floor to 1st floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL01_HL07 = new Edge('floor', 'HL01_HL07', 7, false, false, false, false, true, 'Move from 1st floor to 7th floor', 'Move from 7th floor to 1st floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL01_HL08 = new Edge('floor', 'HL01_HL08', 8, false, false, false, false, true, 'Move from 1st floor to 8th floor', 'Move from 8th floor to 1st floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL01_HL09 = new Edge('floor', 'HL01_HL09', 9, false, false, false, false, true, 'Move from 1st floor to 9th floor', 'Move from 9th floor to 1st floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL01_HL10 = new Edge('floor', 'HL01_HL10', 10, false, false, false, false, true, 'Move from 1st floor to 10th floor', 'Move from 10th floor to 1st floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL01_HL11 = new Edge('floor', 'HL01_HL11', 11, false, false, false, false, true, 'Move from 1st floor to 11th floor', 'Move from 11th floor to 1st floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL02_HL03 = new Edge('floor', 'HL02_HL03', 2, false, false, false, false, true, 'Move from 2nd floor to 3rd floor', 'Move from 3rd floor to 2nd floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL02_HL04 = new Edge('floor', 'HL02_HL04', 3, false, false, false, false, true, 'Move from 2nd floor to 4th floor', 'Move from 4th floor to 2nd floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL02_HL05 = new Edge('floor', 'HL02_HL05', 4, false, false, false, false, true, 'Move from 2nd floor to 5th floor', 'Move from 5th floor to 2nd floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL02_HL06 = new Edge('floor', 'HL02_HL06', 5, false, false, false, false, true, 'Move from 2nd floor to 6th floor', 'Move from 6th floor to 2nd floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL02_HL07 = new Edge('floor', 'HL02_HL07', 6, false, false, false, false, true, 'Move from 2nd floor to 7th floor', 'Move from 7th floor to 2nd floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL02_HL08 = new Edge('floor', 'HL02_HL08', 7, false, false, false, false, true, 'Move from 2nd floor to 8th floor', 'Move from 8th floor to 2nd floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL02_HL09 = new Edge('floor', 'HL02_HL09', 8, false, false, false, false, true, 'Move from 2nd floor to 9th floor', 'Move from 9th floor to 2nd floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL02_HL10 = new Edge('floor', 'HL02_HL10', 9, false, false, false, false, true, 'Move from 2nd floor to 10th floor', 'Move from 10th floor to 2nd floor', ['broken elevator in Hylan'], null, 'Hylan');
    HL02_HL11 = new Edge('floor', 'HL02_HL11', 10, false, false, false, false, true, 'Move from 2nd floor to 11th floor', 'Move from 11th floor to 2nd floor', ['broken elevator in Hylan'], null, 'Hylan');
    HU01_HU01A = new Edge('level', 'HU01_HU01A', 1, false, false, false, false, true, null, null, null, null, 'Hutchinson');
    HU02_HU02A = new Edge('level', 'HU02_HU02A', 1, false, false, false, false, true, null, null, null, null, 'Hutchinson');
    HL01_HL01A = new Edge('level', 'HL01_HL01A', 1, false, false, false, false, true, null, null, null, null, 'Hylan');
    HL02_HL02A = new Edge('level', 'HL02_HL02A', 1, false, false, false, false, true, null, null, null, null, 'Hylan');
    SQPA_SQPW = new Edge('path', 'SQPA_SQPW', null, false, false, false, false, true, 'move towards Gavett and Hopeman', 'move towards Wegmans Hall', null, [[43.1262845,  -77.6295843],[43.1265819,  -77.6295891]], 'Science Quad');
    SQPV_SQPW = new Edge('path', 'SQPV_SQPW', null, false, false, false, false, true, 'move towards Gavett and Hopeman', 'move towards Hoyt Hall', null, [[43.126862,  -77.6296154],[43.1265819,  -77.6295891]], 'Science Quad');
    SQPA_SQPC = new Edge('path', 'SQPA_SQPC', null, false, false, false, false, true, 'move along the side of Wegmans', 'move along the side of Wegmans', null, [[43.1262845,  -77.6295843],[43.1261468,  -77.6295831]], 'Science Quad');
    SQPB_SQPC = new Edge('path', 'SQPB_SQPC', null, false, false, false, false, true, 'move along plaza outside Wegmans', 'move along plaza outside Wegmans', null, [[43.1259893,  -77.6295992],[43.1261468,  -77.6295831]], 'Science Quad');
    SQPB_SQPE = new Edge('path', 'SQPB_SQPE', null, false, false, false, false, true, 'move towards Goergen Hall', 'away from Goergen Hall', null, [[43.1259893,  -77.6295992],[-77.6295992,  -77.6294368]], 'Science Quad');
    SQPE_SQPF = new Edge('path', 'SQPE_SQPF', null, false, false, false, false, true, 'move towards Wilmot Hall', 'move away from Wilmot Hall towards Goergen Hall', null, [[43.1259919,  -77.6294368],[43.1259958,  -77.6293262]], 'Science Quad');
    SQPB_SQPG = new Edge('path', 'SQPB_SQPG', null, false, false, false, false, true, 'move across the science quad towards the plaza outside Carlson', 'move away from Carlson across the science quad', null, [[43.1259893,  -77.6295992],[43.1255987,  -77.6298828]], 'Science Quad');
    SQPB_SQPD = new Edge('path', 'SQPB_SQPD', null, false, false, false, false, true, 'move along the plaza outside of Wegmans', 'move along the plaza outside of Wegmans', null, [[43.1259893,  -77.6295992],[43.1259828,  -77.6298489]], 'Science Quad');
    SQPD_SQPM = new Edge('path', 'SQPD_SQPM', null, false, false, false, false, true, 'move along Wegmans hall towards the road', 'move away from the road alongside Wegmans', null, [[43.1259828,  -77.6298489],[43.1259977,  -77.6304611]], 'Science Quad');
    SQPM_SQPN = new Edge('path', 'SQPM_SQPN', null, false, false, false, false, true, 'move towards Hutchinson and Hylan', 'move away from Hutchinson and Hylan', null, [[43.1259977,  43.1259977],[43.1256953,  -77.6304892]], 'Science Quad');
    SQPG_SQPM = new Edge('path', 'SQPG_SQPM', null, false, false, false, false, true, 'move towards Hutchinson and Wegmans', 'move to the center of the science quad', null, [[43.1255987,  -77.6298828],[43.1259977,  -77.6304611]], 'Science Quad');
    SQPG_SQPH = new Edge('path', 'SQPG_SQPH', null, false, false, false, false, true, 'move towards Goergen Hall', 'move to the center of the science quad', null, [[43.1255987,  -77.6298828],[43.1254369,  -77.6295797]], 'Science Quad');
    SQPG_SQPJ = new Edge('path', 'SQPG_SQPJ', null, false, false, false, false, true, 'move to the plaza in front of Carlson', 'move to the center of the science quad', null, [[43.1255987,  -77.6298828],[43.1253521,  -77.6300949]], 'Science Quad');
    SQPJ_SQPK = new Edge('path', 'SQPJ_SQPK', null, false, false, false, false, true, 'cross the plaza to Hutchinson Hall', 'cross the plaza away from Hutchinson Hall', null, [[43.1253521,  -77.6300949],[43.1253461,  -77.6302926]], 'Science Quad');
    SQPK_SQPL = new Edge('path', 'SQPK_SQPL', null, false, false, false, false, true, 'move towards Hylan Hall', 'move away from Hylan Hall', null, [[43.1253461,  -77.6302926],[43.1254637,  -77.6302977]], 'Science Quad');
    SQPH_SQPI = new Edge('path', 'SQPH_SQPI', null, false, false, false, false, true, 'move alongside Goergen Hall', 'move alongside Goergen Hall', null, [[43.1254369,  -77.6295797],[43.1253716,  -77.6295797]], 'Science Quad');
    SQPI_SQPJ = new Edge('path', 'SQPI_SQPJ', null, false, false, false, false, true, 'move towards the plaza in front of Calson', 'move towards Goergen Hall', null, [[43.1253716,  -77.6295797],[43.1253521,  -77.6300949]], 'Science Quad');
    SQPI_SQPS = new Edge('path', 'SQPI_SQPS', null, false, false, false, false, true, 'move away from the science quad to a sidewalk intersection', 'move towards th science quad', null, [[43.1253716,  -77.6295797],[43.1250548,  -77.6295283]], 'Science Quad');
    SQPR_SQPS = new Edge('path', 'SQPR_SQPS', null, false, false, false, false, true, 'move towards the Computer Studies Building', 'move away from the Computer Studies Building', null, [[43.1249462,  -77.629303],[43.1250548,  -77.6295283]], 'Science Quad');
    SQPQ_SQPR = new Edge('path', 'SQPQ_SQPR', null, false, false, false, false, true, 'move alongside the road', 'move alongside the road', null, [[43.1248229,  -77.6294358],[43.1249462,  -77.629303]], 'Science Quad');
    SQPO_SQPQ = new Edge('path', 'SQPO_SQPQ', null, false, false, false, false, true, 'move alongside the road', 'move alongside the road', null, [[43.1245268,  -77.6299529],[43.1245541,  -77.6295628],[43.1248229,  -77.6294358]], 'Science Quad');
    SQPO_SQPP = new Edge('path', 'SQPO_SQPP', null, false, false, false, false, true, 'move alongside the road', 'move alongside the road', null, [[43.1245268,  -77.6299529],[43.1245118,  -77.6307332],[43.1245464,  -77.630828],[43.1245324,  -77.6312908]], 'Science Quad');
    SQPP_SQPT = new Edge('path', 'SQPP_SQPT', null, false, false, false, false, true, 'move alongside the road', 'move alongside the road', null, [[43.1245324,  -77.6312908],[43.1249057,  -77.6312599]], 'Science Quad');
    SQPT_SQPU = new Edge('path', 'SQPT_SQPU', null, false, false, false, false, true, 'move alongside the road', 'move alongside the road', null, [[43.1249057,  -77.6312599],[43.1259011,  -77.6312961]], 'Science Quad');
    SQPM_SQPU = new Edge('path', 'SQPM_SQPU', null, false, false, false, false, true, 'move alongside the road', 'move alongside the road', null, [[43.1259977,  -77.6304611],[43.125917,  -77.6307556],[43.1259011,  -77.6312961]], 'Science Quad');
    EQPQ_SQPV = new Edge('path', 'EQPQ_SQPV', null, false, false, false, false, true, 'move away from Hoyt towards the science quad', 'move away from the science quad towards Hoyt', null, [[43.1272868,  -77.6297036],[43.1271637,  -77.6296222],[43.126862,  -77.6296154]], 'Science Quad');
    EQPAB_SQPV = new Edge('path', 'EQPAB_SQPV', null, false, false, false, false, true, 'move alongside Gavette Hall', 'move alongside Gavette Hall', null, [[43.1269221,  -77.6294539],[43.126862,  -77.6296154]], 'Science Quad');
    GR01A_SQPE = new Edge('path', 'GR01A_SQPE', null, false, false, false, false, true, 'leave Goergen Hall', 'enter Goergen Hall', ['broken push door button entering Goergen from north side'], [[43.1258061,  -77.6293749],[43.1258582,  -77.6293776],[43.1258621,  -77.6294291],[43.1259919,  -77.6294368]], 'Science Quad');
    SQPF_WM01A = new Edge('path', 'SQPF_WM01A', null, false, false, false, false, true, 'enter Wilmot Hall', 'leave Wilmot Hall', ['broken push door button entering Wilmot Hall'], [[43.1259958,  -77.6293262],[43.1258751,  -77.6293226],[43.1258735,  -77.6292802]], 'Science Quad');
    GR01C_SQPH = new Edge('path', 'GR01C_SQPH', null, false, false, false, false, true, 'leave Goergen Hall', 'enter Goergen Hall', ['broken push door button entering Goergen from west side'], [[43.1254365,  -77.6295029],[43.1254369,  -77.6295797]], 'Science Quad');  
    GR01B_SQPR = new Edge('path', 'GR01B_SQPR', null, false, false, false, false, true, 'leave Goergen Hall', 'enter Goergen Hall', ['broken push door button entering Goergen from south side'], [[43.1253489,  -77.6292536],[43.1249462,  -77.629303]], 'Science Quad');  
    SQPO_SQPX = new Edge('path', 'SQPO_SQPX', null, false, false, false, false, true, 'move towards the connection between Carlson and Computer Studies', 'move away the connection between Carlson and Computer Studies', null, [[43.1245268,  -77.6299529],[43.1250235,  -77.6300425]], 'Science Quad');
    SQPJ_SQPX = new Edge('path', 'SQPJ_SQPX', null, false, false, false, false, true, 'move towards the connection between Carlson and Computer Studies', 'move away the connection between Carlson and Computer Studies', null, [[43.1253521,  -77.6300949],[43.1250235,  -77.6300425]], 'Science Quad');
    CS02A_SQPX = new Edge('path', 'CS02A_SQPX', null, false, false, false, false, true, 'leave the Computer Studies Building', 'enter the Computer Studies Buildings', ['broken push door button entering Computer Studies'], [[43.1250641,  -77.6300337],[43.1250235,  -77.6300425]], 'Science Quad');
    CL02A_SQPX = new Edge('path', 'CL02A_SQPX', null, false, false, false, false, true, 'leave Carlson library', 'enter Carlson library', ['broken push door button entering Carlson'], [[43.1250776,  -77.6300545],[43.1250235,  -77.6300425]], 'Science Quad');
    HL02A_SQPL = new Edge('path', 'HL02A_SQPL', null, false, false, false, false, true, 'leave Hylan Hall', 'enter Hylan Hall', ['broken push door button entering 2nd floor of Hylan'], [[43.1254836,  -77.6302968],[43.1254637,  -77.6302977]], 'Science Quad');
    SQPL_SQPY = new Edge('path', 'SQPL_SQPY', null, false, false, false, false, true, 'move towards Hutchinson Hall', 'move away from Hutchinson Hall', null, [[43.1254637,  -77.6302977],[43.1254583,  -77.6305065]], 'Science Quad');
    SQPY_SQPZ = new Edge('path', 'SQPY_SQPZ', null, false, false, false, false, true, 'go down the stairs between Hutchinson and Hylan Hall', 'go up the stairs between Hutchinson and Hylan Hall', null, [[43.1254583,  -77.6305065],[43.1255468,  -77.6304854]], 'Science Quad');
    SQPN_SQPZ = new Edge('path', 'SQPN_SQPZ', null, false, false, false, false, true, 'move away from Hutchinson Hall', 'move between Hutchinson and Hylan', null, [[43.1256953,  -77.6304892],[43.1255468,  -77.6304854]], 'Science Quad');
    HU01A_SQPZ = new Edge('path', 'HU01A_SQPZ', null, false, false, false, false, true, 'leave Hutchinson Hall', 'enter Hutcinson Hall', ['broken push door button entering 1st floor of Hutchinson'], [[43.1255878,  -77.6305419],[43.1255926,  -77.6304217]], 'Science Quad');
    HL01A_SQPZ = new Edge('path', 'HL01A_SQPZ', null, false, false, false, false, true, 'leave Hylan Hall', 'leave Hylan Hall', ['broken push door button entering 1st floor of Hylan'], [[43.1256953,  -77.6304892],[43.1255468,  -77.6304854]], 'Science Quad');
    GR01_WM01 = new Edge('connection', 'GR01_WM01', null, true, false, false, false, false, 'move from Goergen to Wilmot', 'move from Wilmot to Goergen', null, [[43.1256315,  -77.6292359]], 'Goergen/Wilmot');
    GR02_WM02 = new Edge('connection', 'GR02_WM02', null, true, false, false, false, false, 'move from Goergen to Wilmot', 'move from Wilmot to Goergen', null, [[43.1256315,  -77.6292359]], 'Goergen/Wilmot');
    GR03_WM03 = new Edge('connection', 'GR03_WM03', null, true, false, false, false, false, 'move from Goergen to Wilmot', 'move from Wilmot to Goergen', null, [[43.1256315,  -77.6292359]], 'Goergen/Wilmot');
    GR04_WM04 = new Edge('connection', 'GR04_WM04', null, true, false, false, false, false, 'move from Goergen to Wilmot', 'move from Wilmot to Goergen', null, [[43.1256315,  -77.6292359]], 'Goergen/Wilmot');
    GR05_WM05 = new Edge('connection', 'GR05_WM05', null, true, false, false, false, false, 'move from Goergen to Wilmot', 'move from Wilmot to Goergen', null, [[43.1256315,  -77.6292359]], 'Goergen/Wilmot');
    CS02_CS04 = new Edge('floor', 'CS02_CS04', 3, false, false, false, false, true, 'move from 2nd floor to 4th floor', 'move from 4th floor to 2nd floor', ['broken elevator in Computer Studies Building'], null, 'Computer Studies');
    CS02_CS05 = new Edge('floor', 'CS02_CS05', 4, false, false, false, false, true, 'move from 2nd floor to 5th floor', 'move from 5th floor to 2nd floor', ['broken elevator in Computer Studies Building'], null, 'Computer Studies');
    CS02_CS06 = new Edge('floor', 'CS02_CS06', 5, false, false, false, false, true, 'move from 2nd floor to 6th floor', 'move from 6th floor to 2nd floor', ['broken elevator in Computer Studies Building'], null, 'Computer Studies');
    CS02_CS07 = new Edge('floor', 'CS02_CS07', 6, false, false, false, false, true, 'move from 2nd floor to 7th floor', 'move from 7th floor to 2nd floor', ['broken elevator in Computer Studies Building'], null, 'Computer Studies');
    CL01_CL02 = new Edge('floor', 'CL01_CL02', 2, false, false, false, false, true, 'move from 1st floor to 2nd floor', 'move from 2nd floor to 1st floor', ['broken elevator in Carlson'], null, 'Carlson');
    CL01_CL03 = new Edge('floor', 'CL01_CL03', 3, false, false, false, false, true, 'move from 1st floor to 3rd floor', 'move from 3rd floor to 1st floor', ['broken elevator in Carlson'], null, 'Carlson');
    CL02_CL03 = new Edge('floor', 'CL02_CL03', 2, false, false, false, false, true, 'move from 2nd floor to 3rd floor', 'move from 3rd floor to 2nd floor', ['broken elevator in Carlson'], null, 'Carlson');
    GR01_GR02 = new Edge('floor', 'GR01_GR02', 2, false, false, false, false, true, 'move from 1st floor to 2nd floor', 'move from 2nd floor to 1st floor', ['broken elevator in Goergen'], null, 'Goergen');
    GR01_GR03 = new Edge('floor', 'GR01_GR03', 3, false, false, false, false, true, 'move from 1st floor to 3rd floor', 'move from 3rd floor to 1st floor', ['broken elevator in Goergen/Wilmot'], null, 'Goergen');
    GR01_GR04 = new Edge('floor', 'GR01_GR04', 4, false, false, false, false, true, 'move from 1st floor to 4th floor', 'move from 4th floor to 1st floor', ['broken elevator in Goergen/Wilmot'], null, 'Goergen');
    GR01_GR05 = new Edge('floor', 'GR01_GR05', 5, false, false, false, false, true, 'move from 1st floor to 5th floor', 'move from 5th floor to 1st floor', ['broken elevator in Goergen/Wilmot'], null, 'Goergen');
    GR02_GR03 = new Edge('floor', 'GR02_GR03', 2, false, false, false, false, true, 'move from 2nd floor to 3rd floor', 'move from 3rd floor to 2nd floor', ['broken elevator in Goergen/Wilmot'], null, 'Goergen');
    GR02_GR04 = new Edge('floor', 'GR02_GR04', 3, false, false, false, false, true, 'move from 2nd floor to 4th floor', 'move from 4th floor to 2nd floor', ['broken elevator in Goergen/Wilmot'], null, 'Goergen');
    GR02_GR05 = new Edge('floor', 'GR02_GR05', 4, false, false, false, false, true, 'move from 2nd floor to 5th floor', 'move from 5th floor to 2nd floor', ['broken elevator in Goergen/Wilmot'], null, 'Goergen');
    WM01_WM02 = new Edge('floor', 'WM01_WM02', 2, false, false, false, false, true, 'move from 1st floor to 2nd floor', 'move from 2nd floor to 1st floor', ['broken elevator in Goergen/Wilmot'], null, 'Wilmot');
    WM01_WM03 = new Edge('floor', 'WM01_WM03', 3, false, false, false, false, true, 'move from 1st floor to 3rd floor', 'move from 3rd floor to 1st floor', ['broken elevator in Goergen/Wilmot'], null, 'Wilmot');
    WM01_WM04 = new Edge('floor', 'WM01_WM04', 4, false, false, false, false, true, 'move from 1st floor to 4th floor', 'move from 4th floor to 1st floor', ['broken elevator in Goergen/Wilmot'], null, 'Wilmot');
    WM01_WM05 = new Edge('floor', 'WM01_WM05', 5, false, false, false, false, true, 'move from 1st floor to 5th floor', 'move from 5th floor to 1st floor', ['broken elevator in Goergen/Wilmot'], null, 'Wilmot');
    CS02_CS02A = new Edge('level', 'CS02_CS02A', 1, false, false, false, false, true, null, null, null, null, 'Computer Studies');      
    CL01_CL01A = new Edge('level', 'CL01_CL01A', 1, false, false, false, false, true, null, null, null, null, 'Carlson');
    CL01_CL01B = new Edge('level', 'CL01_CL01B', 1, false, false, false, false, true, null, null, null, null, 'Carlson');
    CL01_CL01C = new Edge('level', 'CL01_CL01C', 1, false, false, false, false, true, null, null, null, null, 'Carlson');
    CL02_CL02A = new Edge('level', 'CL02_CL02A', 1, false, false, false, false, true, null, null, null, null, 'Carlson');
    CL03_CL03A = new Edge('level', 'CL03_CL03A', 1, false, false, false, false, true, null, null, null, null, 'Carlson');
    GR01_GR01A = new Edge('level', 'GR01_GR01A', 1, false, false, false, false, true, null, null, null, null, 'Goergen');
    GR01_GR01B = new Edge('level', 'GR01_GR01B', 1, false, false, false, false, true, null, null, null, null, 'Goergen');
    GR01_GR01C = new Edge('level', 'GR01_GR01C', 1, false, false, false, false, true, null, null, null, null, 'Goergen');
    GR02_GR02A = new Edge('level', 'GR02_GR02A', 1, false, false, false, false, true, null, null, null, null, 'Goergen');
    WM01_WM01A = new Edge('level', 'WM01_WM01A', 1, false, false, false, false, true, null, null, null, null, 'Wilmot');

    var all_edges = [BR00_BR02, BR00_BR03, BR01_BR02, BR01_BR03, BR00_BR00A, BR01_BR01A, BR01_BR01B, BR01_BR01C, RT01_RT02, RT01_RT03, RT02_RT03, RT01_RT01A, RT01_RT01B, RT01_RT01C, MRG_MR01, MRG_MR02, MRG_MR03, MRG_MR04, MRG_MR05, MR01_MR02, MR01_MR03, MR01_MR04, MR01_MR05, MR02_MR03, MR02_MR04, MR02_MR05, MR03_MR04, MR03_MR05, MR02_MR02A, MR03_MR03A, MR03_MR03B, MR03_MR03C, MRG_RT01, MR01_RT01, MR02_RT02, MR03_RT03, RRG_RR01, RRG_RR02, RRG_RR03, RRG_RR04, RR01_RR02, RR01_RR03, RR01_RR04, RRG_RRGA, RRG_RRGB, RRG_RRGC, RR01_RR01A, RR01_RR01B, MR02A_RRGC, EQPC_MR03A, EQPB_MR03B, EQPA_MR03C, EQPA_EQPB, EQPB_EQPC, EQPD_RR01B, EQPD_EQPE, EQPD_EQPF, EQPC_EQPE, EQPB_EQPG, EQPF_EQPG, BR01A_WQPB, BR01B_WQPB, BR01B_WQPA, BR01C_WQPA, WQPA_WQPB, WQPA_WQPE, WQPB_WQPD, WQPE_WQPF, WQPC_WQPD, WQPC_WQPF, WQPC_WQPG, WQPG_WQPH, RT01A_WQPG, RT01C_WQPH, BL01_BL02, BL01_BL03, BL01_BL04, BL01_BL05, BL02_BL03, BL02_BL04, BL02_BL05, BL01_BL01A, BL01_BL01B, BL01_BL01C, BL02_BL02A, DWB_DW01, DW01_DW02, DW01_DW03, DW01_DW04, DW01_DW05, DW02_DW03, DW02_DW04, DW02_DW05, DW01_DW01A, DW01_DW01B, DW01_DW01C, DW01_DW01D, DW02_DW02A, HT01_HT02, HT01_HT01A, HT01_HT01B, HT01_HT01C, HT01_HT01D, HT01_HT01E, HT01_HT01F, HT02_HT02A, LT01_LT02, LT01_LT03, LT01_LT04, LT01_LT05, LT02_LT03, LT02_LT04, LT02_LT05, LT03_LT04, LT03_LT05, LT01_LT01A, LT02_LT02A, LT03_LT03A, IF01_IF02, IF01_IF03, IF02_IF03, IF01_IF01A, IF01_IF01B, IF03_IF03A, EQPJ_LT03A, EQPO_LT02A, EQPO_MR02B, EQPO_EQPP, EQPH_EQPI, EQPA_EQPI, EQPG_EQPH, EQPI_EQPJ, EQPH_EQPK, EQPJ_EQPN, EQPK_EQPL, EQPJ_EQPK, EQPM_EQPN, EQPL_EQPM, EQPM_IF03A, BL02A_EQPG, DW02A_EQPK, EQPG_EQPJ, EQPB_EQPK, EQPB_EQPD, EQPD_EQPG, EQPJ_EQPM, EQPK_EQPM, EQPP_HT01A, EQPR_HT01B, EQPQ_HT01E, EQPQ_HT01F, EQPR_HT02A, EQPQ_HT02A, BL01A_RRGB, BL01B_EQPR, BL01C_EQPP, DW01A_EQPP, DW01B_EQPQ, ML01_ML02, ML01_ML03, ML02_ML03, ML02_ML04, ML03_ML04, ML02_ML02A, ML02_ML02B, ML03_ML03A, ML03_ML03B, EQPAB_EQPQ, EQPAA_EQPR, EQPAA_EQPAB, EQPAA_EQPZ, EQPS_EQPT, EQPS_EQPZ, EQPS_EQPV, EQPU_EQPV, EQPV_EQPW, EQPW_EQPY, EQPU_EQPX, EQPU_EQPY, EQPX_EQPAE, EQPAC_EQPAE, EQPT_ML03B, EQPAC_ML02B, EQPAD_ML03A, EQPX_EQPY, EQPF_EQPV, EQPF_EQPW, EQPAF_RRGA, EQPAF_EQPY, EQPAE_EQPT, ML02A_RRGB, BL01A_ML02A, DG01_DG02, DG01_DG03, DG01_DG04, DG02_DG03, DG02_DG04, DG03_DG04, DG01_DG01A, DG02_DG02A, DG02_DG02B, DG02_DG02C, DG03_DG03A, WC01_WC02, WC01_WC03, WC01_WC04, WC01_WC05, WC02_WC03, WC02_WC04, WC02_WC05, WC03_WC04, WC03_WC05, WC04_WC05, WC02_WC02A, WC02_WC02B, WC03_WC03A, WC03_WC03B, WC04_WC04A, DG02C_WC03A, RRGC_WC03B, DG03A_RR01A, HUB_HU01, HU01_HU02, HU01_HU03, HU01_HU04, HU02_HU03, HU02_HU04, HL01_HL02, HL01_HL03, HL01_HL04, HL01_HL05, HL01_HL06, HL01_HL07, HL01_HL08, HL01_HL09, HL01_HL10, HL01_HL11, HL02_HL03, HL02_HL04, HL02_HL05, HL02_HL06, HL02_HL07, HL02_HL08, HL02_HL09, HL02_HL10, HL02_HL11, HU01_HU01A, HU02_HU02A, HL01_HL01A, HL02_HL02A, SQPA_SQPW, SQPV_SQPW, SQPA_SQPC, SQPB_SQPC, SQPB_SQPE, SQPE_SQPF, SQPB_SQPG, SQPB_SQPD, SQPD_SQPM, SQPM_SQPN, SQPG_SQPM, SQPG_SQPH, SQPG_SQPJ, SQPJ_SQPK, SQPK_SQPL, SQPH_SQPI, SQPI_SQPJ, SQPI_SQPS, SQPR_SQPS, SQPQ_SQPR, SQPO_SQPQ, SQPO_SQPP, SQPP_SQPT, SQPT_SQPU, SQPM_SQPU, EQPQ_SQPV, EQPAB_SQPV, GR01A_SQPE, SQPF_WM01A, GR01C_SQPH, GR01B_SQPR, SQPO_SQPX, SQPJ_SQPX, CS02A_SQPX, CL02A_SQPX, HL02A_SQPL, SQPL_SQPY, SQPY_SQPZ, SQPN_SQPZ, HU01A_SQPZ, HL01A_SQPZ, GR01_WM01, GR02_WM02, GR03_WM03, GR04_WM04, GR05_WM05, CS02_CS04, CS02_CS05, CS02_CS06, CS02_CS07, CL01_CL02, CL01_CL03, CL02_CL03, GR01_GR02, GR01_GR03, GR01_GR04, GR01_GR05, GR02_GR03, GR02_GR04, GR02_GR05, WM01_WM02, WM01_WM03, WM01_WM04, WM01_WM05, CS02_CS02A, CL01_CL01A, CL01_CL01B, CL01_CL01C, CL02_CL02A, CL03_CL03A, GR01_GR01A, GR01_GR01B, GR01_GR01C, GR02_GR02A, WM01_WM01A]
    var edges_find_lengths = [MR02A_RRGC, EQPC_MR03A, EQPB_MR03B, EQPA_MR03C, EQPA_EQPB, EQPB_EQPC, EQPD_RR01B, EQPD_EQPE, EQPD_EQPF, EQPC_EQPE, EQPB_EQPG, EQPF_EQPG, BR01A_WQPB, BR01B_WQPB, BR01B_WQPA, BR01C_WQPA, WQPA_WQPB, WQPA_WQPE, WQPB_WQPD, WQPE_WQPF, WQPC_WQPD, WQPC_WQPF, WQPC_WQPG, WQPG_WQPH, RT01A_WQPG, RT01C_WQPH, EQPJ_LT03A, EQPO_LT02A, EQPO_MR02B, EQPO_EQPP, EQPH_EQPI, EQPA_EQPI, EQPG_EQPH, EQPI_EQPJ, EQPH_EQPK, EQPJ_EQPN, EQPK_EQPL, EQPJ_EQPK, EQPM_EQPN, EQPL_EQPM, EQPM_IF03A, BL02A_EQPG, DW02A_EQPK, EQPG_EQPJ, EQPB_EQPK, EQPB_EQPD, EQPD_EQPG, EQPJ_EQPM, EQPK_EQPM, EQPP_HT01A, EQPR_HT01B, EQPQ_HT01E, EQPQ_HT01F, EQPR_HT02A, EQPQ_HT02A, BL01A_RRGB, BL01B_EQPR, BL01C_EQPP, DW01A_EQPP, DW01B_EQPQ, EQPAB_EQPQ, EQPAA_EQPR, EQPAA_EQPAB, EQPAA_EQPZ, EQPS_EQPT, EQPS_EQPZ, EQPS_EQPV, EQPU_EQPV, EQPV_EQPW, EQPW_EQPY, EQPU_EQPX, EQPU_EQPY, EQPX_EQPAE, EQPAC_EQPAE, EQPT_ML03B, EQPAC_ML02B, EQPAD_ML03A, EQPX_EQPY, EQPF_EQPV, EQPF_EQPW, EQPAF_RRGA, EQPAF_EQPY, EQPAE_EQPT, ML02A_RRGB, BL01A_ML02A, DG02C_WC03A, RRGC_WC03B, DG03A_RR01A, SQPA_SQPW, SQPV_SQPW, SQPA_SQPC, SQPB_SQPC, SQPB_SQPE, SQPE_SQPF, SQPB_SQPG, SQPB_SQPD, SQPD_SQPM, SQPM_SQPN, SQPG_SQPM, SQPG_SQPH, SQPG_SQPJ, SQPJ_SQPK, SQPK_SQPL, SQPH_SQPI, SQPI_SQPJ, SQPI_SQPS, SQPR_SQPS, SQPQ_SQPR, SQPO_SQPQ, SQPO_SQPP, SQPP_SQPT, SQPT_SQPU, SQPM_SQPU, EQPQ_SQPV, EQPAB_SQPV, GR01A_SQPE, SQPF_WM01A, GR01C_SQPH, GR01B_SQPR, SQPO_SQPX, SQPJ_SQPX, CS02A_SQPX, CL02A_SQPX, HL02A_SQPL, SQPL_SQPY, SQPY_SQPZ, SQPN_SQPZ, HU01A_SQPZ, HL01A_SQPZ, GR01_WM01, GR02_WM02, GR03_WM03, GR04_WM04, GR05_WM05]

    edges_find_lengths.forEach(edge => {edge.findLength()});

    // define nodes
    BR00A = new Node('Burton', '0', 'BR00A', [BR00_BR00A], 'entrance', [43.1293665, -77.6313923], Math.min(), []);
    BR01A = new Node('Burton', '1', 'BR01A', [BR01_BR01A, BR01A_WQPB], 'entrance', [43.129296, -77.6311965], Math.min(), []);
    BR01B = new Node('Burton', '1', 'BR01B', [BR01_BR01B, BR01B_WQPB, BR01B_WQPA], 'entrance', [43.1292627, -77.6313306], Math.min(), []);
    BR01C = new Node('Burton', '1', 'BR01C', [BR01_BR01C, BR01C_WQPA], 'entrance', [43.129204, -77.6314433], Math.min(), []);
    BR00 = new Node('Burton', '0', 'BR00', [BR00_BR02, BR00_BR03, BR00_BR00A], 'floor', [, ], Math.min(), []);
    BR01 = new Node('Burton', '1', 'BR01', [BR01_BR02, BR01_BR03, BR01_BR01A, BR01_BR01B, BR01_BR01C], 'floor', [, ], Math.min(), []);  
    BR02 = new Node('Burton', '2', 'BR02', [BR00_BR02, BR01_BR02], 'floor', [, ], Math.min(), []);
    BR03 = new Node('Burton', '3', 'BR03', [BR00_BR03, BR01_BR03], 'floor', [, ], Math.min(), []);
    RT01A = new Node('Rettner', '1', 'RT01A', [RT01_RT01A, RT01A_WQPG], 'entrance', [43.1286775, -77.630216], Math.min(), []);
    RT01B = new Node('Rettner', '1', 'RT01B', [RT01_RT01B], 'entrance', [43.1284505, -77.6299049], Math.min(), []);
    RT01C = new Node('Rettner', '1', 'RT01C', [RT01_RT01C, RT01C_WQPH], 'entrance', [43.1283643, -77.6301248], Math.min(), []);
    RT01 = new Node('Rettner', '1', 'RT01', [RT01_RT02, RT01_RT03, RT01_RT01A, RT01_RT01B, RT01_RT01C, MRG_RT01, MR01_RT01], 'floor', [, ], Math.min(), []);
    RT02 = new Node('Rettner', '2', 'RT02', [RT01_RT02, RT02_RT03, MR02_RT02], 'floor', [, ], Math.min(), []);
    RT03 = new Node('Rettner', '3', 'RT03', [RT01_RT03, RT02_RT03, MR03_RT03], 'floor', [, ], Math.min(), []);
    MR02A = new Node('Morey', '2', 'MR02A', [MR02_MR02A, MR02A_RRGC], 'entrance', [43.1284964, -77.6293734], Math.min(), []);
    MR02B = new Node('Morey', '2', 'MR02B', [EQPO_MR02B], 'entrance', [43.128263, -77.6300103], Math.min(), []);
    MR03A = new Node('Morey', '3', 'MR03A', [MR03_MR03A, EQPC_MR03A], 'entrance', [43.1284459, -77.6294641], Math.min(), []);
    MR03B = new Node('Morey', '3', 'MR03B', [MR03_MR03B, EQPB_MR03B], 'entrance', [43.1283587, -77.6296534], Math.min(), []);
    MR03C = new Node('Morey', '3', 'MR03C', [MR03_MR03C, EQPA_MR03C], 'entrance', [43.1283023, -77.6298476], Math.min(), []);
    MRG = new Node('Morey', 'G', 'MRG', [MRG_MR01, MRG_MR02, MRG_MR03, MRG_MR04, MRG_MR05, MRG_RT01], 'floor', [, ], Math.min(), []);   
    MR01 = new Node('Morey', '1', 'MR01', [MRG_MR01, MR01_MR02, MR01_MR03, MR01_MR04, MR01_MR05, MR01_RT01], 'floor', [, ], Math.min(), []);
    MR02 = new Node('Morey', '2', 'MR02', [MRG_MR02, MR01_MR02, MR02_MR03, MR02_MR04, MR02_MR05, MR02_MR02A, MR02_RT02], 'floor', [, ], Math.min(), []);
    MR03 = new Node('Morey', '3', 'MR03', [MRG_MR03, MR01_MR03, MR02_MR03, MR03_MR04, MR03_MR05, MR03_MR03A, MR03_MR03B, MR03_MR03C, MR03_RT03], 'floor', [, ], Math.min(), []);
    MR04 = new Node('Morey', '4', 'MR04', [MRG_MR04, MR01_MR04, MR02_MR04, MR03_MR04], 'floor', [, ], Math.min(), []);
    MR05 = new Node('Morey', '5', 'MR05', [MRG_MR05, MR01_MR05, MR02_MR05, MR03_MR05], 'floor', [, ], Math.min(), []);
    RRGA = new Node('Rush Rhees', 'G', 'RRGA', [RRG_RRGA, EQPAF_RRGA], 'entrance', [43.1287284, -77.6279537], Math.min(), []);
    RRGB = new Node('Rush Rhees', 'G', 'RRGB', [RRG_RRGB, BL01A_RRGB, ML02A_RRGB], 'entrance', [43.1281014, -77.6287809], Math.min(), []);
    RRGC = new Node('Rush Rhees', 'G', 'RRGC', [RRG_RRGC, MR02A_RRGC, RRGC_WC03B], 'entrance', [43.1285151, -77.6290934], Math.min(), []);
    RR01A = new Node('Rush Rhees', '1', 'RR01A', [RR01_RR01A, DG03A_RR01A], 'entrance', [43.128743, -77.6286939], Math.min(), []);      
    RR01B = new Node('Rush Rhees', '1', 'RR01B', [RR01_RR01B, EQPD_RR01B], 'entrance', [43.1283107, -77.6289446], Math.min(), []);      
    RRG = new Node('Rush Rhees', 'G', 'RRG', [RRG_RR01, RRG_RR02, RRG_RR03, RRG_RR04, RRG_RRGA, RRG_RRGB, RRG_RRGC], 'floor', [, ], Math.min(), []);
    RR01 = new Node('Rush Rhees', '1', 'RR01', [RRG_RR01, RR01_RR02, RR01_RR03, RR01_RR04, RR01_RR01A, RR01_RR01B], 'floor', [, ], Math.min(), []);
    RR02 = new Node('Rush Rhees', '2', 'RR02', [RRG_RR02, RR01_RR02], 'floor', [, ], Math.min(), []);
    RR03 = new Node('Rush Rhees', '3', 'RR03', [RRG_RR03, RR01_RR03], 'floor', [, ], Math.min(), []);
    RR04 = new Node('Rush Rhees', '4', 'RR04', [RRG_RR04, RR01_RR04], 'floor', [, ], Math.min(), []);
    EQPA = new Node('Eastman Quad', null, 'EQPA', [EQPA_MR03C, EQPA_EQPB, EQPA_EQPI], 'intersection', [43.1282524, -77.6298131], Math.min(), []);
    EQPB = new Node('Eastman Quad', null, 'EQPB', [EQPB_MR03B, EQPA_EQPB, EQPB_EQPC, EQPB_EQPG, EQPB_EQPK, EQPB_EQPD], 'intersection', [43.1283214, -77.6296242], Math.min(), []);
    EQPC = new Node('Eastman Quad', null, 'EQPC', [EQPC_MR03A, EQPB_EQPC, EQPC_EQPE], 'intersection', [43.1283983, -77.6294316], Math.min(), []);
    EQPD = new Node('Eastman Quad', null, 'EQPD', [EQPD_RR01B, EQPD_EQPE, EQPD_EQPF, EQPB_EQPD, EQPD_EQPG], 'intersection', [43.1282604, -77.6290755], Math.min(), []);
    EQPE = new Node('Eastman Quad', null, 'EQPE', [EQPD_EQPE, EQPC_EQPE], 'intersection', [43.1284752, -77.6292172], Math.min(), []);   
    EQPF = new Node('Eastman Quad', null, 'EQPF', [EQPD_EQPF, EQPF_EQPG, EQPF_EQPV, EQPF_EQPW], 'intersection', [43.1280535, -77.6289301], Math.min(), []);
    EQPG = new Node('Eastman Quad', null, 'EQPG', [EQPB_EQPG, EQPF_EQPG, EQPG_EQPH, BL02A_EQPG, EQPG_EQPJ, EQPD_EQPG], 'intersection', [43.1279103, -77.6293189], Math.min(), []);
    WQPA = new Node('Wilson Quad', null, 'WQPA', [BR01B_WQPA, BR01C_WQPA, WQPA_WQPB, WQPA_WQPE], 'intersection', [43.1291189, -77.6313241], Math.min(), []);
    WQPB = new Node('Wilson Quad', null, 'WQPB', [BR01A_WQPB, BR01B_WQPB, WQPA_WQPB, WQPB_WQPD], 'intersection', [43.1291711, -77.6311815], Math.min(), []);
    WQPC = new Node('Wilson Quad', null, 'WQPC', [WQPC_WQPD, WQPC_WQPF, WQPC_WQPG], 'intersection', [43.1289216, -77.6306342], Math.min(), []);
    WQPD = new Node('Wilson Quad', null, 'WQPD', [WQPB_WQPD, WQPC_WQPD], 'intersection', [43.1292818, -77.6308716], Math.min(), []);    
    WQPE = new Node('Wilson Quad', null, 'WQPE', [WQPA_WQPE, WQPE_WQPF], 'intersection', [43.1290393, -77.6315472], Math.min(), []);    
    WQPF = new Node('Wilson Quad', null, 'WQPF', [WQPE_WQPF, WQPC_WQPF], 'intersection', [43.1286759, -77.6312982], Math.min(), []);    
    WQPG = new Node('Wilson Quad', null, 'WQPG', [WQPC_WQPG, WQPG_WQPH, RT01A_WQPG], 'intersection', [43.1285042, -77.6303344], Math.min(), []);
    WQPH = new Node('Wilson Quad', null, 'WQPH', [WQPG_WQPH, RT01C_WQPH], 'intersection', [43.1283342, -77.6302145], Math.min(), []);   
    BL01 = new Node('Bausch & Lomb', '1', 'BL01', [BL01_BL02, BL01_BL03, BL01_BL04, BL01_BL05, BL01_BL01A, BL01_BL01B, BL01_BL01C], 'floor', [, ], Math.min(), []);
    BL02 = new Node('Bausch & Lomb', '2', 'BL02', [BL01_BL02, BL02_BL03, BL02_BL04, BL02_BL05, BL02_BL02A], 'floor', [, ], Math.min(), []);
    BL03 = new Node('Bausch & Lomb', '3', 'BL03', [BL01_BL03, BL02_BL03], 'floor', [, ], Math.min(), []);
    BL04 = new Node('Bausch & Lomb', '4', 'BL04', [BL01_BL04, BL02_BL04], 'floor', [, ], Math.min(), []);
    BL05 = new Node('Bausch & Lomb', '5', 'BL05', [BL01_BL05, BL02_BL05], 'floor', [, ], Math.min(), []);
    BL01A = new Node('Bausch & Lomb', '1', 'BL01A', [BL01_BL01A, BL01A_RRGB, BL01A_ML02A], 'entrance', [43.1277064, -77.6296434], Math.min(), []);
    BL01B = new Node('Bausch & Lomb', '1', 'BL01B', [BL01_BL01B, BL01B_EQPR], 'entrance', [43.1279416, -77.6290303], Math.min(), []);   
    BL01C = new Node('Bausch & Lomb', '1', 'BL01C', [BL01_BL01C, BL01C_EQPP], 'entrance', [43.1274095, -77.6291748], Math.min(), []);   
    BL02A = new Node('Bausch & Lomb', '2', 'BL02A', [BL02_BL02A, BL02A_EQPG], 'entrance', [43.1278652, -77.6292931], Math.min(), []);   
    DWB = new Node('Dewey', 'B', 'DWB', [DWB_DW01], 'floor', [, ], Math.min(), []);
    DW01 = new Node('Dewey', '1', 'DW01', [DWB_DW01, DW01_DW02, DW01_DW03, DW01_DW04, DW01_DW05, DW01_DW01A, DW01_DW01B, DW01_DW01C, DW01_DW01D], 'floor', [, ], Math.min(), []);
    DW02 = new Node('Dewey', '2', 'DW02', [DW01_DW02, DW02_DW03, DW02_DW04, DW02_DW05, DW02_DW02A], 'floor', [, ], Math.min(), []);     
    DW03 = new Node('Dewey', '3', 'DW03', [DW01_DW03, DW02_DW03], 'floor', [, ], Math.min(), []);
    DW04 = new Node('Dewey', '4', 'DW04', [DW01_DW04, DW02_DW04], 'floor', [, ], Math.min(), []);
    DW05 = new Node('Dewey', '5', 'DW05', [DW01_DW05, DW02_DW05], 'floor', [, ], Math.min(), []);
    DW01A = new Node('Dewey', '1', 'DW01A', [DW01_DW01A, DW01A_EQPP], 'entrance', [43.1276196, -77.6298712], Math.min(), []);
    DW01B = new Node('Dewey', '1', 'DW01B', [DW01_DW01B, DW01B_EQPQ], 'entrance', [43.1272197, -77.629882], Math.min(), []);
    DW01C = new Node('Dewey', '1', 'DW01C', [DW01_DW01C], 'entrance', [43.1268608, -77.6297776], Math.min(), []);
    DW01D = new Node('Dewey', '1', 'DW01D', [DW01_DW01D], 'entrance', [43.1272231, -77.6302223], Math.min(), []);
    DW02A = new Node('Dewey', '2', 'DW02A', [DW02_DW02A, DW02A_EQPK], 'entrance', [43.1275255, -77.6302473], Math.min(), []);
    HT01 = new Node('Hoyt', '1', 'HT01', [HT01_HT02, HT01_HT01A, HT01_HT01B, HT01_HT01C, HT01_HT01D, HT01_HT01E, HT01_HT01F], 'floor', [, ], Math.min(), []);
    HT02 = new Node('Hoyt', '2', 'HT02', [HT01_HT02, HT02_HT02A], 'floor', [, ], Math.min(), []);
    HT01A = new Node('Hoyt', '1', 'HT01A', [HT01_HT01A, EQPP_HT01A], 'entrance', [43.1274836, -77.629653], Math.min(), []);
    HT01B = new Node('Hoyt', '1', 'HT01B', [HT01_HT01B, EQPR_HT01B], 'entrance', [43.127635, -77.6296616], Math.min(), []);
    HT01C = new Node('Hoyt', '1', 'HT01C', [HT01_HT01C], 'entrance', [43.1273452, -77.6294097], Math.min(), []);
    HT01D = new Node('Hoyt', '1', 'HT01D', [HT01_HT01D], 'entrance', [43.1272815, -77.6296], Math.min(), []);
    HT01E = new Node('Hoyt', '1', 'HT01E', [HT01_HT01E, EQPQ_HT01E], 'entrance', [43.1274348, -77.629703], Math.min(), []);
    HT01F = new Node('Hoyt', '1', 'HT01F', [HT01_HT01F, EQPQ_HT01F], 'entrance', [43.1274637, -77.6296951], Math.min(), []);
    HT02A = new Node('Hoyt', '2', 'HT02A', [HT02_HT02A, EQPR_HT02A, EQPQ_HT02A], 'entrance', [43.1276141, -77.6297259], Math.min(), []);
    LT01 = new Node('Lattimore', '1', 'LT01', [LT01_LT02, LT01_LT03, LT01_LT04, LT01_LT05, LT01_LT01A], 'floor', [, ], Math.min(), []); 
    LT02 = new Node('Lattimore', '2', 'LT02', [LT01_LT02, LT02_LT03, LT02_LT04, LT02_LT05, LT02_LT02A], 'floor', [, ], Math.min(), []); 
    LT03 = new Node('Lattimore', '3', 'LT03', [LT01_LT03, LT02_LT03, LT03_LT04, LT03_LT05, LT03_LT03A], 'floor', [, ], Math.min(), []); 
    LT04 = new Node('Lattimore', '4', 'LT04', [LT01_LT04, LT02_LT04, LT03_LT04], 'floor', [, ], Math.min(), []);
    LT05 = new Node('Lattimore', '5', 'LT05', [LT01_LT05, LT02_LT05, LT03_LT05], 'floor', [, ], Math.min(), []);
    LT01A = new Node('Lattimore', '1', 'LT01A', [LT01_LT01A], 'entrance', [43.1280781, -77.6308432], Math.min(), []);
    LT02A = new Node('Lattimore', '2', 'LT02A', [LT02_LT02A, EQPO_LT02A], 'entrance', [43.1281765, -77.6302765], Math.min(), []);       
    LT03A = new Node('Lattimore', '3', 'LT03A', [LT03_LT03A, EQPJ_LT03A], 'entrance', [43.1280116, -77.6305737], Math.min(), []);       
    IF01 = new Node('Interfaith Chapel', '1', 'IF01', [IF01_IF02, IF01_IF03, IF01_IF01A, IF01_IF01B], 'floor', [, ], Math.min(), []);   
    IF02 = new Node('Interfaith Chapel', '2', 'IF02', [IF01_IF02, IF02_IF03], 'floor', [, ], Math.min(), []);
    IF03 = new Node('Interfaith Chapel', '3', 'IF03', [IF01_IF03, IF02_IF03, IF03_IF03A], 'floor', [, ], Math.min(), []);
    IF01A = new Node('Interfaith Chapel', '1', 'IF01A', [IF01_IF01A], 'entrance', [43.126896, -77.6323981], Math.min(), []);
    IF01B = new Node('Interfaith Chapel', '1', 'IF01B', [IF01_IF01B], 'entrance', [43.1270725, -77.632517], Math.min(), []);
    IF03A = new Node('Interfaith Chapel', '3', 'IF03A', [IF03_IF03A, EQPM_IF03A], 'entrance', [43.1270898, -77.6321881], Math.min(), []);
    EQPH = new Node('Eastman Quad', null, 'EQPH', [EQPH_EQPI, EQPG_EQPH, EQPH_EQPK], 'intersection', [43.127733, -77.6297917], Math.min(), []);
    EQPI = new Node('Eastman Quad', null, 'EQPI', [EQPH_EQPI, EQPA_EQPI, EQPI_EQPJ], 'intersection', [43.1281471, -77.6300906], Math.min(), []);
    EQPJ = new Node('Eastman Quad', null, 'EQPJ', [EQPJ_LT03A, EQPI_EQPJ, EQPJ_EQPN, EQPJ_EQPK, EQPG_EQPJ, EQPJ_EQPM], 'intersection', [43.1279743, -77.630548], Math.min(), []);
    EQPK = new Node('Eastman Quad', null, 'EQPK', [EQPH_EQPK, EQPK_EQPL, EQPJ_EQPK, DW02A_EQPK, EQPB_EQPK, EQPK_EQPM], 'intersection', [43.1275533, -77.6302701], Math.min(), []);
    EQPL = new Node('Eastman Quad', null, 'EQPL', [EQPK_EQPL, EQPL_EQPM], 'intersection', [43.12735, -77.6308183], Math.min(), []);     
    EQPM = new Node('Eastman Quad', null, 'EQPM', [EQPM_EQPN, EQPL_EQPM, EQPM_IF03A, EQPJ_EQPM, EQPK_EQPM], 'intersection', [43.1275608, -77.6309685], Math.min(), []);
    EQPN = new Node('Eastman Quad', null, 'EQPN', [EQPJ_EQPN, EQPM_EQPN], 'intersection', [43.1277695, -77.6311172], Math.min(), []);   
    EQPO = new Node('Eastman Quad', null, 'EQPO', [EQPO_LT02A, EQPO_MR02B, EQPO_EQPP], 'intersection', [43.1282065, -77.6301582], Math.min(), []);
    EQPP = new Node('Eastman Quad', null, 'EQPP', [EQPO_EQPP, EQPP_HT01A, BL01C_EQPP, DW01A_EQPP], 'intersection', [43.1276582, -77.6297745], Math.min(), []);
    EQPQ = new Node('Eastman Quad', null, 'EQPQ', [EQPQ_HT01E, EQPQ_HT01F, EQPQ_HT02A, DW01B_EQPQ, EQPAB_EQPQ, EQPQ_SQPV], 'intersection', [43.1272868, -77.6297036], Math.min(), []);
    EQPR = new Node('Eastman Quad', null, 'EQPR', [EQPR_HT01B, EQPR_HT02A, BL01B_EQPR, EQPAA_EQPR], 'intersection', [43.1273606, -77.6293079], Math.min(), []);
    ML01 = new Node('Meliora', '1', 'ML01', [ML01_ML02, ML01_ML03], 'floor', [, ], Math.min(), []);
    ML02 = new Node('Meliora', '2', 'ML02', [ML01_ML02, ML02_ML03, ML02_ML04, ML02_ML02A, ML02_ML02B], 'floor', [, ], Math.min(), []);  
    ML03 = new Node('Meliora', '3', 'ML03', [ML01_ML03, ML02_ML03, ML03_ML04, ML03_ML03A, ML03_ML03B], 'floor', [, ], Math.min(), []);  
    ML04 = new Node('Meliora', '4', 'ML04', [ML02_ML04, ML03_ML04], 'floor', [, ], Math.min(), []);
    ML02A = new Node('Meliora', '2', 'ML02A', [ML02_ML02A, ML02A_RRGB, BL01A_ML02A], 'entrance', [43.1277552, -77.6287196], Math.min(), []);
    ML02B = new Node('Meliora', '2', 'ML02B', [ML02_ML02B, EQPAC_ML02B], 'entrance', [43.1274581, -77.6282562], Math.min(), []);        
    ML03A = new Node('Meliora', '3', 'ML03A', [ML03_ML03A, EQPAD_ML03A], 'entrance', [43.1278794, -77.6283018], Math.min(), []);        
    ML03B = new Node('Meliora', '3', 'ML03B', [ML03_ML03B, EQPT_ML03B], 'entrance', [43.1276646, -77.6279163], Math.min(), []);
    EQPS = new Node('Eastman Quad', null, 'EQPS', [EQPS_EQPT, EQPS_EQPZ, EQPS_EQPV], 'intersection', [43.1274348, -77.6285361], Math.min(), []);
    EQPT = new Node('Eastman Quad', null, 'EQPT', [EQPS_EQPT, EQPT_ML03B, EQPAE_EQPT], 'intersection', [43.127614, -77.6278789], Math.min(), []);
    EQPU = new Node('Eastman Quad', null, 'EQPU', [EQPU_EQPV, EQPU_EQPX, EQPU_EQPY], 'intersection', [43.1280854, -77.6278033], Math.min(), []);
    EQPV = new Node('Eastman Quad', null, 'EQPV', [EQPS_EQPV, EQPU_EQPV, EQPV_EQPW, EQPF_EQPV], 'intersection', [43.1277656, -77.628706], Math.min(), []);
    EQPW = new Node('Eastman Quad', null, 'EQPW', [EQPV_EQPW, EQPW_EQPY, EQPF_EQPW], 'intersection', [43.128022, -77.6288722], Math.min(), []);
    EQPX = new Node('Eastman Quad', null, 'EQPX', [EQPU_EQPX, EQPX_EQPAE, EQPX_EQPY], 'intersection', [43.1277077, -77.6274823], Math.min(), []);
    EQPY = new Node('Eastman Quad', null, 'EQPY', [EQPW_EQPY, EQPU_EQPY, EQPX_EQPY, EQPAF_EQPY], 'intersection', [43.1284383, -77.6277806], Math.min(), []);
    EQPZ = new Node('Eastman Quad', null, 'EQPZ', [EQPAA_EQPZ, EQPS_EQPZ], 'intersection', [43.1273025, -77.6284454], Math.min(), []);  
    EQPAA = new Node('Eastman Quad', null, 'EQPAA', [EQPAA_EQPR, EQPAA_EQPAB, EQPAA_EQPZ], 'intersection', [43.1270544, -77.6290913], Math.min(), []);
    EQPAB = new Node('Eastman Quad', null, 'EQPAB', [EQPAB_EQPQ, EQPAA_EQPAB, EQPAB_SQPV], 'intersection', [43.1269221, -77.6294539], Math.min(), []);
    EQPAC = new Node('Eastman Quad', null, 'EQPAC', [EQPAC_EQPAE, EQPAC_ML02B], 'intersection', [43.1273935, -77.6282075], Math.min(), []);
    EQPAD = new Node('Eastman Quad', null, 'EQPAD', [EQPAD_ML03A], 'intersection', [43.1278979, -77.628317], Math.min(), []);
    EQPAE = new Node('Eastman Quad', null, 'EQPAE', [EQPX_EQPAE, EQPAC_EQPAE, EQPAE_EQPT], 'intersection', [43.1275754, -77.6277278], Math.min(), []);
    EQPAF = new Node('Eastman Quad', null, 'EQPAF', [EQPAF_RRGA, EQPAF_EQPY], 'intersection', [43.1287332, -77.6279317], Math.min(), []);
    DG01 = new Node('Douglass', '1', 'DG01', [DG01_DG02, DG01_DG03, DG01_DG04, DG01_DG01A], 'floor', [, ], Math.min(), []);
    DG02 = new Node('Douglass', '2', 'DG02', [DG01_DG02, DG02_DG03, DG02_DG04, DG02_DG02A, DG02_DG02B, DG02_DG02C], 'floor', [, ], Math.min(), []);
    DG03 = new Node('Douglass', '3', 'DG03', [DG01_DG03, DG02_DG03, DG03_DG04, DG03_DG03A], 'floor', [, ], Math.min(), []);
    DG04 = new Node('Douglass', '4', 'DG04', [DG01_DG04, DG02_DG04, DG03_DG04], 'floor', [, ], Math.min(), []);
    DG01A = new Node('Douglass', '1', 'DG01A', [DG01_DG01A], 'entrance', [43.1292479, -77.6289777], Math.min(), []);
    DG02A = new Node('Douglass', '2', 'DG02A', [DG02_DG02A], 'entrance', [43.1290874, -77.6286397], Math.min(), []);
    DG02B = new Node('Douglass', '2', 'DG02B', [DG02_DG02B], 'entrance', [43.1289347, -77.6290367], Math.min(), []);
    DG02C = new Node('Douglass', '2', 'DG02C', [DG02_DG02C, DG02C_WC03A], 'entrance', [43.1289934, -77.6291547], Math.min(), []);       
    DG03A = new Node('Douglass', '3', 'DG03A', [DG03_DG03A, DG03A_RR01A], 'entrance', [43.1287898, -77.6287309], Math.min(), []);       
    WC01 = new Node('Wilson Commons', '1', 'WC01', [WC01_WC02, WC01_WC03, WC01_WC04, WC01_WC05], 'floor', [, ], Math.min(), []);        
    WC02 = new Node('Wilson Commons', '2', 'WC02', [WC01_WC02, WC02_WC03, WC02_WC04, WC02_WC05, WC02_WC02A, WC02_WC02B], 'floor', [, ], Math.min(), []);
    WC03 = new Node('Wilson Commons', '3', 'WC03', [WC01_WC03, WC02_WC03, WC03_WC04, WC03_WC05, WC03_WC03A, WC03_WC03B], 'floor', [, ], Math.min(), []);
    WC04 = new Node('Wilson Commons', '4', 'WC04', [WC01_WC04, WC02_WC04, WC03_WC04, WC04_WC05, WC04_WC04A], 'floor', [, ], Math.min(), []);
    WC05 = new Node('Wilson Commons', '5', 'WC05', [WC01_WC05, WC02_WC05, WC03_WC05, WC04_WC05], 'floor', [, ], Math.min(), []);        
    WC02A = new Node('Wilson Commons', '2', 'WC02A', [WC02_WC02A], 'entrance', [43.1289034, -77.6300559], Math.min(), []);
    WC02B = new Node('Wilson Commons', '2', 'WC02B', [WC02_WC02B], 'entrance', [43.1291109, -77.6295248], Math.min(), []);
    WC03A = new Node('Wilson Commons', '3', 'WC03A', [WC03_WC03A, DG02C_WC03A], 'entrance', [43.1289073, -77.6293854], Math.min(), []); 
    WC03B = new Node('Wilson Commons', '3', 'WC03B', [WC03_WC03B, RRGC_WC03B], 'entrance', [43.1288564, -77.6294336], Math.min(), []);  
    WC04A = new Node('Wilson Commons', '4', 'WC04A', [WC04_WC04A], 'entrance', [43.1289269, -77.6294015], Math.min(), []);
    HUB = new Node('Hutchinson', 'B', 'HUB', [HUB_HU01], 'floor', [, ], Math.min(), []);
    HU01 = new Node('Hutchinson', '1', 'HU01', [HUB_HU01, HU01_HU02, HU01_HU03, HU01_HU04, HU01_HU01A], 'floor', [, ], Math.min(), []); 
    HU02 = new Node('Hutchinson', '2', 'HU02', [HU01_HU02, HU02_HU03, HU02_HU04, HU02_HU02A], 'floor', [, ], Math.min(), []);
    HU03 = new Node('Hutchinson', '3', 'HU03', [HU01_HU03, HU02_HU03], 'floor', [, ], Math.min(), []);
    HU04 = new Node('Hutchinson', '4', 'HU04', [HU01_HU04, HU02_HU04], 'floor', [, ], Math.min(), []);
    HL01 = new Node('Hylan', '1', 'HL01', [HL01_HL02, HL01_HL03, HL01_HL04, HL01_HL05, HL01_HL06, HL01_HL07, HL01_HL08, HL01_HL09, HL01_HL10, HL01_HL11, HL01_HL01A], 'floor', [, ], Math.min(), []);
    HL02 = new Node('Hylan', '2', 'HL02', [HL01_HL02, HL02_HL03, HL02_HL04, HL02_HL05, HL02_HL06, HL02_HL07, HL02_HL08, HL02_HL09, HL02_HL10, HL02_HL11, HL02_HL02A], 'floor', [, ], Math.min(), []);
    HL03 = new Node('Hylan', '3', 'HL03', [HL01_HL03, HL02_HL03], 'floor', [, ], Math.min(), []);
    HL04 = new Node('Hylan', '4', 'HL04', [HL01_HL04, HL02_HL04], 'floor', [, ], Math.min(), []);
    HL05 = new Node('Hylan', '5', 'HL05', [HL01_HL05, HL02_HL05], 'floor', [, ], Math.min(), []);
    HL06 = new Node('Hylan', '6', 'HL06', [HL01_HL06, HL02_HL06], 'floor', [, ], Math.min(), []);
    HL07 = new Node('Hylan', '7', 'HL07', [HL01_HL07, HL02_HL07], 'floor', [, ], Math.min(), []);
    HL08 = new Node('Hylan', '8', 'HL08', [HL01_HL08, HL02_HL08], 'floor', [, ], Math.min(), []);
    HL09 = new Node('Hylan', '9', 'HL09', [HL01_HL09, HL02_HL09], 'floor', [, ], Math.min(), []);
    HL10 = new Node('Hylan', '10', 'HL10', [HL01_HL10, HL02_HL10], 'floor', [, ], Math.min(), []);
    HL11 = new Node('Hylan', '11', 'HL11', [HL01_HL11, HL02_HL11], 'floor', [, ], Math.min(), []);
    HU01A = new Node('Hutchinson', '1', 'HU01A', [HU01_HU01A, HU01A_SQPZ], 'entrance', [43.1255878, -77.6305419], Math.min(), []);      
    HU02A = new Node('Hutchinson', '2', 'HU02A', [HU02_HU02A], 'entrance', [43.1253448, -77.6304361], Math.min(), []);
    HL01A = new Node('Hylan', '1', 'HL01A', [HL01_HL01A, HL01A_SQPZ], 'entrance', [43.1255926, -77.6304217], Math.min(), []);
    HL02A = new Node('Hylan', '2', 'HL02A', [HL02_HL02A, HL02A_SQPL], 'entrance', [43.1254836, -77.6302968], Math.min(), []);
    CL01 = new Node('Carlson', '1', 'CL01', [CL01_CL02, CL01_CL03, CL01_CL01A, CL01_CL01B, CL01_CL01C], 'floor', [, ], Math.min(), []); 
    CL02 = new Node('Carlson', '2', 'CL02', [CL01_CL02, CL02_CL03, CL02_CL02A], 'floor', [, ], Math.min(), []);
    CL03 = new Node('Carlson', '3', 'CL03', [CL01_CL03, CL02_CL03, CL03_CL03A], 'floor', [, ], Math.min(), []);
    CS02 = new Node('Computer Studies', '2', 'CS02', [CS02_CS04, CS02_CS05, CS02_CS06, CS02_CS07, CS02_CS02A], 'floor', [, ], Math.min(), []);
    CS04 = new Node('Computer Studies', '4', 'CS04', [CS02_CS04], 'floor', [, ], Math.min(), []);
    CS05 = new Node('Computer Studies', '5', 'CS05', [CS02_CS05], 'floor', [, ], Math.min(), []);
    CS06 = new Node('Computer Studies', '6', 'CS06', [CS02_CS06], 'floor', [, ], Math.min(), []);
    CS07 = new Node('Computer Studies', '7', 'CS07', [CS02_CS07], 'floor', [, ], Math.min(), []);
    GR01 = new Node('Goergen', '1', 'GR01', [GR01_WM01, GR01_GR02, GR01_GR03, GR01_GR04, GR01_GR05, GR01_GR01A, GR01_GR01B, GR01_GR01C], 'floor', [, ], Math.min(), []);
    GR02 = new Node('Goergen', '2', 'GR02', [GR02_WM02, GR01_GR02, GR02_GR03, GR02_GR04, GR02_GR05, GR02_GR02A], 'floor', [, ], Math.min(), []);
    GR03 = new Node('Goergen', '3', 'GR03', [GR03_WM03, GR01_GR03, GR02_GR03], 'floor', [, ], Math.min(), []);
    GR04 = new Node('Goergen', '4', 'GR04', [GR04_WM04, GR01_GR04, GR02_GR04], 'floor', [, ], Math.min(), []);
    GR05 = new Node('Goergen', '5', 'GR05', [GR05_WM05, GR01_GR05, GR02_GR05], 'floor', [, ], Math.min(), []);
    WM01 = new Node('Wilmot', '1', 'WM01', [GR01_WM01, WM01_WM02, WM01_WM03, WM01_WM04, WM01_WM05, WM01_WM01A], 'floor', [, ], Math.min(), []);
    WM02 = new Node('Wilmot', '2', 'WM02', [GR02_WM02, WM01_WM02], 'floor', [, ], Math.min(), []);
    WM03 = new Node('Wilmot', '3', 'WM03', [GR03_WM03, WM01_WM03], 'floor', [, ], Math.min(), []);
    WM04 = new Node('Wilmot', '4', 'WM04', [GR04_WM04, WM01_WM04], 'floor', [, ], Math.min(), []);
    WM05 = new Node('Wilmot', '5', 'WM05', [GR05_WM05, WM01_WM05], 'floor', [, ], Math.min(), []);
    CS02A = new Node('Computer Studies', '2', 'CS02A', [CS02A_SQPX, CS02_CS02A], 'entrance', [43.1250641, -77.6300337], Math.min(), []);
    CL01A = new Node('Carlson', '1', 'CL01A', [CL01_CL01A], 'entrance', [43.1250776, -77.6300545], Math.min(), []);
    CL02A = new Node('Carlson', '2', 'CL02A', [CL02A_SQPX, CL02_CL02A], 'entrance', [43.1250776, -77.6300545], Math.min(), []);
    CL02B = new Node('Carlson', '2', 'CL02B', [], 'entrance', [43.125054, -77.6300914], Math.min(), []);
    CL03A = new Node('Carlson', '3', 'CL03A', [CL03_CL03A], 'entrance', [43.1252006, -77.629632], Math.min(), []);
    GR01A = new Node('Goergen', '1', 'GR01A', [GR01A_SQPE, GR01_GR01A], 'entrance', [43.1258061, -77.6293749], Math.min(), []);
    GR01B = new Node('Goergen', '1', 'GR01B', [GR01B_SQPR, GR01_GR01B], 'entrance', [43.1253489, -77.6292536], Math.min(), []);
    GR01C = new Node('Goergen', '1', 'GR01C', [GR01C_SQPH, GR01_GR01C], 'entrance', [43.1254365, -77.6295029], Math.min(), []);
    GR02A = new Node('Goergen', '2', 'GR02A', [GR02_GR02A], 'entrance', [43.1252157, -77.6294935], Math.min(), []);
    WM01A = new Node('Wilmot', '1', 'WM01A', [SQPF_WM01A, WM01_WM01A], 'entrance', [43.1258735, -77.6292802], Math.min(), []);
    SQPA = new Node('Science Quad', null, 'SQPA', [SQPA_SQPW, SQPA_SQPC], 'intersection', [43.1262845, -77.6295843], Math.min(), []);   
    SQPB = new Node('Science Quad', null, 'SQPB', [SQPB_SQPC, SQPB_SQPE, SQPB_SQPG, SQPB_SQPD], 'intersection', [43.1259893, -77.6295992], Math.min(), []);
    SQPC = new Node('Science Quad', null, 'SQPC', [SQPA_SQPC, SQPB_SQPC], 'intersection', [43.1261468, -77.6295831], Math.min(), []);   
    SQPD = new Node('Science Quad', null, 'SQPD', [SQPB_SQPD, SQPD_SQPM], 'intersection', [43.1259828, -77.6298489], Math.min(), []);   
    SQPE = new Node('Science Quad', null, 'SQPE', [SQPB_SQPE, SQPE_SQPF, GR01A_SQPE], 'intersection', [43.1259919, -77.6294368], Math.min(), []);
    SQPF = new Node('Science Quad', null, 'SQPF', [SQPE_SQPF, SQPF_WM01A], 'intersection', [43.1259958, -77.6293262], Math.min(), []);  
    SQPG = new Node('Science Quad', null, 'SQPG', [SQPB_SQPG, SQPG_SQPM, SQPG_SQPH, SQPG_SQPJ], 'intersection', [43.1255987, -77.6298828], Math.min(), []);
    SQPH = new Node('Science Quad', null, 'SQPH', [SQPG_SQPH, SQPH_SQPI, GR01C_SQPH], 'intersection', [43.1254369, -77.6295797], Math.min(), []);
    SQPI = new Node('Science Quad', null, 'SQPI', [SQPH_SQPI, SQPI_SQPJ, SQPI_SQPS], 'intersection', [43.1253716, -77.6295797], Math.min(), []);
    SQPJ = new Node('Science Quad', null, 'SQPJ', [SQPG_SQPJ, SQPJ_SQPK, SQPI_SQPJ, SQPJ_SQPX], 'intersection', [43.1253521, -77.6300949], Math.min(), []);
    SQPK = new Node('Science Quad', null, 'SQPK', [SQPJ_SQPK, SQPK_SQPL], 'intersection', [43.1253461, -77.6302926], Math.min(), []);   
    SQPL = new Node('Science Quad', null, 'SQPL', [SQPK_SQPL, HL02A_SQPL, SQPL_SQPY], 'intersection', [43.1254637, -77.6302977], Math.min(), []);
    SQPM = new Node('Science Quad', null, 'SQPM', [SQPD_SQPM, SQPM_SQPN, SQPG_SQPM, SQPM_SQPU], 'intersection', [43.1259977, -77.6304611], Math.min(), []);
    SQPN = new Node('Science Quad', null, 'SQPN', [SQPM_SQPN, SQPN_SQPZ], 'intersection', [43.1256953, -77.6304892], Math.min(), []);   
    SQPO = new Node('Science Quad', null, 'SQPO', [SQPO_SQPQ, SQPO_SQPP, SQPO_SQPX], 'intersection', [43.1245268, -77.6299529], Math.min(), []);
    SQPP = new Node('Science Quad', null, 'SQPP', [SQPO_SQPP, SQPP_SQPT], 'intersection', [43.1245324, -77.6312908], Math.min(), []);   
    SQPQ = new Node('Science Quad', null, 'SQPQ', [SQPQ_SQPR, SQPO_SQPQ], 'intersection', [43.1248229, -77.6294358], Math.min(), []);   
    SQPR = new Node('Science Quad', null, 'SQPR', [SQPR_SQPS, SQPQ_SQPR, GR01B_SQPR], 'intersection', [43.1249462, -77.629303], Math.min(), []);
    SQPS = new Node('Science Quad', null, 'SQPS', [SQPI_SQPS, SQPR_SQPS], 'intersection', [43.1250548, -77.6295283], Math.min(), []);
    SQPT = new Node('Science Quad', null, 'SQPT', [SQPP_SQPT, SQPT_SQPU], 'intersection', [43.1249057, -77.6312599], Math.min(), []);   
    SQPU = new Node('Science Quad', null, 'SQPU', [SQPT_SQPU, SQPM_SQPU], 'intersection', [43.1259011, -77.6312961], Math.min(), []);   
    SQPV = new Node('Science Quad', null, 'SQPV', [SQPV_SQPW, EQPQ_SQPV, EQPAB_SQPV], 'intersection', [43.126862, -77.6296154], Math.min(), []);
    SQPW = new Node('Science Quad', null, 'SQPW', [SQPA_SQPW, SQPV_SQPW], 'intersection', [43.1265819, -77.6295891], Math.min(), []);   
    SQPX = new Node('Science Quad', null, 'SQPX', [SQPO_SQPX, SQPJ_SQPX, CS02A_SQPX, CL02A_SQPX], 'intersection', [43.1250235, -77.6300425], Math.min(), []);
    SQPY = new Node('Science Quad', null, 'SQPY', [SQPL_SQPY, SQPY_SQPZ], 'intersection', [43.1254583, -77.6305065], Math.min(), []);   
    SQPZ = new Node('Science Quad', null, 'SQPZ', [SQPY_SQPZ, SQPN_SQPZ, HU01A_SQPZ, HL01A_SQPZ], 'intersection', [43.1255468, -77.6304854], Math.min(), []);

    var all_nodes = [BR00A, BR01A, BR01B, BR01C, BR00, BR01, BR02, BR03, RT01A, RT01B, RT01C, RT01, RT02, RT03, MR02A, MR02B, MR03A, MR03B, MR03C, MRG, MR01, MR02, MR03, MR04, MR05, RRGA, RRGB, RRGC, RR01A, RR01B, RRG, RR01, RR02, RR03, RR04, EQPA, EQPB, EQPC, EQPD, EQPE, EQPF, EQPG, WQPA, WQPB, WQPC, WQPD, WQPE, WQPF, WQPG, WQPH, BL01, BL02, BL03, BL04, BL05, BL01A, BL01B, BL01C, BL02A, DWB, DW01, DW02, DW03, DW04, DW05, DW01A, DW01B, DW01C, DW01D, DW02A, HT01, HT02, HT01A, HT01B, HT01C, HT01D, HT01E, HT01F, HT02A, LT01, LT02, LT03, LT04, LT05, LT01A, LT02A, LT03A, IF01, IF02, IF03, IF01A, IF01B, IF03A, EQPH, EQPI, EQPJ, EQPK, EQPL, EQPM, EQPN, EQPO, EQPP, EQPQ, EQPR, ML01, ML02, ML03, ML04, ML02A, ML02B, ML03A, ML03B, EQPS, EQPT, EQPU, EQPV, EQPW, EQPX, EQPY, EQPZ, EQPAA, EQPAB, EQPAC, EQPAD, EQPAE, EQPAF, DG01, DG02, DG03, DG04, DG01A, DG02A, DG02B, DG02C, DG03A, WC01, WC02, WC03, WC04, WC05, WC02A, WC02B, WC03A, WC03B, WC04A, HUB, HU01, HU02, HU03, HU04, HL01, HL02, HL03, HL04, HL05, HL06, HL07, HL08, HL09, HL10, HL11, HU01A, HU02A, HL01A, HL02A, CL01, CL02, CL03, CS02, CS04, CS05, CS06, CS07, GR01, GR02, GR03, GR04, GR05, WM01, WM02, WM03, WM04, WM05, CS02A, CL01A, CL02A, CL02B, CL03A, GR01A, GR01B, GR01C, GR02A, WM01A, SQPA, SQPB, SQPC, SQPD, SQPE, SQPF, SQPG, SQPH, SQPI, SQPJ, SQPK, SQPL, SQPM, SQPN, SQPO, SQPP, SQPQ, SQPR, SQPS, SQPT, SQPU, SQPV, SQPW, SQPX, SQPY, SQPZ]

    // sort edge accessibility
    var accessible_edges = [];
    all_edges.forEach(edge => {
        if (edge.ada) {accessible_edges.push(edge);}
        else {
            var add = true;
            if (edge.steps && !allow_steps) {add = false;}
            else if (edge.stairs && !allow_stairs) {add = false;}
            else if (edge.manual_doors && !allow_manual_doors) {add = false;}
            else if (edge.non_wc_elevators && !allow_non_wc_elevators) {add = false;}
            if (add) {accessible_edges.push(edge);}
        }

    });
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
        var bothNodes = edge.id.split("_");
        var neighborID;
        bothNodes[0] == node.id ? neighborID = bothNodes[1] : neighborID = bothNodes[0];
        all_nodes.forEach(x => {
            if (x.id == neighborID) {
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
    string_route = []
    end.route.forEach(part => {string_route.push(part.id)})
    console.log('Shortest path distance is: ' + Math.round(3.28084*end.length) + " feet");
    console.log('Shortest path is: ' + string_route);
    if(string_route[string_route.length - 1] == end.id && find_neighbor(end.route[2], end.route[1]) == start){display()}
    else {alert("Accessible route not found.  Please try adjusting your starting, destination, or accessibility requirements to find a route.")}
}

// if path directions should be reversed, use ids as input
function ifReverse(edge, next) {
    return edge.substring(0, next.length) == next;
}

// determine what direction step is shown in topbar
function currentStep() {
    document.getElementById('current-dir-check').children[0].checked = false;
    var steps = document.getElementById('directions').children;
    var current = null;
    for (let i = 0; i<steps.length; i++) {
        if (!steps[i].children[1].children[0].checked && current == null) {current = steps[i]} 
    }
    if (current != null) {
        document.getElementById('current-dir-building').innerHTML = current.children[0].children[0].innerHTML;
        document.getElementById('current-dir-type').innerHTML = current.children[0].children[1].innerHTML;
        document.getElementById('current-dir-step').innerHTML = current.children[1].children[1].children[0].innerHTML;
        document.getElementById('current-dir-check').children[0].value = current.children[1].children[0].value;
        document.getElementById('current-dir-check').children[1].htmlFor = current.children[1].children[0].id;
    }
    else {document.getElementById('current-dir-check').children[0].checked = true;}
}

function checkFromCurrent(event) {
    if (event.target.checked) {
        var dirId = event.target.value;
        var steps = document.getElementById('directions').children;
        for (let i = 0; i<steps.length; i++) {
            if (steps[i].children[1].children[0].value == dirId) {
                steps[i].children[1].children[0].checked = true;
            }
        }
    }
    event.target.checked = false;
    currentStep()
}

var routeMarkers = L.layerGroup();

function display() {
    // display route summary
    document.getElementById('display-start').innerHTML = document.getElementById('start-building').value + " " + document.getElementById('start-floor').value
    document.getElementById('display-end').innerHTML = document.getElementById('end-building').value + " " + document.getElementById('end-floor').value
    document.getElementById('route-length').innerHTML = Math.round(3.28084*end.length) + " feet";
    // display route directions
    directions = document.getElementById("directions");
    directions.innerHTML = "";
    var mapPoints = [];
    var mapLines = [];
    var allCoords = [];
    end.route.forEach(part => {
        if (part.coords != null) {
            if (part.coords[0] != undefined) {
                if (part instanceof Node) { 
                    mapPoints.push(part)
                    allCoords.push(part.coords)
                }
                else {
                    // reverse coords to correct route lines
                    if (ifReverse(part.id, end.route[end.route.indexOf(part) + 1].id)){
                        var revCoords = [];
                        for (let c = 1; c <= part.coords.length; c++) {revCoords.push(part.coords[part.coords.length - c])}
                        part.coords = revCoords;
                    }
                    part.coords.forEach(coord => {allCoords.push(coord)})
                    mapLines.push(part)
                }
            }
        }

        if (part instanceof Edge && part.dir != null) {
            var li = document.createElement('li');
            var overview = document.createElement('div');
            // extra info for directions
            overview.classList.add('dir-step-overview');
            var dirLocation = document.createElement('p');
            dirLocation.innerHTML = part.location;
            var dirType = document.createElement('p');
            if (part.type == "floor") {dirType.innerHTML = "Change floors";}
            else if (part.type == "connection") {dirType.innerHTML = "Connected buildings";}
            else if (part.type == "path") {dirType.innerHTML = "Outdoor path";}
            else if (part.type == "level") {dirType.innerHTML = "Cross building level";}
            else if (part.type == "tunnel") {dirType.innerHTML = "Tunnel";}
            else {dirType.innerHTML = part.type;}
            overview.appendChild(dirLocation);
            overview.appendChild(dirType);

            // step checkbox/description
            var formCheck = document.createElement('div');
            formCheck.classList.add('form-check');
            formCheck.classList.add('dir-step-check');
            var stepInput = document.createElement('input');
            stepInput.classList.add('form-check-input');
            stepInput.type = 'checkbox';
            stepInput.value = part.id;
            stepInput.id = part.id;
            stepInput.addEventListener('change', currentStep)
            var stepLabel = document.createElement('label');
            stepLabel.classList.add('form-check-label');
            stepLabel.htmlFor = 'part.id';
            var stepText = document.createElement('p');
            stepText.classList.add('dir-step-text');
            ifReverse(part.id, end.route[end.route.indexOf(part) + 1].id) ? stepText.innerHTML = part.revDir : stepText.innerHTML = part.dir;
            stepLabel.appendChild(stepText);
            formCheck.appendChild(stepInput);
            formCheck.appendChild(stepLabel);

            // form list item and add to directions
            li.appendChild(overview);
            li.appendChild(formCheck);
            directions.appendChild(li);
        }
    })
    currentStep();
    routeMarkers.clearLayers(); // reset from prev
    if (allCoords.length > 1){
    startCoords = allCoords[0];
    console.log(startCoords)
    var newBounds = [allCoords[0], allCoords[allCoords.length - 1]];
    var newBounds = map.getBounds().pad(0.003)
    map.fitBounds(newBounds)
    located = true; // prevents auto center to userloc if userloc found second
    // add markers and route lines
    var startMarker = L.marker(startCoords);
    var endMarker = L.marker(allCoords[allCoords.length - 1]);
    routeMarkers.addLayer(startMarker);
    routeMarkers.addLayer(endMarker);}
    routeMarkers.addLayer(L.polyline(allCoords));
    routeMarkers.addTo(map);
    document.getElementById('route-input').hidden = true;
    document.getElementById('route-info').hidden = true;
    document.getElementById('route-directions').hidden = false;
    document.getElementById('directions-container').hidden = false;
    document.getElementById('find-route').hidden = true;
    document.getElementById('finish-route').hidden = false;
}

function adjustRoute() {
    getLocation();

    // reset sidebar
    document.getElementById('route-input').hidden = false;
    document.getElementById('route-info').hidden = false;
    document.getElementById('route-directions').hidden = true;
    document.getElementById('directions-container').hidden = true;
    document.getElementById('find-route').hidden = false;
    document.getElementById('finish-route').hidden = true;

    // reset map
    routeMarkers.clearLayers();

    // reset find route inputs
    start = null;
    end = null;
}

function endRoute() {
    //reset inputs
    document.getElementById('start-building').value = "";
    document.getElementById('start-floor').value = "";
    document.getElementById('end-building').value = "";
    document.getElementById('end-floor').value = "";
    located = false;
    
    adjustRoute();
}