L.mapbox.accessToken = "pk.eyJ1IjoiYnJ5bWNicmlkZSIsImEiOiJXN1NuOFFjIn0.3YNvR1YOvqEdeSsJDa-JUw";

var titleField, cluster, userFields =[], urlParams = {};

var mapboxOSM = L.tileLayer("https://{s}.tiles.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=" + L.mapbox.accessToken, {
  maxZoom: 21,
  subdomains:[ "a", "b", "c", "d"],
  attribution: 'Basemap <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox © OpenStreetMap</a>'
});

var mapboxLight = L.tileLayer("https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=" + L.mapbox.accessToken, {
  maxZoom: 21,
  subdomains:[ "a", "b", "c", "d"],
  attribution: 'Basemap <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox © OpenStreetMap</a>'
});

var mapboxSat = L.tileLayer("https://{s}.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=" + L.mapbox.accessToken, {
  maxZoom: 20,
  subdomains:[ "a", "b", "c", "d"],
  attribution: 'Basemap <a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox © OpenStreetMap</a>'
});

var mapboxAncientWorld = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaXNhd255dSIsImEiOiJBWEh1dUZZIn0.SiiexWxHHESIegSmW8wedQ', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 10,
  id: 'isawnyu.map-knmctlkh'
 });

var baseLayers = {
  "Street Map": mapboxOSM,
  "Light Map": mapboxLight,
  "Aerial Imagery": mapboxSat,
  "Ancient World": mapboxAncientWorld 
};

var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true
});

var featureLayer = L.mapbox.featureLayer(null, {
  style: {
    weight: 2,
    color: '#000000',
    fillColor: '#FF0000',
    fillOpacity: 0.3
  }
});

var contextLayer = L.mapbox.featureLayer(null, {
  style: {
    weight: 2,
    color: '#000000',
    fillColor: '#ff7800',
    fillOpacity: 0.1
  }
});

var group = new L.featureGroup([featureLayer, contextLayer]);

