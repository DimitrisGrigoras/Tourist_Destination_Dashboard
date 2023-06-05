let forecast_table = [];
let unit = "";
let isForecastDataAppended = false;

function removeHidden() {
  const form = document.querySelector("form");
  if (form.checkValidity()) {
    const elements = document.querySelectorAll(".d-none");
    elements.forEach((element) => {
      element.classList.remove("d-none");
    });
  }
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

function get_lat_lon(event) {
  const xhr = new XMLHttpRequest();

  const form = document.querySelector("form");
  const InputAddress = form.querySelector("#InputAddress").value;
  const InputRegion = form.querySelector("#InputRegion").value;
  const InputCity = form.querySelector("#InputCity").value;

  const query = `${InputAddress}, ${InputRegion}, ${InputCity}`;
  console.log(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json`;

  xhr.onreadystatechange = async function () {
    // Only run if the request is complete
    if (xhr.readyState !== 4) return;
    // Process our return data
    if (xhr.status >= 200 && xhr.status < 300) {
      // What to do when the request is successful
      const response = JSON.parse(xhr.responseText);
      if (response.length === 0) {
        // Empty response
        const toHideElements = document.querySelectorAll(".to_hide");
        toHideElements.forEach((element) => {
          element.classList.add("d-none");
        });
        await delay(500);
        alert(`No result for that location.\n${query}`);
        event.stopPropagation();
        return;
      } else {
        save_to_db();
        const lat = response[0].lat;
        const lon = response[0].lon;
        getWeather(lat, lon);
        getForecast(lat, lon);
        removeHidden();
        // find_attractions();
        create_carouzel(InputCity);
      }
    } else {
      // What to do when the request has failed
      console.log("error", xhr);
    }
  };

  xhr.open("GET", url);
  xhr.send();
}

function fill_tab_table(id, text) {
  const fg = document.getElementById(id);
  fg.textContent = text;
}

function convert_24_hour(date) {
  const hours = date.getHours().toString().padStart(2, "0"); // Get hours and pad with leading zero if needed
  const minutes = date.getMinutes().toString().padStart(2, "0"); // Get minutes and pad with leading zero if needed
  return `${hours}:${minutes}`; // Return formatted time
}

function fill_first_tab(response, unit) {
  if (unit === "metric") {
    m_unit_deg = "C";
    m_unit_pres = "hPa";
    m_unit_W_s = "meters/second";
  } else {
    m_unit_deg = "F";
    m_unit_pres = "Mb";
    m_unit_W_s = "miles/hour";
  }

  const pressure = parseInt(response.main.pressure);
  fill_tab_table("add_press", `${pressure} ${m_unit_pres}`);

  const humidity = response.main.humidity;
  fill_tab_table("add_hum", `${humidity}%`);

  const wind_speed = response.wind.speed;
  fill_tab_table("add_wind", `${wind_speed} ${m_unit_W_s}`);

  const cloud_cover = response.clouds.all;
  fill_tab_table("add_cloud", `${cloud_cover}%`);

  const sunrise = new Date(response.sys.sunrise * 1000);
  fill_tab_table("add_sunr", convert_24_hour(sunrise));

  const sunset = new Date(response.sys.sunset * 1000);
  fill_tab_table("add_suns", convert_24_hour(sunset));
  // -----------------------------------------------------------------------
  const icon = response.weather[0].icon;
  const img_place = document.querySelector("#id_icon");
  const existing_img = img_place.querySelector("img");
  if (existing_img) {
    existing_img.src = `https://openweathermap.org/img/w/${icon}.png`;
  } else {
    const img = document.createElement("img");
    img.src = `https://openweathermap.org/img/w/${icon}.png`;
    img.alt = "icon for weather right now";
    // set image width and height
    img.style.width = "100px";
    img.style.height = "100px";
    img_place.appendChild(img);
  }
  // -----------------------------------------------------------------------
  const description = response.weather[0].description;
  const name = response.name;
  fill_tab_table("id_descr", `${description} in ${name}`);

  const temperature = response.main.temp;
  const place_temp = document.getElementById("id_temp");
  place_temp.textContent = `${temperature} ${String.fromCharCode(
    176
  )}${m_unit_deg}`;

  const low_high = document.querySelector("#id_low_high");

  const spanElements = low_high.getElementsByTagName("span");

  // Loop through all the span elements and remove them
  for (let i = spanElements.length - 1; i >= 0; i--) {
    spanElements[i].parentNode.removeChild(spanElements[i]);
  }

  const temp_min = response.main.temp_min;
  const temp_max = response.main.temp_max;

  const span1 = document.createElement("span");
  const span2 = document.createElement("span");
  const span3 = document.createElement("span");

  span1.id = "id_low";
  span2.id = "id_ver";
  span3.id = "id_high";

  span1.textContent = `L: ${temp_min} ${String.fromCharCode(
    176
  )}${m_unit_deg} `;
  span1.style.color = "blue";

  span2.textContent = " | ";
  span2.style.color = "black";

  span3.textContent = `H: ${temp_max} ${String.fromCharCode(
    176
  )}${m_unit_deg} `;
  span3.style.color = "green";
  low_high.appendChild(span1);
  low_high.appendChild(span2);
  low_high.appendChild(span3);
}

function forecast_data(row_id, data) {
  const col = document.createElement("td");
  col.classList.add("center_col_vh", "font_size_forecast");
  const row = document.querySelector(row_id);
  col.textContent = data;
  const referenceElement = row.children[0];
  row.insertBefore(col, referenceElement);
}

function forecast_data_icon(row_id, data) {
  const col = document.createElement("td");
  col.classList.add("center_col_vh");
  const row = document.querySelector(row_id);
  const img = document.createElement("img");
  img.src = `https://openweathermap.org/img/w/${data}.png`;
  img.classList.add("font_size_forecast_icon");
  col.appendChild(img);
  const referenceElement = row.children[0];
  row.insertBefore(col, referenceElement);
}

function fill_second_tab(response, unit) {
  if (unit === "metric") {
    m_unit_deg = "C";
    m_unit_pres = "hPa";
    m_unit_W_s = "meters/second";
  } else {
    m_unit_deg = "F";
    m_unit_pres = "Mb";
    m_unit_W_s = "miles/hour";
  }
  forecast_table.length = 0;

  for (let i = 0; i < 8; i++) {
    forecast_table.push({
      dt: response.list[i].dt,
      dt_formatted: convert_24_hour(new Date(response.list[i].dt * 1000)),
      temp: response.list[i].main.temp,
      pressure: response.list[i].main.pressure,
      humidity: response.list[i].main.humidity,
      main: response.list[i].weather[0].main,
      description: response.list[i].weather[0].description,
      icon: response.list[i].weather[0].icon,
      cloud_cover: response.list[i].clouds.all,
      speed: response.list[i].wind.speed,
      name: response.city.name,
    });
  }
  console.log(forecast_table);
  if (isForecastDataAppended) {
    // Clear the previous data
    for (let i = 0; i < 8; i++) {
      const row = document.querySelector("#row" + i);
      const tds = row.querySelectorAll("td");
      for (let j = 0; j < tds.length - 1; j++) {
        const td = tds[j];
        row.removeChild(td);
      }
    }
  }

  for (let i = 0; i < 8; i++) {
    forecast_data("#row" + i, `${forecast_table[i].cloud_cover}%`);
    forecast_data(
      "#row" + i,
      `${forecast_table[i].temp} ${String.fromCharCode(176)}${m_unit_deg}`
    );
    forecast_data_icon("#row" + i, forecast_table[i].icon);
    forecast_data("#row" + i, forecast_table[i].dt_formatted);
  }

  isForecastDataAppended = true;
}

function getWeather(lat, lon) {
  const xhr = new XMLHttpRequest();
  const form = document.querySelector("form");
  const degree = form.querySelector('input[type="radio"]:checked').value;

  if (degree.toString() === "celcius") {
    unit = "metric";
  } else {
    unit = "imperial";
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}&units=${encodeURIComponent(
    unit
  )}&APPID=${encodeURIComponent("848680c04915e5f5cdbedf8e07e73b28")}`;

  xhr.onreadystatechange = function () {
    // Only run if the request is complete
    if (xhr.readyState !== 4) return;
    // Process our return data
    if (xhr.status >= 200 && xhr.status < 300) {
      // What to do when the request is successful
      const response = JSON.parse(xhr.responseText);
      if (response.length === 0) {
      } else {
        // console.log("Latitude:", lat);
        fill_first_tab(response, unit);
        add_map(lat, lon);
      }
    } else {
      // What to do when the request has failed
      console.log("error", xhr);
    }
  };
  xhr.open("GET", url);
  xhr.send();
}
// --------------------------------------------------------------------------------
function getForecast(lat, lon) {
  const xhr = new XMLHttpRequest();

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}&units=${encodeURIComponent(
    unit
  )}&APPID=${encodeURIComponent("848680c04915e5f5cdbedf8e07e73b28")}`;

  xhr.onreadystatechange = function () {
    // Only run if the request is complete
    if (xhr.readyState !== 4) return;
    // Process our return data
    if (xhr.status >= 200 && xhr.status < 300) {
      // What to do when the request is successful
      const response = JSON.parse(xhr.responseText);
      if (response.length === 0) {
      } else {
        // console.log("Latitude:", lat);
        fill_second_tab(response, unit);
      }
    } else {
      // What to do when the request has failed
      console.log("error", xhr);
    }
  };
  xhr.open("GET", url);
  xhr.send();
}

function find_attractions() {
  const xhr = new XMLHttpRequest();
  const url = "https://api.openai.com/v1/completions";
  const spinner = document.querySelector("#spinner");
  const form = document.querySelector("form");
  const InputRegion = form.querySelector("#InputRegion").value;
  const InputCity = form.querySelector("#InputCity").value;

  const header = document.querySelector("#card_header");
  header.textContent = `Attractions in ${InputCity}`;

  xhr.open("POST", url);

  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader(
    "Authorization",
    "Bearer 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"
  );
  console.log(
    `Give me the top 3 tourist's sights near the region ${InputRegion} in ${InputCity}, in unoccupied Cyprus, with a small description for each one.`
  );
  const params = {
    model: "text-davinci-003",
    prompt: `Give me the top 3 attractions near the region ${InputRegion} in ${InputCity}, Cyprus`,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      spinner.style.display = "none"; // hide spinner
      // create_carouzel(InputCity);
      if (xhr.status >= 200 && xhr.status < 300) {
        const openAIresponse = JSON.parse(xhr.responseText);
        const choices = openAIresponse.choices[0].text;
        const attractions = document.querySelector("#card_p");
        const attractionsArr = choices.split("\n");
        console.log(attractionsArr);
        const ul = document.createElement("ul");
        attractionsArr.forEach((attraction) => {
          if (attraction !== "") {
            const li = document.createElement("li");
            li.textContent = attraction.substring(3);
            li.style.paddingLeft = 0;
            li.textAlign = "Left";
            ul.appendChild(li);
          }
        });
        attractions.textContent = ""; // clear previous content
        attractions.appendChild(ul);
        // attractions.textContent = choices;
      } else {
        console.log("error", xhr);
      }
    }
  };

  xhr.send(JSON.stringify(params));
}

