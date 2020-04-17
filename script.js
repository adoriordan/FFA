
function csv_loaded(data) {
    document.write(data);
}

window.addEventListener('DOMContentLoaded', () => {
    fetch('farm_data.csv')
    .then((resp) => resp.text())
    .then(csv_loaded);
});

