let opend_overlay = null;
const overlay = document.getElementById('overlay'); // get the overlay element

function open_overlay(id, url) {
    if (opend_overlay != id) {
        opend_overlay = id;
        overlay.querySelector('iframe').remove();
        let newiframe = document.createElement('iframe');
        newiframe.src = `articles/${id}/${url}`;
        overlay.appendChild(newiframe);
        overlay.style.display = 'block'; // show the overlay
    }
}

function close_overlay() {
    overlay.style.display = 'none'; // hide the overlay
    opend_overlay = null;
    overlay.querySelector('iframe').remove();
    let newiframe = document.createElement('iframe');
    newiframe.src = '#';
    overlay.appendChild(newiframe);
}