function searchBtn(event) {
  event.preventDefault(); // Prevent default form submission behavior
  const form = document.querySelector(".needs-validation");

  // Validate each input element in the form
  const inputs = form.querySelectorAll("input, select");
  let valid = true;
  inputs.forEach((input) => {
    if (input.value.trim() === "") {
      // Check if the input value is only spaces
      input.classList.add("is-invalid");
      valid = false;
    } else {
      input.classList.remove("is-invalid");
    }
  });

  if (!form.checkValidity() || !valid) {
    event.stopPropagation();
    return;
  }

  // Add the was-validated class to the form
  form.classList.add("was-validated");
  get_lat_lon(event);
}

function resetForm(event) {
  event.preventDefault(); // Prevent default form submission behavior

  const form = document.querySelector("form");

  form.reset();
  form.classList.remove("was-validated");

  const toHideElements = document.querySelectorAll(".to_hide");
  toHideElements.forEach((element) => {
    element.classList.add("d-none");
  });
}

function add_map(lat, lon) {
  const target = document.getElementById("map");
  if (
    target.hasChildNodes() &&
    target.firstChild.classList.contains("ol-viewport")
  ) {
    // A map already exists, so do nothing
    return;
  }

  var map = new ol.Map({
    // a map object is created
    target: "map", // the id of the div in html to contain the map
    layers: [
      // list of layers available in the map
      new ol.layer.Tile({
        // first and only layer is the OpenStreetMap tiled layer
        source: new ol.source.OSM(),
      }),
    ],
    view: new ol.View({
      // view allows to specify center, resolution, rotation of the map
      center: ol.proj.fromLonLat([lon, lat]), // center of the map
      zoom: 5, // zoom level (0 = zoomed out)
    }),
  });
  layer_temp = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=848680c04915e5f5cdbedf8e07e73b28",
    }),
  });

  layer_precipitation = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=848680c04915e5f5cdbedf8e07e73b28",
    }),
  });
  map.addLayer(layer_temp); // a temp layer on map
  map.addLayer(layer_precipitation); // a temp layer on map
}

