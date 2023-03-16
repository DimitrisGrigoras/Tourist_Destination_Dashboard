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

function get_lat_lon(event) {
  const xhr = new XMLHttpRequest();

  const form = document.querySelector("form");
  const InputAddress = form.querySelector("#InputAddress").value;
  const InputRegion = form.querySelector("#InputRegion").value;
  const InputCity = form.querySelector("#InputCity").value;

  const query = InputAddress + "," + InputRegion + "," + InputCity;
  console.log(query);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json`;

  xhr.onreadystatechange = function () {
    // Only run if the request is complete
    if (xhr.readyState !== 4) return;
    // Process our return data
    if (xhr.status >= 200 && xhr.status < 300) {
      // What to do when the request is successful
      const response = JSON.parse(xhr.responseText);
      if (response.length === 0) {
        // Empty response
        alert("No result for that location.");
        event.stopPropagation();
        return;
      } else {
        const lat = response[0].lat;
        const lon = response[0].lon;
        // console.log("Latitude:", lat);
        // console.log("Longitude:", lon);
        getWeather(lat, lon);
        getForecast(lat, lon);
        removeHidden();
        // find_attractions();
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
  fill_tab_table("add_press", pressure + " " + m_unit_pres);

  const humidity = response.main.humidity;
  fill_tab_table("add_hum", humidity + " %");

  const wind_speed = response.wind.speed;
  fill_tab_table("add_wind", wind_speed + " " + m_unit_W_s);

  const cloud_cover = response.clouds.all;
  fill_tab_table("add_cloud", cloud_cover + " %");

  const sunrise = new Date(response.sys.sunrise * 1000);
  fill_tab_table("add_sunr", convert_24_hour(sunrise));

  const sunset = new Date(response.sys.sunset * 1000);
  fill_tab_table("add_suns", convert_24_hour(sunset));
  // -----------------------------------------------------------------------
  const icon = response.weather[0].icon;
  const img_place = document.querySelector("#id_icon");
  const existing_img = img_place.querySelector("img");
  if (existing_img) {
    existing_img.src = "https://openweathermap.org/img/w/" + icon + ".png";
  } else {
    const img = document.createElement("img");
    img.src = "https://openweathermap.org/img/w/" + icon + ".png";
    // set image width and height
    img.style.width = "100px";
    img.style.height = "100px";
    img_place.appendChild(img);
  }
  // -----------------------------------------------------------------------
  const description = response.weather[0].description;
  const name = response.name;
  fill_tab_table("id_descr", description + " in " + name);

  const temperature = response.main.temp;
  const place_temp = document.getElementById("id_temp");
  place_temp.textContent =
    temperature + " " + String.fromCharCode(176) + m_unit_deg;
  place_temp.style.fontSize = "35px";

  const temp_min = response.main.temp_min;
  const temp_max = response.main.temp_max;
  const span1 = document.createElement("span");
  const span2 = document.createElement("span");
  const span3 = document.createElement("span");

  const low = document.querySelector("#id_low");
  low.textContent =
    "L:" + temp_min + " " + String.fromCharCode(176) + m_unit_deg;
  low.style.color = "blue";

  const ver = document.querySelector("#id_ver");
  ver.textContent = " | ";
  ver.style.color = "black";

  const high = document.querySelector("#id_high");
  high.textContent =
    "H:" + temp_max + " " + String.fromCharCode(176) + m_unit_deg;
  high.style.color = "green";
}

function forecast_data(row_id, data) {
  const col = document.createElement("td");
  col.classList.add("center_col_vh");
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
  img.src = "https://openweathermap.org/img/w/" + data + ".png";
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
    forecast_data("#row" + i, forecast_table[i].cloud_cover + " %");
    forecast_data(
      "#row" + i,
      forecast_table[i].temp + " " + String.fromCharCode(176) + m_unit_deg
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
        // Empty response
        alert("No result for that location.");
      } else {
        // console.log("Latitude:", lat);
        fill_first_tab(response, unit);
        // add_map(lat, lon);
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
        // Empty response
        alert("No result for that location.");
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
  header.textContent = "Attractions in " + InputCity;

  xhr.open("POST", url);

  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader(
    "Authorization",
    "Bearer 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"
  );

  const params = {
    model: "text-davinci-003",
    prompt:
      "Give me the top 3 attractions near the region " +
      InputRegion +
      " in " +
      InputCity +
      ", Cyprus",
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      spinner.style.display = "none"; // hide spinner
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
  const map = new ol.Map({
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
      center: ol.proj.fromLonLat([parseInt(lat), parseInt(lon)]), // center of the map
      zoom: 5, // zoom level (0 = zoomed out)
    }),
  });
  const apiKey = "848680c04915e5f5cdbedf8e07e73b28";
  const url = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${encodeURIComponent(
    apiKey
  )}`;
  layer_temp = new ol.layer.Tile({
    source: new ol.source.XYZ({
      url: url,
    }),
  });
  map.addLayer(layer_temp); // a temp layer on map

  // layer_precipitation = new ol.layer.Tile({
  //   source: new ol.source.XYZ({
  //     url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=8664ba887bd4156ce88bf6ff21c181ea`,
  //   }),
  // });
  // map.addLayer(layer_precipitation);
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

function design_modal(df) {
  const row_num = parseInt(df) - 1;
  let title =
    "Weather in " +
    forecast_table[row_num].name +
    " on " +
    create_formatted_date(forecast_table[row_num].dt);
  let desc =
    forecast_table[row_num].main +
    " (" +
    forecast_table[row_num].description +
    ")";
  fill_tab_table("exampleModalLabel", title);

  const img_place = document.querySelector("#modal_icon");

  // check if img_place already has a child element with the img tag
  const existingImg = img_place.querySelector("img");
  if (existingImg) {
    img_place.removeChild(existingImg); // remove the existing img element
  }
  const img = document.createElement("img");
  img.src =
    "https://openweathermap.org/img/w/" + forecast_table[row_num].icon + ".png";
  img_place.appendChild(img); // append the new img element

  fill_tab_table("modal_desc", desc);

  if (unit === "metric") {
    m_unit_pres = "hPa";
    m_unit_W_s = "meters/second";
  } else {
    m_unit_pres = "Mb";
    m_unit_W_s = "miles/hour";
  }

  fill_tab_table("modal_hum", forecast_table[row_num].humidity + "%");
  fill_tab_table(
    "modal_pres",
    forecast_table[row_num].pressure + " " + m_unit_pres
  );
  fill_tab_table(
    "modal_wi_sp",
    forecast_table[row_num].speed + " " + m_unit_W_s
  );
}

const form = document.querySelector(".needs-validation");
const submitBtn = form.querySelector("[type='submit']");
const resetBtn = form.querySelector("#reset-btn");

submitBtn.addEventListener("click", searchBtn);
resetBtn.addEventListener("click", resetForm);
