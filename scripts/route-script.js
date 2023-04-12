function find_route(event) {
    event.preventDefault();
    console.log("find route");
    var allow_steps = document.getElementById("allowSteps").checked;
    var allow_stairs = document.getElementById("allowStairs").checked;
    var allow_manual_doors = document.getElementById("allowDoors").checked;
    var allow_non_wc_elevators = document.getElementById("allowElevators").checked;

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
    RT01RT02 = new Edge('floor', 'RT01RT02', 5, false, false, false, false, true, 'first floor to second floor', 'second floor to first floor', null);
    RT01RT03 = new Edge('floor', 'RT01RT03', 10, false, false, false, false, true, 'first floor to third floor', 'third floor to first floor', null);
    RT02RT03 = new Edge('floor', 'RT02RT03', 5, false, false, false, false, true, 'second floor to third floor', 'third floor to second floor', null);
    RT01RT01A = new Edge('level', 'RT01RT01A', 0, false, false, false, false, true, null, null, null);
    RT01RT01B = new Edge('level', 'RT01RT01B', 0, false, false, false, false, true, null, null, null);
    RT01RT01C = new Edge('level', 'RT01RT01C', 0, false, false, false, false, true, null, null, null);

    // Morey
    MRGMR01 = new Edge('floor', 'MRGMR01', 5, false, false, false, false, true, 'ground floor to first floor', 'second floor to first floor', null);
    MRGMR02 = new Edge('floor', 'MRGMR02', 10, false, false, false, false, true, 'ground floor to second floor', 'first floor to second floor', null);
    MRGMR03 = new Edge('floor', 'MRGMR03', 15, false, false, false, false, true, 'ground floor to third floor', 'third floor to ground floor', null);
    MRGMR04 = new Edge('floor', 'MRGMR04', 20, false, false, false, false, true, 'ground floor to fourth floor', 'fourth floor to ground floor', null);
    MRGMR05 = new Edge('floor', 'MRGMR05', 25, false, false, false, false, true, 'ground floor to fifth floor', 'fifth floor to ground floor', null);
    MR01MR02 = new Edge('floor', 'MR01MR02', 5, false, false, false, false, true, 'first floor to second floor', 'second floor to first floor', null);
    MR01MR03 = new Edge('floor', 'MR01MR03', 10, false, false, false, false, true, 'first floor to third floor', 'third floor to first floor', null);
    MR01MR04 = new Edge('floor', 'MR01MR04', 15, false, false, false, false, true, 'first floor to fourth floor', 'fourth floor to first floor', null);
    MR01MR05 = new Edge('floor', 'MR01MR05', 20, false, false, false, false, true, 'first floor to fifth floor', 'fifth floor to first floor', null);
    MR02MR03 = new Edge('floor', 'MR02MR03', 5, false, false, false, false, true, 'second floor to third floor', 'third floor to second floor', null);
    MR02MR04 = new Edge('floor', 'MR02MR04', 10, false, false, false, false, true, 'second floor to fourth floor', 'fourth floor to second floor', null);
    MR02MR05 = new Edge('floor', 'MR02MR05', 15, false, false, false, false, true, 'second floor to fifth floor', 'fifth floor to second floor', null);
    MR03MR04 = new Edge('floor', 'MR03MR04', 5, false, false, false, false, true, 'third floor to fourth floor', 'fourth floor to third floor', null);
    MR03MR05 = new Edge('floor', 'MR03MR05', 10, false, false, false, false, true, 'third floor to fifth floor', 'fifth floor to third floor', null);
    MR02MR02A = new Edge('level', 'MR02MR02A', 0, false, false, false, false, true, null, null, null);
    MR03MR03A = new Edge('level', 'MR03MR03A', 0, false, false, false, false, true, null, null, null);
    MR03MR03B = new Edge('level', 'MR03MR03B', 0, false, false, false, false, true, null, null, null);
    MR03MR03C = new Edge('level', 'MR03MR03C', 0, false, false, false, false, true, null, null, null);
    MRGRT01 = new Edge('connection', 'MRGRT01', 0, false, false, false, false, true, 'exit the elevator area and enter floor 1 of Rettner', 'enter the elevator area near Morey', null);
    MR01RT01 = new Edge('connection', 'MR01RT01', 0, true, true, false, false, true, 'go down the steps to enter floor 1 of Rettner', 'go up the steps to enter floor 1 of Morey', null);
    MR02RT02 = new Edge('connection', 'MR02RT02', 0, false, false, false, false, true, 'take a right before the elevator to enter floor 2 of Rettner', 'go past the seating area to enter floor 2 of Morey', null);
    MR03RT03 = new Edge('connection', 'MR03RT03', 0, false, false, false, false, true, 'take a right before the elevator to enter floor 3 of Rettner', 'go past the seating area to enter floor 3 of Morey', null);
    MR02ARRGC = new Edge('tunnel', 'MR02ARRGC', 29.6, false, false, false, false, true, 'go through the double doors, take a right at the end of the hall, and enter the ground floor of Rush Rhees', 'turn right by the vending machines and staircase, follow the tunnel, and go through the double doors on the right at the end of the tunnel to enter floor 2 of Morey', [[43.1284964,-77.6293734],[43.128453,-77.6293403],[43.1285122,-77.6291817],[43.128488,-77.6291669],[43.1285151,-77.6290934]]);

    // Rush Rhees
    RRGRR01 = new Edge('floor', 'RRGRR01', 5, false, false, false, false, true, 'ground floor to first floor', 'first floor to ground floor', null);
    RRGRR02 = new Edge('floor', 'RRGRR02', 10, false, false, false, false, true, 'ground floor to second floor', 'second floor to ground floor', null);
    RRGRR03 = new Edge('floor', 'RRGRR03', 15, false, false, false, false, true, 'ground floor to third floor', 'third floor to ground floor', null);
    RRGRR04 = new Edge('floor', 'RRGRR04', 20, false, false, false, false, true, 'ground floor to fourth floor', 'fourth floor to ground floor', null);
    RR01RR02 = new Edge('floor', 'RR01RR02', 5, false, false, false, false, true, 'first floor to second floor', 'second floor to first floor', null);
    RR01RR03 = new Edge('floor', 'RR01RR03', 10, false, false, false, false, true, 'first floor to third floor', 'third floor to first floor', null);
    RR01RR04 = new Edge('floor', 'RR01RR04', 15, false, false, false, false, true, 'first floor to fourth floor', 'fourth floor to first floor', null);
    RRGRRGA = new Edge('level', 'RRGRRGA', 0, false, false, false, false, true, null, null, null);
    RRGRRGB = new Edge('level', 'RRGRRGB', 0, false, false, false, false, true, null, null, null);
    RRGRRGC = new Edge('level', 'RRGRRGC', 0, false, false, false, false, true, null, null, null);
    RR01RR01A = new Edge('level', 'RR01RR01A', 0, false, false, false, false, true, null, null, null);
    RR01RR01B = new Edge('level', 'RR01RR01B', 0, false, false, false, false, true, null, null, null);

    // Eastman Quad
    EQPCMR03A = new Edge('path', 'EQPCMR03A', 5.9, false, false, false, false, true, 'enter Morey hall', 'leave Morey hall', [[43.1283983,-77.6294316],[43.1284459,-77.6294641]]);
    EQPBMR03B = new Edge('path', 'EQPBMR03B', 4.8, true, false, true, false, false, 'enter Morey hall', 'leave Morey hall', [[43.1283214,-77.6296242],[43.1283587,-77.6296534]]);
    EQPAMR03C = new Edge('path', 'EQPAMR03C', 6.2, true, false, true, false, false, 'enter Morey hall', 'leave Morey hall', [[43.1282524,-77.6298131],[43.1283023,-77.6298476]]);
    EQPAEQPB = new Edge('path', 'EQPAEQPB', 17.1, false, false, false, false, true, 'head towards Rush Rhees library', 'head away from Rush Rhees library', [[43.1282524,-77.6298131],[43.1283214,-77.6296242]]);
    EQPBEQPC = new Edge('path', 'EQPBEQPC', 17.8, false, false, false, false, true, 'head towards Rush Rhees library', 'head away from Rush Rhees library', [[43.1283214,-77.6296242],[43.1283983, -77.6294316]]);
    EQPDRR01B = new Edge('path', 'EQPDRR01B', 23.9, false, true, true, false, false, 'enter Rush Rhees library', 'leave Rush Rhees library', [[43.1282604, -77.6290755],[43.1284752,-77.6290755]]);
    EQPDEQPE = new Edge('path', 'EQPDEQPE', 26.5, false, false, false, false, true, 'head away from Rush Rhees library', 'head towards Rush Rhees library', [[43.1282604, -77.6290755],[43.1284752, -77.6292172]]);
    EQPDEQPF = new Edge('path', 'EQPDEQPF', 25.9, false, false, false, false, true, 'head away from Rush Rhees library', 'head towards Rush Rhees library', [[43.1282604, -77.6290755],[43.1280535, -77.6289301]]);
    EQPCEQPE = new Edge('path', 'EQPCEQPE', 19.4, false, false, false, false, true, 'head towards Rush Rhees library', 'head away from Rush Rhees library', [[43.1283983, -77.6294316],[43.1284752, -77.6292172]]);
    EQPBEQPG = new Edge('path', 'EQPBEQPG', 52.0, false, false, false, false, true, 'head towards Bausch and Lomb', 'head away from Bausch and Lomb', [[43.1283214,-77.6296242],[43.1279103, -77.6293189]]);
    EQPFEQPG = new Edge('path', 'EQPFEQPG', 35.3, false, false, false, false, true, 'head towards Bausch and Lomb', 'head away from Bausch and Lomb', [[43.1280535, -77.6289301],[43.1279103, -77.6293189]]);

    // Wilson Quad
    BR01AWQPB = new Edge('path', 'BR01AWQPB', 18.3, true, false, true, false, false, 'leave Burton hall', 'enter Burton hall', [[43.129296,-77.6311965],[43.129277,-77.6312532],[43.1291688,-77.6311843]]);
    BR01BWQPB = new Edge('path', 'BR01BWQPB', 18.1, true, false, true, false, false, 'leave Burton hall', 'enter Burton hall', [[43.1292627,-77.6311965],[43.129277,-77.6312532],[43.1291688,-77.6311843]]);
    BR01BWQPA = new Edge('path', 'BR01BWQPA', 29.6, true, false, true, false, false, 'leave Burton hall', 'enter Burton hall', [[43.1292627,-77.6311965],[43.1292248,-77.6313938],[43.1291189,-77.6313241]]);
    BR01CWQPA = new Edge('path', 'BR01CWQPA', 17.7, true, false, true, false, false, 'leave Burton hall', 'enter Burton hall', [[43.129204,-77.6314433],[43.1292248,-77.6313938],[43.1291189,-77.6313241]]);
    WQPAWQPB = new Edge('path', 'WQPAWQPB', 5.5, false, false, false, false, true, 'walk towards Crosby hall', 'walk towards Burton hall', [[43.1291189,-77.6313241],[43.1291688,-77.6313241]]);
    WQPAWQPE = new Edge('path', 'WQPAWQPE', 20.2, false, false, false, false, true, 'walk towards the fraternity quad', 'walk towards Burton hall', [[43.1291189,-77.6313241],[43.1290393,-77.6315472]]);
    WQPBWQPD = new Edge('path', 'WQPBWQPD', 38.8, false, false, false, false, true, 'walk towards Crosby hall', 'walk towards Burton hall', [[43.1291688,-77.6313241],[43.1292818,-77.6308716]]);
    WQPEWQPF = new Edge('path', 'WQPEWQPF', 45.2, false, false, false, false, true, 'walk towards LeChase hall', 'walk towards Burton hall', [[43.1290393,-77.6315472],[43.1286759,-77.6312982]]);
    WQPCWQPD = new Edge('path', 'WQPCWQPD', 44.2, false, false, false, false, true, 'walk towards the residence halls', 'walk towards LeChase and Rettner hall', [[43.1289216,-77.6306342],[43.1292818,-77.6308716]]);
    WQPCWQPF = new Edge('path', 'WQPCWQPF', 60.4, false, false, false, false, true, 'walk towards the fraternity quad', 'walk towards Wilson Commons', [[43.1289216,-77.6306342],[43.1286759,-77.6312982]]);
    WQPCWQPG = new Edge('path', 'WQPCWQPG', 52.4, false, false, false, false, true, 'walk towards Rettner hall', 'walk towards Wilson quad', [[43.1289216,-77.6306342],[43.1285042,-77.6303344]]);
    WQPGWQPH = new Edge('path', 'WQPGWQPH', 21.3, false, false, false, false, true, 'walk towards Rettner and Morey hall', 'walk towards LeChase hall', [[43.1285042,-77.6303344],[43.1283342,-77.6302145]]);
    RT01AWQPG = new Edge('path', 'RT01AWQPG', 21.5, false, false, false, false, true, 'leave Rettner hall', 'enter Rettner hall', [[43.1286775,-77.630216],[43.1285042,-77.6303344]]);
    RT01CWQPH = new Edge('path', 'RT01CWQPH', 8.0, false, false, false, false, true, 'leave Rettner hall', 'enter Rettner hall', [[43.1283643,-77.6301248],[43.1283342,-77.6302145]]);

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

    // find shortest route
    if (start == null || start == undefined) {
        console.log('Starting building and/or floor not selected');
        return
    }
    if (end == null || end == undefined) {
        console.log('Destination building and/or floor not selected');
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
    var map = document.getElementById("map");
    console.log(map);
    string_route = []
    end.route.forEach(part => {string_route.push(part.id)})
    console.log('Shortest path distance is: ' + Math.round(3.28084*end.length) + " feet");
    console.log('Shortest path is: ' + string_route);
    return end.route
}