function create_formatted_date(timestamp) {
  // Array of month names
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Convert timestamp to Date object
  const date = new Date(timestamp * 1000);

  // Format date as per requirement
  const formattedDate = `${date.getDate().toString().padStart(2, "0")} ${
    months[date.getMonth()]
  } ${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  return formattedDate;
}

function design_forecast_modal(df) {
  const row_num = parseInt(df) - 1;
  let title = `Weather in ${
    forecast_table[row_num].name
  } on ${create_formatted_date(forecast_table[row_num].dt)}`;
  let desc = `${forecast_table[row_num].main} (${forecast_table[row_num].description})`;
  fill_tab_table("exampleModalLabel", title);

  const img_place = document.querySelector("#modal_icon");

  // check if img_place already has a child element with the img tag
  const existingImg = img_place.querySelector("img");
  if (existingImg) {
    img_place.removeChild(existingImg); // remove the existing img element
  }
  const img = document.createElement("img");
  img.src = `https://openweathermap.org/img/w/${forecast_table[row_num].icon}.png`;
  img.alt = "icon forecast";
  img_place.appendChild(img); // append the new img element

  fill_tab_table("modal_desc", desc);

  if (unit === "metric") {
    m_unit_pres = "hPa";
    m_unit_W_s = "meters/second";
  } else {
    m_unit_pres = "Mb";
    m_unit_W_s = "miles/hour";
  }

  fill_tab_table("modal_hum", `${forecast_table[row_num].humidity}%`);
  fill_tab_table(
    "modal_pres",
    `${forecast_table[row_num].pressure} ${m_unit_pres}`
  );
  fill_tab_table(
    "modal_wi_sp",
    `${forecast_table[row_num].speed} ${m_unit_W_s}`
  );
}