featureLayer.on("ready", function (e) {
  featureLayer.eachLayer(function (layer) {
    $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '"><td class="feature-name">' + getTitle(layer) + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
    layer.on("click", function (e) {
      map.closePopup();
      var pid, category; /* local UCD */
      var content = "<table class='table table-striped table-bordered table-condensed'>";
      if (userFields.length > 0) {
        $.each(userFields, function (index, property) {
          if (property == 'marker-symbol' || property == 'marker-size' || property == 'marker-color') {
            return;
          }
          if (property == 'category') {
            if (e.target.feature.properties[property] == 'audio') {
              category = e.target.feature.properties[property];
            }
          }
          if (property == 'pid') {
            /* local UCD */
            pid = e.target.feature.properties[property];
          }
          if (e.target.feature.properties[property]) {
            content += "<tr><th>" + property + "</th><td>" + formatProperty(e.target.feature.properties[property]) + "</td></tr>";
          }
        });
      } else {
        $.each(e.target.feature.properties, function (index, property) {
          if (property !== undefined) {
            if (index == 'marker-symbol' || index == 'marker-size' || index == 'marker-color') {
              return;
            }
            content += "<tr><th>" + index + "</th><td>" + formatProperty(property) + "</td></tr>";
          }
          if (index == 'pid') {
            /* local UCD */
            pid = property;
          }
        });
      }
      if (pid !== undefined && pid !== null && (category && category == 'audio')) {
        var mediaURI = getMediaURI(document.location.origin + '/view/' + pid + '.xml', 'audio');
        content += "<tr><th>" + '<img class="img-responsive results-img muted thumbnail-geo pull-left" src="https://digital.ucd.ie/get/' + pid + '/thumbnail" alt="Audio media">' + "</th><td>" +
        '<div class="audio-player"></div>' + "</td></tr>";
      } else if (pid !== undefined && pid !== null) {
        if (urlParams.iframe && (urlParams.iframe == 'true')) {
          content += "<tr><th>" + '<a class="bs-tooltip thumbnail-iiif" onClick="return false;" data-toggle="tooltip" title=""' +
          ' data-placement="top" href="https://digital.ucd.ie/view-media/' + pid + '/canvas?manifest=https://data.ucd.ie/api/img/manifests/' + pid + '" data-original-title="View content, or drag and drop to viewer"><img class="img-responsive results-img muted thumbnail-geo pull-left" src="https://digital.ucd.ie/get/' + pid + '/thumbnail" alt="IIIF drag and drop link"></a>' + "</th><td>" +
          '<a class="bs-tooltip" onClick="return false;" data-toggle="tooltip drag-and-drop-iiif" title=""' +
          ' data-placement="top" href="https://digital.ucd.ie/view-media/' + pid + '/canvas?manifest=https://data.ucd.ie/api/img/manifests/' + pid + '" data-original-title="View content, or drag and drop to viewer"><img class="img-responsive results-img muted iiif-logo pull-left" src="assets/img/logo-iiif-34x30.png" alt="IIIF drag and drop link"></a>&nbsp;To view, drag preview image or IIIF icon to a new tab or window, or to an instance of the Mirador viewer' + "</td></tr>";
        }
        else if (!urlParams.iframe && category !== 'audio') {
          content += "<tr><th>" + '<a class="bs-tooltip thumbnail-iiif" data-toggle="tooltip" title=""' +
          ' data-placement="top" href="https://digital.ucd.ie/view-media/' + pid + '/canvas?manifest=https://data.ucd.ie/api/img/manifests/' + pid + '" data-original-title="View content, or drag and drop to IIIF viewer"><img class="img-responsive results-img muted thumbnail-geo pull-left" src="https://digital.ucd.ie/get/' + pid + '/thumbnail" alt="thumbnail preview"></a>' + "</th><td>" +
          '<a class="bs-tooltip" data-toggle="tooltip drag-and-drop-iiif" title=""' +
          ' data-placement="top" target="_blank" href="https://digital.ucd.ie/view/' + pid + '" data-original-title="View description">Read a description of this item</a><br /> or</br/>'+
          '<a class="bs-tooltip thumbnail-iiif" data-toggle="tooltip" title="" target="_blank" href="https://digital.ucd.ie/view-media/' + pid + '/canvas?manifest=https://data.ucd.ie/api/img/manifests/' + pid + '" data-original-title="View content, or drag and drop to IIIF viewer">View image(s)</a> by dragging the small thumbnail image to a new tab'+"</td></tr>";
        }
      }
      content += "<table>";
      $("#feature-title").html(getTitle(e.target));
      $("#feature-info").html(content);
      $("#featureModal").modal("show");
      $("#share-btn").click(function () {
        var link = location.toString() + "&id=" + L.stamp(e.target);
        if (urlParams.iframe && (urlParams.iframe == 'true')) {
          $("li a#share-hyperlink").addClass("hidden");
        } else {
          $("#share-hyperlink").attr("target", "_blank").attr("href", link);
        }
        $("#share-twitter").attr("target", "_blank").attr("href", "https://twitter.com/intent/tweet?url=" + encodeURIComponent(link));
        $("#share-facebook").attr("target", "_blank").attr("href", "https://facebook.com/sharer.php?u=" + encodeURIComponent(link));
      });
    });
  });
  
  if (urlParams.title && urlParams.title.length > 0) {
    var title = decodeURI(urlParams.title);
    $("[name='title']").html(title);
  }
  if (urlParams.sort && urlParams.sort == "desc") {
    sortOrder = "desc";
  } else {
    sortOrder = "asc";
  }
  var featureList = new List("features", {
    valueNames:[ "feature-name"],
    page: 2000
  });
  featureList.sort("feature-name", {
    order: sortOrder
  });
  markerClusters.clearLayers().addLayer(featureLayer);
});

featureLayer.once("ready", function (e) {
  /* Update navbar & layer title from URL parameter */
  if (urlParams.title && urlParams.title.length > 0) {
    var title = decodeURI(urlParams.title);
    $("[name='title']").html(title);
  }
  /* Add navbar logo from URL parameter */
  if (urlParams.logo && urlParams.logo.length > 0) {
    $("#navbar-title").prepend("<img src='" + urlParams.logo + "'>");
  }
  /* If id param passed in URL, zoom to feature, else fit to cluster bounds or fitWorld if no data */
  if (urlParams.id && urlParams.id.length > 0) {
    var id = parseInt(urlParams.id);
    zoomToFeature(id);
  } else {
    if (featureLayer.getLayers().length === 0) {
      map.fitWorld();
    } else if (bboxBounds !== undefined) {
      map.fitBounds(bboxBounds);
    } else {
      map.fitBounds(this.getBounds(), {
        maxZoom: 17
      });
    }
  }
});

