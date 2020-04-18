
function csv_loaded(data) {
    //document.write(data);
    console.log(data);
}

function fetch_failed(err) {
    console.log(err);
    document.write(err)
}

window.addEventListener('DOMContentLoaded', () => {
    fetch('farm_data.csv')
    .then((resp) => resp.text())
    .then(csv_loaded)
    .catch(fetch_failed);
});

//////////////////////////////////////
//////////////////////////////////////


