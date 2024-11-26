const HOME_VIEW = 0;
const BROWSE_VIEW = 1;
// Randall's API
const DOMAIN = "https://www.randyconnolly.com/funwebdev/3rd/api/f1"

document.addEventListener("DOMContentLoaded", () => {
    // Favourites localStorage
    if (localStorage.getItem("Drivers-f")) {
        // they're already there!
    } else {
        let favourites = [];
        let value = JSON.stringify(favourites);
        localStorage.setItem("Drivers-f", value);
        localStorage.setItem("Constructors-f", value);
        localStorage.setItem("Circuits-f", value);
    }

    // configure loading animation
    const anim = lottie.loadAnimation({
        container: document.querySelector("#loading-animation"),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'images/load.json'
    });

    // Select Season changes to DOM
    const selSeason = document.querySelector("#seasons")
    selSeason.addEventListener("change", async () => {
        const races_url = `${DOMAIN}/races.php?season=`;
        const results_url = `${DOMAIN}/results.php?season=`;
        const qualifying_url = `${DOMAIN}/qualifying.php?season=`;
        const url = [races_url, results_url, qualifying_url];

        await fetchDataGroup(url, selSeason.value);
        switchView(BROWSE_VIEW);
        displayBrowseData(JSON.parse(localStorage.getItem(selSeason.value + "_races")));

        selSeason.value = "";
    });

    const home_btn = document.querySelector("button");
    home_btn.addEventListener("click", () => switchView(HOME_VIEW));

    const fav_list = document.querySelector("#favourites");
    fav_list.addEventListener("click", () => openFavourites());
});

// CONTEXT uses HOME_VIEW and BROWSE_VIEW global variables
function switchView (CONTEXT) {
    const browse_elements = document.querySelectorAll("#browse");
    // Display BROWSE_VIEW
    if (CONTEXT) {
        document.querySelector("#home").classList.add("hidden");
        for (let element of browse_elements) {
            element.classList.remove("hidden");
        }
    } else {
    // Display HOME_VIEW
        for (let element of browse_elements) {
            element.classList.add("hidden");
        }
        // reset result and qualifying information
        document.querySelector("#dual-info").innerHTML = "";

        document.querySelector("#home").classList.remove("hidden");
    }
}

// Displays list of races as well as a button to view them
function displayBrowseData(data) {
    const sect = document.querySelector("#races-list");
    sect.innerHTML = "";

    const table_holder = document.createElement("div");

    const header = document.createElement("h1");
    header.textContent = data[0].year + " Races";
    header.className = "text-2xl font-bold";
    sect.appendChild(header);

    const arr = [];

    // data divs
    data.forEach(race => {
        arr.push([
            race.round,
            race.name,
            "Results"
        ])
    })

    const race_table = document.createElement("table");
    const headers = ["Rnd", "Race", "Results"];
    createTable(race_table, headers, arr, data);
    table_holder.className = "overflow-y-auto max-h-[575px] w-full";
    race_table.className += "table-auto border-collapse w-full";
    // race_table.className = "table-auto border-collapse w-full";
    table_holder.appendChild(race_table);
    sect.appendChild(table_holder);
}

// Calls functions to display the relevant race data
function displayData(e) {
    const header = document.querySelector("#dual-header");
    header.innerHTML = "";
    header.textContent = e.target.dataset.name + " Results";

    const info_holder = document.querySelector("#dual-info");
    info_holder.innerHTML = "";

    displayQualifyingData(e);
    displayResultsData(e);
}

