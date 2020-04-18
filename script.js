
/*
    Here we take the raw Google Sheet API data and filter
    out what we actually need.
    This is expected to be gross.
*/
function filter_json(raw) {
    // eliminate the google sheets cruft and get just the spreadsheet data
    const rough = raw.feed.entry.map(obj => obj['gs$cell'])

    // find out where in the sheet the data starts.
    var data_start = -1;
    for (var i = 0; i < rough.length; i++) {
        if (rough[i]['inputValue'] == 'SCHEMA') {
            const p = parseInt(rough[i]['row'], 10);
            if (p == NaN) { 
                throw "SCHEMA cell has no row? that shouldn't happen";
            }
            // the next row is the schema
            // the one after is the start of data
            data_start = p + 2;
        }
    }
    if (data_start == -1) {
        throw "Could not parse google sheets data. Make sure the SCHEMA is correct";
    }

    var clean_data = [];
    for (var i = 0; i < rough.length; i++) {

    }
    
    return rough;
}

window.addEventListener('DOMContentLoaded', () => {
    const sheet_key = '1z_gwSbVnzwlKHi4CPJ0UMVjRERR2D15jgcId5agQTEU';
    const page_num = '1';
    const endpoint = `https://spreadsheets.google.com/feeds/cells/${sheet_key}/${page_num}/public/full?alt=json`;

    fetch(endpoint)
    .then((resp) => resp.json())
    .then(filter_json)
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

