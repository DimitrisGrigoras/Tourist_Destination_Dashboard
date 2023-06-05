# Introduction

The tourist destination dashboard is a web application designed to provide appealing information to potential tourists about the current and forecasted weather conditions, as well as the top three tourist attractions, for any city in Cyprus. This application will make use of various web technologies, such as HTTP, CSS, JavaScript, AJAX, PHP, MySQL, and JSON, along with open APIs like OpenWeatherMap, OpenStreetMap, and OpenAI, and third-party libraries such as Bootstrap and OpenLayers.

The main functionality of the web application revolves around a search dashboard. Users will input their desired tourist location, which can be an address, region, or city, and their preferred unit of temperature measurement (Celsius or Fahrenheit). Based on this input, the application will retrieve and display the current weather conditions and the weather forecast for the selected location. Additionally, it will showcase the top three tourist attractions in a visually appealing and responsive manner, fitting the user's screen size.

To implement this functionality, the web application will utilize the OpenWeatherMap API to obtain real-time weather data, including temperature, humidity, wind speed, and weather conditions like sunny, cloudy, or rainy. The application will also use the OpenStreetMap API to retrieve geographical data, such as maps and points of interest, to display the tourist attractions.

The user interface of the dashboard will be built using HTML, CSS, and Bootstrap. It will feature a search bar where users can input their desired location and unit preference. Upon submitting the search query, the application will use AJAX to asynchronously communicate with the server-side PHP code.

The PHP code will handle the retrieval of weather data from the OpenWeatherMap API, converting the temperature measurement units as per the user's preference. It will also fetch data about the top tourist attractions for the given location using the OpenStreetMap API. The obtained data will be processed and formatted into JSON format for easier handling and transfer to the client-side JavaScript code.

The client-side JavaScript code will handle the dynamic rendering of the dashboard based on the received weather and attraction data. It will use the OpenLayers library to display the map and mark the locations of the tourist attractions. The JavaScript code will also utilize the OpenAI API to generate appealing descriptions of the attractions to enhance the user experience.

Overall, the tourist destination dashboard will provide users with an interactive and visually pleasing experience. They will be able to explore the weather conditions and forecast for their desired location, as well as gain insights into the top tourist attractions. The combination of various web technologies, APIs, and third-party libraries will ensure that the application delivers an engaging and informative experience to potential tourists planning a visit to Cyprus.

# Background
- Bootstrap 5 Library
- OpenWeatherMap REST API
- OpenAI REST API
- Nominatim REST API
- AJAX and JSON
- Open Layers JavaScript Library
- Web server and database (MySQL) server
- PHP

## License

[MIT](https://choosealicense.com/licenses/mit/)