// Displays qualifying data
function displayQualifyingData(e) {
    const sect_cont = document.querySelector("#dual-info");
    const sect = document.createElement("section");
    sect.className = "flex-auto";
    sect.innerHTML = "";

    const data = JSON.parse(localStorage.getItem(e.target.dataset.year + "_qualifying"));
    const race_data = data.filter(race_id => race_id.race.id === parseInt(e.target.dataset.id));

    // collecting data to make a table
    const arr = [];

    race_data.forEach(qual => {
        arr.push([
            qual.position,
            qual.driver.forename + " " + qual.driver.surname,
            qual.constructor.name,
            qual.q1,
            qual.q2,
            qual.q3
        ])
    })

    // making a table!
    const qual_tb = document.createElement("table");
    const headers = ["Pos", "Driver", "Const", "Q1", "Q2", "Q3"];
    createTable(qual_tb, headers, arr, race_data);
    sect.appendChild(qual_tb);
    sect.className = "overflow-y-auto max-h-[575px] w-full";
    sect_cont.appendChild(sect);
}

// Displays results data
function displayResultsData(e) {
    const sect_cont = document.querySelector("#dual-info");
    const sect = document.createElement("section");
    sect.className = "flex-auto";
    sect.innerHTML = "";

    const data = JSON.parse(localStorage.getItem(e.target.dataset.year + "_results"));
    const race_data = data.filter(race_id => race_id.race.id === parseInt(e.target.dataset.id));

    // show the top 3
    const ol = document.createElement("ol");

    for (let i = 0; i < 3; i++) {
        const li = document.createElement("li");
        let place_string;
        let color_string;

        switch (i) {
            case 0:
                place_string = "st Place: ";
                color_string = "bg-amber-500 ";
                break;
            case 1:
                place_string = "nd Place: ";
                color_string = "bg-slate-700";
                break;
            case 2:
                place_string = "rd Place: ";
                color_string = "bg-orange-500";
                break;
        }

        li.textContent = (i+1) + place_string + race_data[i].driver.forename + " " +
            race_data[i].driver.surname;
        li.className = `${color_string} px-4 py-2 rounded-lg text-center uppercase`;
        li.style.borderRadius = "25px 25px 50px 0px";
        
        ol.appendChild(li);
    }
    sect.appendChild(ol);

    // collecting data to make a table
    const arr = [];

    race_data.forEach(res => {
        arr.push([
            res.position,
            res.driver.forename + " " + res.driver.surname,
            res.constructor.name,
            res.laps,
            res.points
        ]);
    })

    // making a table!
    const res_tb = document.createElement("table");
    const headers = ["Pos", "Driver", "Const", "Laps", "Pts"];
    createTable(res_tb, headers, arr, race_data);
    sect.appendChild(res_tb);
    sect.className = "overflow-y-auto max-h-[575px] w-full";
    sect_cont.appendChild(sect);
}

function circuitInfo(circuit_id) {
    const url = `${DOMAIN}/circuits.php?id=${circuit_id}`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json() 
            } else
                throw new Error("fetch failed!")
            })
        .then(data => {
            // get the circuit info
            const circuit_info = [data.name, data.location, data.country, data.url];
            
            // start creating pop up
            circuitModal(circuit_info);
        })
        .catch(err => console.log("oopsie", err));
}

function driverInfo(driver_ref, race_data) {
    const url = `${DOMAIN}/drivers.php?ref=${driver_ref}`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json() 
            } else
                throw new Error("fetch failed!")
            })
        .then(data => {
            // Found this really funny one-liner on Stack Overflow by Lucas Janon: https://stackoverflow.com/questions/4060004/calculate-age-given-the-birth-date-in-the-format-yyyymmdd
            const getAge = birthDate => Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10)
            // get the driver info
            const driver_info = [data.forename, data.surname, data.dob,
                getAge(data.dob), data.nationality, data.url];
            
            // start creating pop up
            driverPopUp(driver_ref, race_data, driver_info);
        })
        .catch(err => console.log("oopsie", err));
}

