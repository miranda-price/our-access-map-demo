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
    var emailAddress = emailInput.value;
    if (emailAddress.indexOf('@u.rochester.edu') == -1 && emailAddress.indexOf('@ur.rochester.edu') == -1) {
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
    var phoneNum = phoneInput.value;
    var phoneReg = /\d{9,10}/;
    if (!phoneReg.test(phoneNum)) {
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

function format(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return '' + (m<=9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d) + '/' + y;
}

var fullName;
var email;
var phone;
var dateRequested;
var feature;
var building;
var floor;
var room;
var extraDetails = "";

function displayConfirm() {
    document.getElementById('display-email').innerHTML = email;
    document.getElementById('display-phone').innerHTML = phone;
    document.getElementById('display-date').innerHTML = dateRequested;
    document.getElementById('display-feature').innerHTML = feature;
    document.getElementById('display-building').innerHTML = building;
}

function clearForm() {
    document.getElementById('reporter-name').value = "";
    document.getElementById('reporter-email').value = "";
    document.getElementById('reporter-phone').value = "";
    document.getElementById('display-feature').value = "";
    document.getElementById('repair-building').value = "";
    document.getElementById('repair-floor').value = "";
    document.getElementById('repair-room').value = "";
    document.getElementById('push-door-button').checked = false;
    document.getElementById('elevator').checked = false;
    document.getElementById('ramp').checked = false;
    var detailChips = document.getElementById('report-details-chips').children;
    for (let i = 0; i< detailChips.length; i++) {detailChips[i].classList.remove('active')}
}

function submitRequest(event) {
    event.preventDefault();
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
        console.log('submitted request');
        fullName = document.getElementById('reporter-name').value;
        email = document.getElementById('reporter-email').value;
        phone = document.getElementById('reporter-phone').value;
        building = document.getElementById('repair-building').value;
        floor = document.getElementById('repair-floor').value;
        room = document.getElementById('repair-room').value;
        // feature radio selection
        if (document.getElementById('push-door-button').checked) {feature = 'push door button'}
        else if (document.getElementById('elevator').checked) {feature = 'elevator'}
        else if (document.getElementById('ramp').checked) {feature = 'ramp'}
        else {feature = 'push door button, elevator, etc. not specified'}
        // request date
        var today = new Date();
        dateRequested = format(today);
        //extra details
        var detailChips = document.getElementById('report-details-chips').children;
        for (let i = 0; i< detailChips.length; i++) {
            if (detailChips[i].classList.contains('active')) {
                extraDetails = extraDetails + detailChips[i].innerHTML + ", ";
            }
        }
    }
    displayConfirm();
    clearForm();
}