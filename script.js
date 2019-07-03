var map;
var FlightsSocket;
var airports = {};
var flights = {};
var LastPoints = {};
var AirportsMarkers = {};
var colors = {};
var FlightsMarkers = {};
var infowindow;
var path = "https://github.com/dalliende/MapsTarea4/blob/master/";

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function createMap() {
  var options = {
    center: { lat: -36.654, lng: -73.383 },
    zoom: 3
  };

  FlightsSocket = io("https://integracion-tarea-4.herokuapp.com", {
    path: "/flights",
    ForceNew: true
  });

  FlightsSocket.emit("AIRPORTS");
  FlightsSocket.emit("FLIGHTS");
  FlightsSocket.on("POSITION", Position);
  FlightsSocket.on("AIRPORTS", Airports);
  FlightsSocket.on("FLIGHTS", Vuelos);
  map = new google.maps.Map(document.getElementById("map"), options);
  infowindow = new google.maps.InfoWindow();
}

function Position(data) {
  if (LastPoints.hasOwnProperty(data["code"])) {
    var flightPlanCoordinates = [
      LastPoints[data["code"]],
      { lat: data["position"][0], lng: data["position"][1] }
    ];
    var flightPath = new google.maps.Polyline({
      path: flightPlanCoordinates,
      geodesic: true,
      strokeColor: colors[data["code"]],
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    flightPath.setMap(map);
    LastPoints[data["code"]] = {
      lat: data["position"][0],
      lng: data["position"][1]
    };
    moveMarker(FlightsMarkers[data["code"]], data["position"]);
  } else {
    LastPoints[data["code"]] = {
      lat: data["position"][0],
      lng: data["position"][1]
    };
    moveMarker(FlightsMarkers[data["code"]], data["position"]);
  }
  // Crear una lista de botones y actualizarla cuando aparesca una.
}

function Airports(data) {
  const codes = Object.keys(data);
  codes.forEach(function(element) {
    if (airports.hasOwnProperty(element)) {
    } else {
      airports[element] = data[element];
      var image = path + "/airport.png";
      var Airportmarker = new google.maps.Marker({
        position: {
          lat: data[element]["airport_position"][0],
          lng: data[element]["airport_position"][1]
        },
        map: map,
        icon: image
      });
      AirportsMarkers[element] = Airportmarker;
      var contentString =
        "<h5>Aeropuerto</h5>" +
        "<h6>\nNombre: " +
        data[element]["name"] +
        "</h6>" +
        "<h6>\nCiudad: " +
        data[element]["city"] +
        "</h6>" +
        "<h6>\nPais: " +
        data[element]["Country"] +
        "</h6>" +
        "<h6>\nCodigo Pais: " +
        data[element]["Country_code"] +
        "</h6>" +
        "<h6>\nCodigo Aeropuerto: " +
        data[element]["airport_code"] +
        "</h6>";
    }

    google.maps.event.addListener(Airportmarker, "click", function() {
      infowindow.setContent(contentString);
      infowindow.open(map, this);
    });
  });
}

function Vuelos(data) {
  data.forEach(function(element) {
    if (flights.hasOwnProperty(element["code"])) {
    } else {
      var origin_pos = element["origin"]["airport_position"];
      var destination_pos = element["destination"]["airport_position"];
      var theoricalPlanCoordinates = [
        { lat: origin_pos[0], lng: origin_pos[1] },
        { lat: destination_pos[0], lng: destination_pos[1] }
      ];
      colors[element["code"]] = getRandomColor();

      var teoricalPath = new google.maps.Polyline({
        path: theoricalPlanCoordinates,
        geodesic: true,
        strokeColor: colors[element["code"]],
        strokeOpacity: 0.4,
        strokeWeight: 6
      });
      teoricalPath.setMap(map);
      flights[element["code"]] = teoricalPath;

      var numero = (Object.keys(flights).length % 4) + 1;
      var image = path + "/plane" + numero.toString() + ".png";
      var FlightMarker = new google.maps.Marker({
        position: { lat: origin_pos[0], lng: origin_pos[1] },
        map: map,
        icon: image
      });
      FlightsMarkers[element["code"]] = FlightMarker;
      var contentString =
        "<h5>Vuelo " +
        element["code"] +
        "</h5>" +
        "<h6>\nAerolinea: " +
        element["airline"] +
        "</h6>" +
        "<h6>\nOrigen: " +
        element["origin"]["city"] +
        "</h6>" +
        "<h6>\nDestino: " +
        element["destination"]["city"] +
        "</h6>" +
        "<h6>\nAvion:  " +
        element["plane"] +
        "</h6>" +
        "<h6>\nAsientos: " +
        element["seats"] +
        "</h6>";
      google.maps.event.addListener(FlightMarker, "click", function() {
        infowindow.setContent(contentString);
        infowindow.open(map, this);
      });
    }
  });
}

function moveMarker(Marker, position) {
  if (Marker) {
    Marker.setPosition(new google.maps.LatLng(position[0], position[1]));
  }
}