// Handles driver information to give to modal
function driverPopUp(driver_ref, race_data, driver_info) {
    const season = race_data[0].race.year;
    const url = `${DOMAIN}/driverResults.php?driver=${driver_ref}&season=${season}`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json() 
            } else
                throw new Error("fetch failed!")
            })
        .then(data => {
            const arr = [];

            data.forEach(driver => {
                arr.push([
                    driver.round,
                    driver.name,
                    driver.positionOrder,
                ])
            })

            // make a table, of course!
            const driver_table = document.createElement("table");
            const headers = ["Rnd", "Race ", "Pos"];
            createTable(driver_table, headers, arr, data);

            displayModal(driver_info, driver_table, true);
        })
        .catch(err => console.log("oopsie", err));
}

function constructorInfo(const_ref, race_data) {
    const url = `${DOMAIN}/constructors.php?ref=${const_ref}`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json() 
            } else
                throw new Error("fetch failed!")
            })
        .then(data => {
            // get the constructor info
            const const_info = [data.name, data.nationality, data.url];
            
            // start creating pop up
            constructorPopUp(const_ref, race_data, const_info);
        })
        .catch(err => console.log("oopsie", err));
}

// Handles constructor information to give to modal
function constructorPopUp(const_ref, race_data, const_info) {
    const season = race_data[0].race.year;
    const url = `${DOMAIN}/constructorResults.php?constructor=${const_ref}&season=${season}`;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json() 
            } else
                throw new Error("fetch failed!")
            })
        .then(data => {
            const arr = [];

            data.forEach(constructor => {
                arr.push([
                    constructor.round,
                    constructor.name,
                    constructor.forename + " " + constructor.surname,
                    constructor.positionOrder
                ])
            })

            // make a table, of course!
            const const_table = document.createElement("table");
            const headers = ["Rnd", "Race ", "Driver ", "Pos"];
            createTable(const_table, headers, arr, data);

            displayModal(const_info, const_table, false);
        })
        .catch(err => console.log("oopsie", err));
}

// Displays default modal, should work for constructors and drivers
function displayModal(info, table, isDriver) {
    // set up modal shennanigans
    const modal = document.querySelector("#modal-default");
    const modal_cont = document.querySelector('#modal-content');
    modal_cont.innerHTML = "";
    const close_modal = document.querySelector("#close-modal");
    // toggle hidden
    modal.classList.remove("hidden");
    close_modal.addEventListener("click", () => {
        modal.classList.add("hidden");
    })

    const header = document.createElement("h1");
    let object = isDriver ? 'Driver' : 'Constructor';
    header.textContent = `${object} Details`;
    header.className = "text-3xl font-bold text-center";
    modal_cont.appendChild(header);

    // dual div to hold info and table
    const dual_div = document.createElement("div");

    // information description headers
    let info_desc = isDriver ?
        ["Forename", "Surname", "DOB", "Age", "Nationality"] :
        ["Constructor", "Nationality"]

    // div to hold info
    const info_div = document.createElement("div");
    info.forEach((item, index) => {
        if (index === info.length - 1) {
            // Url
            const a = document.createElement("a");
            a.href = item;
            a.textContent = "More Info";
            a.className = "italic";
            info_div.appendChild(a);
        } else {
            // Regular information
            const reg_div = document.createElement("div");

            reg_div.textContent += info_desc[index] + ": ";
            reg_div.textContent += item + ", ";

            info_div.appendChild(reg_div);
        }
    })
    // Add Placeholder image
    const img_div = document.createElement("div");

    const placeholder_img = document.createElement("img");
    // Place holder image from https://placeholderimage.dev/
    placeholder_img.src = "data:image/png;base64,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";
    placeholder_img.alt = "Placeholder Image";

    // Append the image to the image div
    img_div.appendChild(placeholder_img);
    // Append the image div to the info div
    info_div.appendChild(img_div);
    // Add info_div to dual_div
    info_div.className = "flex flex-col w-1/3";
    dual_div.appendChild(info_div);

    // div to hold the table
    const table_holder = document.createElement("div");
    table_holder.className = "overflow-y-auto max-h-[60vh] w-2/3 overflow-x-auto";
    table_holder.appendChild(table);
    dual_div.appendChild(table_holder);

    // add info and table to the modal content
    dual_div.className = "flex justify-between items-start w-full space-x-8";
    modal_cont.appendChild(dual_div);

    let key = object + "s-f";
    cur_list = JSON.parse(localStorage.getItem(key));
    let name = "";
    name = key === "Drivers-f"? info[0] + " " + info[1] : info[0];

    const isFav = cur_list.includes(name);

    // dynamic favourite button
    const fav_btn = document.createElement("button");
    fav_btn.className = isFav ?
    "bg-purple-500 text-white px-4 py-2 rounded absolute bottom-4 left-4" :
    "bg-pink-500 text-white px-4 py-2 rounded absolute bottom-4 left-4";

    fav_btn.textContent = isFav ? "Remove from Favourites" : "Add to Favourites";

    fav_btn.addEventListener( "click", () => {
        if (isFav) {
            removeFromFav(cur_list, key, name);
            fav_btn.textContent = "Add to Favourites";
            fav_btn.className = "bg-pink-500 text-white px-4 py-2 rounded absolute bottom-4 left-4";
        } else {
            addToFav(cur_list, key, name);
            fav_btn.textContent = "Remove from Favourites";
            fav_btn.className = "bg-purple-500 text-white px-4 py-2 rounded absolute bottom-4 left-4";
        }
    })

    modal_cont.appendChild(fav_btn);
}