contextLayer.once("ready", function (e) {
  /* include all polygons & points in viewport */
  map.fitBounds(group.getBounds());
});

var map = L.map("map", {
  zoom: 10,
  layers:[mapboxOSM]
}).fitWorld();
map.attributionControl.setPrefix("");
var layerControl = L.control.layers(baseLayers, null, {
  collapsed: document.body.clientWidth <= 767 ? true: false
}).addTo(map);

var locateControl = L.control.locate({
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: false,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-crosshairs",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

function fetchData() {
  $("#loading").show();
  featureLayer.clearLayers();
  $("#feature-list tbody").empty();
  if (urlParams.src.indexOf(".topojson") > -1) {
    omnivore.topojson(decodeURIComponent(urlParams.src), null, featureLayer).on("ready", function (layer) {
      $("#loading").hide();
    });
  } else {
    featureLayer.loadURL(decodeURIComponent(urlParams.src)).on("ready", function (layer) {
      $("#loading").hide();
    });
  }
  if (urlParams.ctx && urlParams.ctx != '') {
    fetchContextLayer();
  }
}

function fetchContextLayer() {
  var contextObject = contextLayer.loadURL(decodeURIComponent(urlParams.ctx));
  contextObject.addTo(map);
}

function getTitle(layer) {
  if (urlParams.title_field) {
    titleField = decodeURI(urlParams.title_field);
  }
  if (titleField && layer.feature.properties[titleField]) {
    return layer.feature.properties[titleField];
  } else {
    if (userFields.length > 0) {
      return layer.feature.properties[userFields[0]];
    } else {
      return layer.feature.properties[Object.keys(layer.feature.properties)[0]];
    }
  }
}

function formatProperty(value) {
  if (typeof value == "string" && (value.indexOf("http") === 0 || value.indexOf("https") === 0)) {
    return "<a href='" + value + "' target='_blank'>" + value + "</a>";
  } else {
    return value;
  }
}

function zoomToFeature(id) {
  var layer = featureLayer.getLayer(id);
  if (layer instanceof L.Marker) {
    map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  } else {
    map.fitBounds(layer.getBounds());
  }
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 575) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

if (location.search) {
  var parts = location.search.substring(1).split("&");
  for (var i = 0; i < parts.length; i++) {
    var nv = parts[i].split("=");
    if (! nv[0]) continue;
    urlParams[nv[0]] = nv[1] || true;
  }
}

if (urlParams.fields) {
  fields = urlParams.fields.split(",");
  $.each(fields, function (index, field) {
    field = decodeURI(field);
    userFields.push(field);
  });
}

/* additions */

if (urlParams.iframe && (urlParams.iframe == 'true')) {
  $(".navbar-header").addClass("hidden");
  $("#refresh-btn").addClass("hidden");
  $("#download").addClass("hidden");
}
if (urlParams.embed && (urlParams.embed == 'true')) {
  $("#navigation-top").css({
    "display": "none", "height": "0"
  });
  $("body").css("padding-top", "0");
  $(".navbar-header").addClass("hidden");
  //$("#full-extent-btn").addClass("hidden");
  $("#refresh-btn").addClass("hidden");
  $("#download").addClass("hidden");
  $('#sidebar').addClass("hidden");
  $('#map').css("width", "100%!important");
} else {
  //$("body").css("padding-top","38px");
  $('#map').css("width", "auto");
}

if (urlParams.cluster && (urlParams.cluster === "false" || urlParams.cluster === "False" || urlParams.cluster === "0")) {
  cluster = false;
} else {
  cluster = true;
}

if (urlParams.attribution) {
  var attribution = decodeURI(urlParams.attribution);
  map.attributionControl.setPrefix(attribution);
}

/* UCD */
if (urlParams.src && (urlParams.src.includes("bbox"))) {
  var bbox = urlParams.src;
  bbox = decodeURIComponent(decodeURI(bbox)).match(/bbox\((.*?)\)/i)[1];
  var geocodes = bbox.split(",");
  
  map.fitBounds([[
  geocodes[1], geocodes[0]],[
  geocodes[3], geocodes[2]]]);
  
  var bboxBounds =[[geocodes[1], geocodes[0]],[geocodes[3], geocodes[2]]];
  L.rectangle(bboxBounds, {
    color: "#ff7800", weight: 1
  }).addTo(map);
  map.fitBounds(bboxBounds);
}

if (cluster === true) {
  map.addLayer(markerClusters);
  layerControl.addOverlay(markerClusters, "<span name='title'>Map markers</span>");
} else {
  map.addLayer(featureLayer);
  layerControl.addOverlay(featureLayer, "<span name='title'>Map markers</span>");
}

$("#refresh-btn").click(function () {
  fetchData();
  //$(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#download").click(function () {
  var href = decodeURIComponent(urlParams.src);
  var fn = Math.random().toString(36).substr(2, 5) + '.geojson';
  $(this).attr('download', fn).attr("href", href);
  return true;
});

$("#auto-refresh").click(function () {
  if ($(this).prop("checked")) {
    autoRefresh = window.setInterval(fetchData, 60 * 1000);
    fetchData();
  } else {
    clearInterval(autoRefresh);
  }
});

$("#full-extent-btn").click(function () { 
  if (bboxBounds !== undefined) {
    map.fitBounds(bboxBounds);
  } else {
    map.fitBounds(featureLayer.getBounds());
  }
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function () {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#nav-btn").click(function () {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function () {
  if ($('#sidebar').hasClass("hidden")) {
    $('#sidebar').removeClass("hidden");
  }
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function () {
  $("#sidebar").hide();
  map.invalidateSize();
});

$("a.thumbnail-iiif").click(function () {
  event.preventDefault();
  return;
});

$("a.drag-and-drop-iiif").click(function () {
  return;
});
/* drop header etc with small split Mirador screens */
function adjustStyle(width) {
  width = parseInt(width);
  if (width < 575) {
    $("#navigation-top").addClass("hidden");
    $("body").css("padding-top", 0);
    //$("#sidebar").hide();
    //map.invalidateSize();
  } else if (width >= 575) {
    $("#navigation-top").removeClass("hidden");
    //$("body").css("padding-top", "38px");
    //$("#sidebar").show();
  }
}
$(function () {
  adjustStyle($(this).width());
  $(window).resize(function () {
    adjustStyle($(this).width());
  });
});

function getMediaURI(url, type) {
  $.ajax({
    type: 'GET',
    url: url,
    dataType: 'xml',
    success: function (xml, textStatus, jqXHR) {
      if (type == 'audio') {
        xmlDoc = $.parseXML(xml),
        $xml = $(xmlDoc),
        $(xml).find('relatedItem').each(function () {
          if ($(this).attr("type") == 'constituent') {
            $(this).find('identifier').each(function () {
              if ($(this).attr('type') == 'uri') {
                var mediaID = $(this).text();
                var mediaURI = 'https://digital.ucd.ie/get/' + mediaID.split('/')[1] + '/content';
                if (mediaID) {
                  var mediaURI = 'https://digital.ucd.ie/get/' + mediaID.split('/')[1] + '/content';
                  $('div.audio-player').append('<audio controls><source src="' + mediaURI + '" type="audio/mpeg"></audio>');
                  return; // 'https://digital.ucd.ie/get/' + mediaID.split('/')[1] + '/content';
                }
              }
            });
          }
        });
        return;
      }
      if (type == 'video') {
        xmlDoc = $.parseXML(xml),
        $xml = $(xmlDoc),
        $(xml).find('relatedItem').each(function () {
          if ($(this).attr("type") == 'constituent') {
            $(this).find('identifier').each(function () {
              if ($(this).attr('type') == 'uri') {
                var mediaID = $(this).text();
                /* capture the URI of the vimeo or youtube and embed it */
              }
            });
          }
        });
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log('error');
    }
  })
}

$(document).ready(function () {
  fetchData();
});

$(document).on("click", ".feature-row", function (e) {
  zoomToFeature(parseInt($(this).attr("id"), 10));
});