function save_to_db() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      console.log(xhr.responseText);
    } else {
      console.log("error", xhr);
    }
  };
  xhr.open("POST", "./action_page.php");
  xhr.setRequestHeader("Content-Type", "application/json");
  const data = {};
  data.username = "dgrigo03";
  data.address = encodeURIComponent(
    document.querySelector("#InputAddress").value
  );
  data.region = document.querySelector("#InputRegion").value;
  data.city = document.querySelector("#InputCity").value;
  // data.time_now = create_formatted_date(Math.floor(Date.now() / 1000));
  console.log(data);
  xhr.send(JSON.stringify(data));
}

const form = document.querySelector(".needs-validation");
const submitBtn = form.querySelector("#search_button");
const resetBtn = form.querySelector("#reset-btn");

submitBtn.addEventListener("click", searchBtn);
resetBtn.addEventListener("click", resetForm);

function change_tab_style() {
  let btnrn = document.getElementById("right_now_tab");
  let btnn24h = document.getElementById("next_24_h_tab");

  let btnrn_aria_selected = btnrn.getAttribute("aria-selected");

  if (btnrn_aria_selected === "true") {
    if (
      btnrn.classList.contains("bg-white") &&
      btnrn.classList.contains("text-primary")
    ) {
    } else {
      btnrn.classList.replace("bg-primary", "bg-white");
      btnrn.classList.replace("text-white", "text-primary");
      btnn24h.classList.replace("bg-white", "bg-primary");
      btnn24h.classList.replace("text-primary", "text-white");
    }
  } else {
    if (
      btnn24h.classList.contains("bg-white") &&
      btnn24h.classList.contains("text-primary")
    ) {
    } else {
      btnn24h.classList.replace("bg-primary", "bg-white");
      btnn24h.classList.replace("text-white", "text-primary");
      btnrn.classList.replace("bg-white", "bg-primary");
      btnrn.classList.replace("text-primary", "text-white");
    }
  }
}