// Displays circuit modal
function circuitModal(info) {
    // set up modal shennanigans
    const modal = document.querySelector("#modal-default");
    const modal_cont = document.querySelector('#modal-content');
    modal_cont.innerHTML = "";
    const close_modal = document.querySelector("#close-modal");
    // toggle hidden
    modal.classList.remove("hidden");
    close_modal.addEventListener("click", () => {
        modal.classList.add("hidden");
    })

    const header = document.createElement("h1");
    header.textContent = `Circuit Details`;
    header.className = "text-3xl font-bold text-center";
    modal_cont.appendChild(header);

    // dual div to hold info and img
    const dual_div = document.createElement("div");

    // Add Placeholder image
    const img_div = document.createElement("div");
    const placeholder_img = document.createElement("img");
    // Place holder image from https://placeholderimage.dev/
    placeholder_img.src = "data:image/png;base64,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";
    placeholder_img.alt = "Placeholder Image";
    // Append the image to the image div
    img_div.appendChild(placeholder_img);
    dual_div.appendChild(img_div);

    // information description headers
    let info_desc = ["Name", "Location", "Country"];

    // div to hold info
    const info_div = document.createElement("div");
    info.forEach((item, index) => {
        if (index === info.length - 1) {
            // Url
            const a = document.createElement("a");
            a.href = item;
            a.textContent = "More Info";
            a.className = "italic";
            info_div.appendChild(a);
        } else {
            // Regular information
            const reg_div = document.createElement("div");

            reg_div.textContent += info_desc[index] + ": ";
            reg_div.textContent += item + ", ";

            info_div.appendChild(reg_div);
        }
    })

    info_div.className = "flex flex-col";
    dual_div.appendChild(info_div);
    dual_div.className = "flex flex-row";
    // Add information and img to the modal
    modal_cont.appendChild(dual_div);

    let key = "Circuits-f";
    cur_list = JSON.parse(localStorage.getItem(key));
    let name = info[0];

    const isFav = cur_list.includes(name);

    // dynamic favourite button
    const fav_btn = document.createElement("button");
    fav_btn.className = isFav ?
    "bg-purple-500 text-white px-4 py-2 rounded absolute bottom-4 left-4" :
    "bg-pink-500 text-white px-4 py-2 rounded absolute bottom-4 left-4";

    fav_btn.textContent = isFav ? "Remove from Favourites" : "Add to Favourites";

    fav_btn.addEventListener( "click", () => {
        if (isFav) {
            removeFromFav(cur_list, key, name);
            fav_btn.textContent = "Add to Favourites";
            fav_btn.className = "bg-pink-500 text-white px-4 py-2 rounded absolute bottom-4 left-4";
        } else {
            addToFav(cur_list, key, name);
            fav_btn.textContent = "Remove from Favourites";
            fav_btn.className = "bg-purple-500 text-white px-4 py-2 rounded absolute bottom-4 left-4";
        }
    })

    modal_cont.appendChild(fav_btn);
}

