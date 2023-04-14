var floorSelect = document.getElementById('repair-floor');
if (floorSelect != "") {propogateFloors()}

// propogate floor select options after selecting building
function floorOptions(floors) {
    floorSelect.innerHTML = '';
    // add default selected blank option
    var blank = document.createElement("option");
    blank.text = "--";
    blank.value = "";
    blank.selected - true;
    floorSelect.appendChild(blank);

    // add other options
    for (let i = 0; i < floors.length; i++) {
        var opt = document.createElement("option");
        opt.text = floors[i];
        opt.value = floors[i];
        floorSelect.appendChild(opt);
    }
}
function propogateFloors() {
    building = document.getElementById('repair-building').value;
    switch (building) {
    case 'Burton':
        floorOptions(['0', '1', '2', '3']);
        break;
    case 'Rettner':
        floorOptions(['1', '2', '3']);
        break;
    case 'Lattimore':
        floorOptions(['1', '2', '3', '4', '5']);
        break;
    case 'Morey':
        floorOptions(['1', '2', '3', '4', '5']);
        break;
    case 'Rush Rhees':
        floorOptions(['G', '1', '2', '3', '4']);
        break;
    case 'Hoyt':
        floorOptions(['1', '2'], '1');
        break;
    case 'Bausch & Lomb':
        floorOptions(['1', '2', '3', '4', '5']);
        break;
    case 'Dewey':
        floorOptions(['B', '1', '2', '3', '4', '5']);
        break;
    default:
        floorOptions(['B', 'G', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
    }
}

function validEmail() {
    var emailInput = document.getElementById('reporter-email')
    var email = emailInput.value;
    if (email.indexOf('@u.rochester.edu') == -1 && email.indexOf('@ur.rochester.edu') == -1) {
        emailInput.classList.add('is-invalid');
        document.getElementById('email-invalid-feedback').hidden = false;
        return false;
    }
    else {
        emailInput.classList.remove('is-invalid');
        document.getElementById('email-invalid-feedback').hidden = true;
        return true;
    }
}

function validPhone() {
    var phoneInput = document.getElementById('reporter-phone')
    var phone = phoneInput.value;
    var phoneReg = /\d{9,10}/;
    if (!phoneReg.test(phone)) {
        phoneInput.classList.add('is-invalid');
        document.getElementById('phone-invalid-feedback').hidden = false;
        return false;
    }
    else {
        phoneInput.classList.remove('is-invalid');
        document.getElementById('phone-invalid-feedback').hidden = true;
        return true;
    }
}

function submitRequest() {
    var inputs = document.getElementsByClassName('required');
    var allRequired = true;
    for (let i = 0; i< inputs.length; i++) {
        if (inputs[i].value == "") {
            inputs[i].classList.add('is-invalid');
            allRequired = false;
        }
        else {inputs[i].classList.remove('is-invalid');}
    }
    if (allRequired && validEmail() && validPhone()) {
        console.log('submitted request')
    }
}