let Btn_R_N = document.querySelector("#right_now_tab");
let Btn_N_24_H = document.querySelector("#next_24_h_tab");
Btn_R_N.addEventListener("click", change_tab_style);
Btn_N_24_H.addEventListener("click", change_tab_style);

// ---------------------------------------------------------------------
function last_req_data(row_id, data) {
  const col = document.createElement("td");
  col.classList.add("center_col_vh", "modal_req_data");
  const row = document.querySelector(row_id);
  col.textContent = data;
  row.appendChild(col);
}

function design_last_req_modal(last_5_req) {
  // Remove existing rows
  for (let i = 0; i < 5; i++) {
    const row = document.querySelector(`#req_row${i}`);
    while (row.firstChild) {
      row.removeChild(row.firstChild);
    }
  }
  console.log(last_5_req);
  for (let i = 0; i < last_5_req[last_5_req.length - 1]; i++) {
    last_req_data(
      `#req_row${i}`,
      create_formatted_date(last_5_req[i].timestamp)
    );
    last_req_data(`#req_row${i}`, last_5_req[i].address);
    last_req_data(`#req_row${i}`, last_5_req[i].region);
    last_req_data(`#req_row${i}`, last_5_req[i].city);
  }
}

function get_last_req() {
  // Set up our HTTP request
  var xhr = new XMLHttpRequest();
  // Setup our listener to process completed requests
  xhr.onreadystatechange = function () {
    // Only run if the request is complete
    if (xhr.readyState !== 4) return;
    // Process our return data
    if (xhr.status >= 200 && xhr.status < 300) {
      design_last_req_modal(JSON.parse(xhr.responseText));
    } else {
      console.log("error", xhr);
    }
  };
  xhr.open("GET", "action_page.php");
  xhr.send();
}

const last_reqBtn = form.querySelector("#last_req-btn");
last_reqBtn.addEventListener("click", get_last_req);

function create_carouzel(city) {
  const title = document.getElementById("carousel_title");
  title.innerHTML = ""; // Clear previous contents of the title element

  const title_link = document.createElement("a");
  title_link.href = cyprusAttractions[city].link;
  title_link.textContent = `More attractions for ${city}...`;
  title_link.style.color = "white";
  title_link.target = "_blank"; // set target to open link in a new tab

  title.appendChild(title_link);

  for (let i = 1; i < 4; i++) {
    let div_sight = document.getElementById(`sight${i}`);
    div_sight.innerHTML = ""; // Clear previous contents of the div element

    const img = document.createElement("img");
    const link = document.createElement("a");
    const div = document.createElement("div");
    const h5 = document.createElement("h5");

    img.src = `./images/${city}${i}.jpg`;
    img.alt = cyprusAttractions[city][`${city}${i}`].name;
    img.classList.add("d-block", "w-100");

    link.href = cyprusAttractions[city][`${city}${i}`].website;
    link.target = "_blank"; // set target to open link in a new tab

    h5.textContent = cyprusAttractions[city][`${city}${i}`].name;
    h5.classList.add("h5_captions");
    div.classList.add("carousel-caption", "d-md-block");

    div.appendChild(h5);

    link.appendChild(img);
    div_sight.appendChild(link);
    div_sight.appendChild(div);
  }
}