// save favourite to localStorage
function addToFav(fav_list, key, name) {
    fav_list.push(name);
    localStorage.setItem(key, JSON.stringify(fav_list));
}

// remove driver/contructor from localStorage
function removeFromFav(fav_list, key, name) {
    const index = fav_list.indexOf(name);
    fav_list.splice(index, 1);
    localStorage.setItem(key, JSON.stringify(fav_list));
}

// Get list of favourites
function openFavourites() {
    // set up modal shennanigans
    const modal = document.querySelector("#modal-fav");
    const close_modal = document.querySelector("#close-fav");
    // toggle hidden
    modal.classList.remove("hidden");
    close_modal.addEventListener("click", () => {
        modal.classList.add("hidden");
    })

    // Favourite drivers list
    const d_list = document.querySelector("#drivers-list");
    d_list.innerHTML = "<h1 class=\"font-bold text-xl\">Drivers</h1>";
    const ul = document.createElement("ul");
    const drivers = JSON.parse(localStorage.getItem("Drivers-f"));
    drivers.forEach(driver => {
        const li = document.createElement("li");
        li.textContent = driver;
        ul.appendChild(li);
    })
    d_list.appendChild(ul);

    // Favourite constructors list
    const c_list = document.querySelector("#constructors-list");
    c_list.innerHTML = "<h1 class=\"font-bold text-xl\">Constructors</h1>";
    const ul2 = document.createElement("ul");
    const constructors = JSON.parse(localStorage.getItem("Constructors-f"));
    constructors.forEach(constructor => {
        const li = document.createElement("li");
        li.textContent = constructor;
        ul2.appendChild(li);
    })
    c_list.appendChild(ul2);

    // Favourite circuits list
    const r_list = document.querySelector("#circuits-list");
    r_list.innerHTML = "<h1 class=\"font-bold text-xl\">Circuits</h1>";
    const ul3 = document.createElement("ul");
    const circuits = JSON.parse(localStorage.getItem("Circuits-f"));
    circuits.forEach(circuit => {
        const li = document.createElement("li");
        li.textContent = circuit;
        ul3.appendChild(li);
    })
    r_list.appendChild(ul3);
}

// Create table to display data nicely
function createTable(table, headers, metadata, data) {
    // generate the headers
    const head = table.createTHead();
    head.className = "text-white uppercase tracking-wide";
    const row = head.insertRow();

    headers.forEach((header, index) => {
        const th = document.createElement("th");
        th.className = "px-4 py-2 font-semibold text-center";
        th.textContent = header;
        th.addEventListener("click", () => resortResults(table, index));
        th.className = "cursor-pointer";
        row.appendChild(th);
    })

    // Get index of specific columns
    const view_btn = headers.indexOf("Results");
    const driver_index = headers.indexOf("Driver");
    const const_index = headers.indexOf("Const");
    const circuit_index = headers.indexOf("Race");

    // Get list of favourites
    const d_fav = JSON.parse(localStorage.getItem("Drivers-f"));
    const c_fav = JSON.parse(localStorage.getItem("Constructors-f"));
    const r_fav = JSON.parse(localStorage.getItem("Circuits-f"));

    // generate rows of data
    metadata.forEach((r_data, count) => {
        const row_n = table.insertRow();
        r_data.forEach((arr, index) => {
            const cell = row_n.insertCell();
            cell.textContent = arr;

            // "Results" button logic
            if (index === view_btn) {
                cell.className = "cursor-pointer bg-yellow-500 px-4 py-2 rounded-lg";
                cell.style.borderRadius = "25px 25px 50px 0px";
                cell.dataset.id = data[count].id;
                cell.dataset.name = data[count].name;
                cell.dataset.year = data[count].year;
                cell.addEventListener("click", displayData);
            }

            // "Circuit" pop-up and favourite check
            if (index === circuit_index) {
                cell.addEventListener("click", () => circuitInfo(data[count].circuit.id));
                cell.className = "cursor-pointer italic";

                if (r_fav.includes(data[count].circuit.name))
                    cell.classList.add("text-pink-500");
            }

            // "Driver" pop-up and favourite check
            if (index === driver_index) {
                cell.addEventListener("click", () => driverInfo(data[count].driver.ref, data));
                cell.className = "cursor-pointer italic";

                if (d_fav.includes(data[count].driver.forename + " " + data[count].driver.surname))
                    cell.classList.add("text-pink-500");
            }

            // "Constructor" pop-up and favourite check
            if (index === const_index) {
                cell.addEventListener("click", () => constructorInfo(data[count].constructor.ref, data));
                cell.className = "cursor-pointer italic";

                if (c_fav.includes(data[count].constructor.name))
                    cell.classList.add("text-pink-500");
            }

            cell.classList.add("text-center");
            cell.classList.add("px-4");
            cell.classList.add("py-2");
        })
    })


}

