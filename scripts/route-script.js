function find_route() {
    console.log("find route");
    var allow_steps = document.getElementById("allowSteps").checked;
    var allow_stairs = document.getElementById("allowStairs").checked;
    var allow_manual_doors = document.getElementById("allowDoors").checked;
    var allow_non_wc_elevators = document.getElementById("allowElevators").checked;

    class Node {
        constructor(building, level, id, edges, type, lat, long, route) {
            this.building = building;
            this.level = level;
            this.id = id;
            this.edges = edges;
            this.type = type;
            this.lat = lat;
            this.long = long;
            this.route = route;
        }
    }

    class Edge {
        constructor(type, id, length, steps, stairs, manual_doors, non_wc_elevators, ada, dir, revDir, coords) {
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
    }

    // define edges
    

    // define nodes
    // Burton
    BR00 = new Node("Burton", "0", "BR00", [], "floor", null, null, []);
    BR01 = new Node("Burton", "1", "BR01", [], "floor", null, null, []);
    BR02 = new Node("Burton", "1", "BR02", [], "floor", null, null, []);
    BR03 = new Node("Burton", "1", "BR03", [], "floor", null, null, []);
    BR00A = new Node("Burton", "0", "BR00A", [], "entrance", 43.1293665, -77.6313923, []);
    BR01A = new Node("Burton", "1", "BR01A", [], "entrance", 43.129296, -77.6311965, []);
    BR01B = new Node("Burton", "1", "BR01B", [], "entrance", 43.1292627, -77.6313306, []);
    BR01C = new Node("Burton", "1", "BR01C", [], "entrance", 43.129204, -77.6314433, []);

    // Rettner
    RT01 = new Node("Rettner", "1", "RT01", [], "floor", null, null, []);
    RT02 = new Node("Rettner", "2", "RT02", [], "floor", null, null, []);
    RT03 = new Node("Rettner", "3", "RT03", [], "floor", null, null, []);
    RT01A = new Node("Rettner", "1", "RT01A", [], "entrance", 43.1286775, -77.630216, []);
    RT01B = new Node("Rettner", "1", "RT01B", [], "entrance", 43.1284505, -77.6299049, []);
    RT01C = new Node("Rettner", "1", "RT01C", [], "entrance", 43.1283643, -77.6301248, []);

    // Morey
    MRG = new Node("Morey", "G", "MRG", [], "floor", null, null, []);
    MR01 = new Node("Morey", "1", "MR01", [], "floor", null, null, []);
    MR02 = new Node("Morey", "2", "MR02", [], "floor", null, null, []);
    MR03 = new Node("Morey", "3", "MR03", [], "floor", null, null, []);
    MR04 = new Node("Morey", "4", "MR04", [], "floor", null, null, []);
    MR05 = new Node("Morey", "5", "MR05", [], "floor", null, null, []);
    MR02A = new Node("Morey", "2", "MR02A", [], "entrance", 43.1284964, -77.6293734, []);
    MR03A = new Node("Morey", "3", "MR03A", [], "entrance", 43.1284459, -77.6294641, []);
    MR03B = new Node("Morey", "3", "MR03B", [], "entrance", 43.1283587, -77.6296534, []);
    MR03C = new Node("Morey", "3", "MR03C", [], "entrance", 43.1283023, -77.6298476, []);

    // Rush Rhees
    RRG = new Node("Rush Rhees", "G", "RRG", [], "floor", null, null, []);
    RR01 = new Node("Rush Rhees", "1", "RR01", [], "floor", null, null, []);
    RR02 = new Node("Rush Rhees", "2", "RR02", [], "floor", null, null, []);
    RR03 = new Node("Rush Rhees", "3", "RR03", [], "floor", null, null, []);
    RR04 = new Node("Rush Rhees", "4", "RR04", [], "floor", null, null, []);
    RRGA = new Node("Rush Rhees", "G", "RRGA", [], "entrance", 43.1287284, -77.6279537, []);
    RRGB = new Node("Rush Rhees", "G", "RRGB", [], "entrance", 43.1281014, -77.6287809, []);
    RRGC = new Node("Rush Rhees", "G", "RRGC", [], "entrance", 43.1285151, -77.6290934, []);
    RR01A = new Node("Rush Rhees", "1", "RR01A", [], "entrance", 43.128743, -77.6286939, []);
    RR01B = new Node("Rush Rhees", "1", "RR01B", [], "entrance", 43.1283107, -77.6289446, []);

    // Eastman Quad
    EQPA = new Node("Eastman Quad", null, "EQPA", [], "intersection", 43.1282524, -77.6298131, []);
    EQPB = new Node("Eastman Quad", null, "EQPB", [], "intersection", 43.1283214, -77.6296242, []);
    EQPC = new Node("Eastman Quad", null, "EQPC", [], "intersection", 43.1283983, -77.6294316, []);
    EQPD = new Node("Eastman Quad", null, "EQPD", [], "intersection", 43.1282604, -77.6290755, []);
    EQPE = new Node("Eastman Quad", null, "EQPE", [], "intersection", 43.1284752, -77.6292172, []);
    EQPF = new Node("Eastman Quad", null, "EQPF", [], "intersection", 43.1280535, -77.6289301, []);
    EQPG = new Node("Eastman Quad", null, "EQPG", [], "intersection", 43.1279103, -77.6293189, []);

    // Wilson Quad
    WQPA = new Node("Wilson Quad", null, "WQPA", [], "intersection", 43.1291189, -77.6313241, []);
    WQPB = new Node("Wilson Quad", null, "WQPB", [], "intersection", 43.1291688, -77.6311843, []);
    WQPC = new Node("Wilson Quad", null, "WQPC", [], "intersection", 43.1289216, -77.6306342, []);
    WQPD = new Node("Wilson Quad", null, "WQPD", [], "intersection", 43.1292818, -77.6308716, []);
    WQPE = new Node("Wilson Quad", null, "WQPE", [], "intersection", 43.1290393, -77.6315472, []);
    WQPF = new Node("Wilson Quad", null, "WQPF", [], "intersection", 43.1286759, -77.6312982, []);
    WQPG = new Node("Wilson Quad", null, "WQPG", [], "intersection", 43.1285042, -77.6303344, []);
    WQPH = new Node("Wilson Quad", null, "WQPH", [], "intersection", 43.1283342, -77.6302145, []);

    all_nodes = [BR00, BR01, BR02, BR03, BR00A, BR01A, BR01B, BR01C, RT01, RT02, RT03, RT01A, RT01B, RT01C, MRG, MR01, MR02, MR03, MR04, MR05, MR02A, MR03A, MR03B, MR03C, RRG, RR01, RR02, RR03, RR04, RRGA, RRGB, RRGC, RR01A, RR01B, EQPA, EQPB, EQPD, EQPE, EQPF, EQPG];

    // sort edge accessibility
    var step_edges = [];
    var stair_edges = [];
    var door_edges = [];
    var elevator_edges = [];
    var accessible_edges = []; // ada edges

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
    console.log(startBuilding);
    console.log(startFloor);
    console.log(endBuilding);
    console.log(endFloor);

    var start;
    var end;

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
    console.log(start.id);
    console.log(end.id);
}