const cyprusAttractions = {
  Limassol: {
    Limassol1: {
      name: "Ancient Kourion",
      website:
        "https://www.visitcyprus.com/index.php/en/discovercyprus/rural/sites-monuments/2402-kourion-archaeological-site",
    },
    Limassol2: {
      name: "Kykkos Monastery",
      website:
        "https://www.visitcyprus.com/index.php/en/discovercyprus/culture/sites-monuments/263-kykkos-monastery",
    },
    Limassol3: {
      name: "Limassol Marina",
      website:
        "https://www.limassolmarina.com/?gclid=Cj0KCQjwt_qgBhDFARIsABcDjOeD1J2_F9Wa7V5c4JZdveuPL8x4il2pn0tHhSdahEaOqluLeo7ZTNAaAj-kEALw_wcB",
    },
    link: "https://www.google.com/search?q=limassolattractions&sxsrf=APwXEdeusHvLJupObspb57E9_s74-9HPjQ%3A1679785653906&ei=tX4fZLn9NtGVxc8P2OSL-Aw&ved=0ahUKEwj5q8yZmfj9AhXRSvEDHVjyAs8Q4dUDCA8&uact=5&oq=limassolattractions&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQAzIGCAAQBxAeMggIABCKBRCGAzIICAAQigUQhgMyCAgAEIoFEIYDMggIABCKBRCGAzIICAAQigUQhgM6CggAEEcQ1gQQsAM6CggAEIoFELADEENKBAhBGABQlAZY-Q9gvxJoAnABeACAAZgBiAHUCJIBAzAuOJgBAKABAcgBCcABAQ&sclient=gws-wiz-serp",
  },
  Paphos: {
    Paphos1: {
      name: "Archaeological Site of the Tombs of the Kings",
      website:
        "https://www.visitcyprus.com/index.php/en/discovercyprus/culture/sites-monuments/253-tombs-of-the-kings",
    },
    Paphos2: {
      name: "Pafos Zoo",
      website: "https://www.pafoszoo.com/",
    },
    Paphos3: {
      name: "Paphos Castle",
      website:
        "https://www.visitcyprus.com/index.php/en/discovercyprus/culture/sites-monuments/245-pafos-paphos-castle",
    },
    link: "https://www.google.com/search?q=paphosattractions&sxsrf=APwXEdeAaQg9dR95qfkchstmhget_5wrWA%3A1679785753096&ei=GX8fZJbABfqJxc8Pvp-O6AQ&ved=0ahUKEwjWsPLImfj9AhX6RPEDHb6PA00Q4dUDCA8&uact=5&oq=paphosattractions&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQAzIGCAAQBxAeMgYIABAHEB4yBggAEAcQHjIGCAAQBxAeMggIABAIEAcQHjIICAAQCBAHEB4yCAgAEIoFEIYDMggIABCKBRCGAzIICAAQigUQhgMyCAgAEIoFEIYDOgQIABBHSgQIQRgAUMgGWNUQYJQSaABwA3gAgAGeAYgBtgaSAQMwLjaYAQCgAQHIAQjAAQE&sclient=gws-wiz-serp",
  },
  Famagusta: {
    Famagusta1: {
      name: "Ayia Napa Marina",
      website:
        "https://www.marinaayianapa.com/?gclid=Cj0KCQjwt_qgBhDFARIsABcDjOfBlajOJrAo0C4cqQPFf-gpZkmzh-gP7D4iFWTh2up3Q9RRGAMK_1QaApHREALw_wcB",
    },
    Famagusta2: {
      name: "Cyherbia Botanical Park & Labyrinth",
      website: "https://www.cyherbia.com/",
    },
    Famagusta3: {
      name: "Salamis Ancient City",
      website: "https://www.cyprusparadise.com/articles/salamis-ruins/",
    },
    link: "https://www.google.com/search?q=famagustaattractions&sxsrf=APwXEdcuo0PFCtEU1Uw4jzOH_IipvidTXA%3A1679785765211&ei=JX8fZMrDDKCGxc8P6MCKqAI&ved=0ahUKEwiK6tXOmfj9AhUgQ_EDHWigAiUQ4dUDCA8&uact=5&oq=famagustaattractions&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQAzIGCAAQBxAeMggIABCKBRCGAzIICAAQigUQhgMyCAgAEIoFEIYDMggIABCKBRCGAzIICAAQigUQhgM6BAgAEEc6BwgAEA0QgARKBAhBGABQtQlY7BVgzBhoAHADeACAAY0BiAGtCZIBAzAuOZgBAKABAcgBCMABAQ&sclient=gws-wiz-serp",
  },
  Larnaca: {
    Larnaca1: {
      name: "Church of Saint Lazarus",
      website:
        "https://www.visitcyprus.com/index.php/en/discovercyprus/culture/sites-monuments/170-agios-lazaros-church",
    },
    Larnaca2: {
      name: "Kamares Aqueduct",
      website:
        "https://www.visitcyprus.com/index.php/en/discovercyprus/culture/sites-monuments/188-kamares-aqueduct",
    },
    Larnaca3: {
      name: "Medieval Fort",
      website:
        "https://www.visitcyprus.com/index.php/en/discovercyprus/culture/sites-monuments/178-larnaka-larnaca-medieval-castle",
    },
    link: "https://www.google.com/search?q=larnaca+attractions&sxsrf=APwXEdcYt-mWR2wSLCGX-6Yamc55YgGZpw%3A1679785782867&ei=Nn8fZMDCNPORxc8P_669oAU&ved=0ahUKEwjAtYvXmfj9AhXzSPEDHX9XD1QQ4dUDCA8&uact=5&oq=larnaca+attractions&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQAzIGCAAQBxAeMgYIABAHEB4yBggAEAcQHjIICAAQigUQhgMyCAgAEIoFEIYDMggIABCKBRCGAzIICAAQigUQhgMyCAgAEIoFEIYDOgQIABBHSgQIQRgAUPwFWPYPYPoQaABwA3gAgAGeAYgBzgeSAQMwLjeYAQCgAQHIAQjAAQE&sclient=gws-wiz-serp",
  },
  Nicosia: {
    Nicosia1: {
      name: "Machairas Monastery",
      website:
        "https://www.visitcyprus.com/index.php/en/discovercyprus/rural/sites-monuments/720-machairas-monastery",
    },
    Nicosia2: {
      name: "The Cyprus Museum",
      website:
        "https://www.visitcyprus.com/index.php/en/discovercyprus/culture/museums-galleries/113-cyprus-museum",
    },
    Nicosia3: {
      name: "Venetian walls of Nicosia",
      website:
        "https://www.visitcyprus.com/index.php/en/discovercyprus/culture/sites-monuments/205-the-medieval-walls-of-lefkosia-nicosia",
    },
    link: "https://www.google.com/search?q=nicosia+attractions+&sxsrf=APwXEdfCg9p5taziuTAY9EZsU9j2MywkWQ%3A1679785390391&ei=rn0fZN_IF8bqkgXEjoPACQ&ved=0ahUKEwjf1_ibmPj9AhVGtaQKHUTHAJgQ4dUDCA8&uact=5&oq=nicosia+attractions+&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQAzIGCAAQFhAeMgYIABAWEB4yCAgAEIoFEIYDMggIABCKBRCGAzIICAAQigUQhgMyCAgAEIoFEIYDMggIABCKBRCGAzoECCMQJzoICC4QigUQkQI6DgguEIoFELEDEIMBEJECOgcILhCKBRBDOhEILhCKBRCxAxCDARDHARCvAToFCC4QgAQ6EQguEIAEELEDEIMBEMcBENEDOgsILhCABBDHARDRAzoWCC4QigUQsQMQgwEQxwEQ0QMQ1AIQQzoWCC4QgAQQFBCHAhCxAxCDARDHARCvAToKCAAQgAQQFBCHAjoLCC4QgAQQsQMQgwE6CAguEIAEELEDOg4ILhCKBRCxAxCDARDUAjoICAAQigUQkQI6EwguEIoFELEDEMcBENEDENQCEEM6DQguENQCELEDEIoFEEM6BQgAEIAEOg4ILhCABBDHARCvARDUAjoNCC4QgwEQsQMQigUQQzoNCC4QigUQsQMQgwEQQzoHCAAQigUQQzoRCC4QgAQQsQMQgwEQxwEQrwFKBAhBGABQAFizFGCnHGgAcAF4AIABqwGIAZUKkgEDMC45mAEAoAEBwAEB&sclient=gws-wiz-serp",
  },
};
