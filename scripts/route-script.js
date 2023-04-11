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
    RT01 = new Node("Rettner", "1", "RT01", [], "floor", null, null, []);
    BR01 = new Node("Burton", "1", "BR01", [], "floor", null, null, []);
    all_nodes = [RT01, BR01];

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