// Used for alphabetical, numerical, and ascending/descending help:
// https://www.geeksforgeeks.org/how-to-sort-rows-in-a-table-using-javascript/
// https://stackoverflow.com/questions/14267781/sorting-html-table-with-javascript
function resortResults(table, colIndex) {
    let sort_cont = true;
    
    // Determine current sort direction
    const isAscending = table.dataset.sortOrder === "asc";
    table.dataset.sortOrder = isAscending ? "desc" : "asc";

    while (sort_cont) {
        sort_cont = false;
        const rows = Array.from(table.rows);
        // let still_switch = false;

        for (i = 1; i < (rows.length - 1); i++) {
            // should we keep switching?
            // still_switch = false;

            // compare this element and the next
            let r1 = rows[i].cells[colIndex];
            let r2 = rows[i + 1].cells[colIndex];

            let compare;

            // should they switch?
            // check if number
            if (!isNaN(r1.textContent) && !isNaN(r2.textContent))
                compare = parseFloat(r1.textContent) - parseFloat(r2.textContent);
            else
                // string compare because it is not a number
                compare = r1.textContent.toLowerCase().localeCompare(r2.textContent.toLowerCase());

            // swap the rows to be ascending or descending
            if (isAscending ? compare > 0 : compare < 0) {
                // still_switch = true;
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                sort_cont = true;
            }
        }
    }
}

// fetching the races, results, and qualifying information
async function fetchDataGroup(url, year) {
    // load as the user waits
    const load_overlay = document.querySelector("#loading-overlay");
    load_overlay.classList.remove("hidden");

    if (localStorage.getItem(year + "_races")) {
        // already have it
        load_overlay.classList.add("hidden");
    } else {
        // Fetch data and store in localStorage
        // Fetch all data from season
        await Promise.all([
            fetch(url[0] + year)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch races");
                    }
                    return response.json();
                })
                .then(data => localStorage.setItem(year + "_races", JSON.stringify(data)))
                .catch(err => console.error(err)),
            
            fetch(url[1] + year)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch results");
                    }
                    return response.json();
                })
                .then(data => localStorage.setItem(year + "_results", JSON.stringify(data)))
                .catch(err => console.error(err)),
            
            fetch(url[2] + year)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch qualifying");
                    }
                    return response.json();
                })
                .then(data => localStorage.setItem(year + "_qualifying", JSON.stringify(data)))
                .catch(err => console.error(err))
        ])
        .then(() => {
            // finished fetching
            load_overlay.classList.add("hidden");
        })
        .catch(err => {
            console.error(err);
            load_overlay.classList.add("hidden");
        });
    }
}