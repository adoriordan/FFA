
window.addEventListener('DOMContentLoaded', () => {
    const sheet_key = '1z_gwSbVnzwlKHi4CPJ0UMVjRERR2D15jgcId5agQTEU';
    const page_num = '1';
    const endpoint = `https://spreadsheets.google.com/feeds/cells/${sheet_key}/${page_num}/public/full?alt=json`;

    fetch(endpoint)
    .then((resp) => resp.json())
    .then(data_loaded)
    .catch(fetch_failed);
});

//////////////////////////////////////
//////////////////////////////////////

function fetch_failed(err) {
    alert(err);
}

function data_loaded(data) {
    console.log(data);
}

