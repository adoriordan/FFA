
/*
    Here we take the raw Google Sheet API data and filter
    out what we actually need.
    This is expected to be gross.

    Yes, while this is technically an O(n) algorithm, I do
    loop over the list several times. This is to promote readability
    over speed.
*/
function filter_json(raw) {
    // eliminate the google sheets cruft and get just the spreadsheet data
    const rough = raw.feed.entry.map(obj => obj['gs$cell'])

    // find out where in the sheet the data starts and ends.
    var data_start = -1;
    var data_end = -1;
    for (var i = 0; i < rough.length; i++) {
        const row = parseInt(rough[i]['row'], 10);
        if (isNaN(row)) {
            console.error('NaN row in spreadsheet. This should be looked into');
        }

        if (data_start == -1 &&
            rough[i]['inputValue'] === 'SCHEMA') {
            // include the -1 check so we only pick up the first SCHEMA
            // entry. This allows us to have the literal word 'SCHEMA'
            // in the data.
            // the next row is the schema
            // the one after is the start of data
            data_start = row + 2;
        }

        // find the largest row value
        data_end = Math.max(data_end, row);

    }
    if (data_start == -1 || data_end == -1) {
        throw 'Could not parse Google Sheet. Cannot find start/end of data';
    }

    console.log(`Spreadsheet data spans rows: ${data_start} - ${data_end}`);

    // We now know how many records are the the spreadsheet
    const num_rows = (data_end - data_start) + 1;


    const data_cells = rough.filter((cell) => {
        const r = parseInt(cell['row'], 10);
        return r >= data_start && r <= data_end;
    });

    // !!!WARNING!!!
    // If you update the google sheets, you must update this.
    const column_field_map = {
        '1': 'zip',
        '2': 'name',
        '3': 'contact',
        '4': 'info'
    };

    const clean_data = new Array(num_rows);
    // Can't use Array.fill because it sets every element to the same reference
    for (var i = 0; i < clean_data.length; i++) { clean_data[i] = {}; }

    for (var i = 0; i < data_cells.length; i++) {
        const row = parseInt(data_cells[i]['row'], 10);
        if (isNaN(row)) {
            console.error('This really should be impossible because of the first NaN check we did at the top');
            continue;
        }
        // find the 0 based index into the clean_data array
        // ie: based on the spreadsheet row, which record are we
        // actually looking at?
        const idx = row - data_start;

        // Find out what field of this record we are looking at
        const col = data_cells[i]['col'];
        const key_name = column_field_map[col] || 'errorKey';

        // money shot: populate the field with its value
        clean_data[idx][key_name] = data_cells[i]['inputValue'];
    }
    
    return clean_data;
}

window.addEventListener('DOMContentLoaded', () => {
    const sheet_key = '1z_gwSbVnzwlKHi4CPJ0UMVjRERR2D15jgcId5agQTEU';
    const page_num = '1';
    const endpoint = `https://spreadsheets.google.com/feeds/cells/${sheet_key}/${page_num}/public/full?alt=json`;

    fetch(endpoint)
    .then(resp => resp.json())
    .then(filter_json)
    .then(data_loaded)
    .then(initialze_dom)
    .catch(fetch_failed);

});

function initialze_dom() {
    document.getElementById('search-results').appendChild(
        brew('div', 'Enter a zip code or click "Show All Data"', '')
    );
    document.getElementById('search-button')
            .addEventListener('click', () => {
        search_data(document.getElementById('search-term').value);
    });
    document.getElementById('all-data-button')
            .addEventListener('click', () => {
        // empty = all results
        search_data('');
    });
    document.getElementById('search-term')
            .addEventListener('keyup', e => {
        if (e.key == 'Enter') {
            search_data(document.getElementById('search-term').value);
        }
    });

    // TODO: kick things off by showing all data?
}

//////////////////////////////////////
////////// Application Logic /////////
//////////////////////////////////////

function fetch_failed(err) {
    alert(err);
}

function data_loaded(data) {
    console.log('Data has loaded:');
    console.log(data);
    FARM_DATA = data;
}
var FARM_DATA = {};

function search_data(search_term) {
    search_term = search_term.trim();
    console.log(`Searching for term: ${search_term}`);
    // No term = show all data
    if (search_term == '') {
        render_data(FARM_DATA);
    } else {
        // TODO: support for more than just zip code searching
        render_data(
            FARM_DATA.filter(f => f.zip == search_term)
        );
    }
}


//////////////////////////////////////
////////// DOM Manipulation //////////
//////////////////////////////////////

function render_data(farms) {
    const result_elem = document.getElementById('search-results');
    // clear all current results
    while (result_elem.firstChild) {
        result_elem.firstChild.remove();
    }
    // populate with new results
    farms.forEach(d => result_elem.appendChild(create_cell(d)));
}

function create_cell(record) {
    const container = document.createElement('div');
    container.classList.add('record');
    container.appendChild(brew('div', record.name, 'name'));
    container.appendChild(brew('div', record.zip, 'zipcode'));
    container.appendChild(brew('p', record.contact, 'contact'));
    container.appendChild(brew('p', record.info, 'info'));
    return container;
}

// brew('div', 'Zip Code', 'zip.red.large')
function brew(element, text, classes) {
    const dom = document.createElement(element);
    dom.appendChild(document.createTextNode(text));
    if (classes != '') classes.split('.').forEach(c => dom.classList.add(c));
    return dom;
}



