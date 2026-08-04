import { useRef, useEffect, useMemo } from 'react';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { ENV } from '@/constants/env';
import { NearbyServicesMapProps } from './OSMNearbyServicesMap';
import { getImageUrl } from '@/utils/image';
import { SharedWebViewMap } from './SharedWebViewMap';
import { MAP_CONSOLE_BRIDGE, safeJsonStringify } from './mapShared';

export interface MapMarkerPayload {
  id: string;
  name: string;
  avatar: string;
  rating: string;
  lat: number;
  lng: number;
}

function generateGoogleNearbyMapHTML(
  userLat: number,
  userLng: number,
  providersData: MapMarkerPayload[],
  apiKey: string,
) {
  const safeJson = safeJsonStringify(providersData);

  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #map { width: 100%; height: 100%; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  ${MAP_CONSOLE_BRIDGE}
</script>
<script>
  var map;
  var overlays = {};
  var markersData = ${safeJson};
  var selectedId = null;

  function sendMessage(type, data) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({ type: type }, data)));
    }
  }

  // Define Custom HTML Overlay Class for Google Maps
  function CustomOverlay(latlng, map, htmlElement, id) {
    this.latlng_ = latlng;
    this.htmlElement_ = htmlElement;
    this.id_ = id;
    this.setMap(map);
  }

  function initOverlayViewClass() {
    CustomOverlay.prototype = new google.maps.OverlayView();

    CustomOverlay.prototype.onAdd = function() {
      var panes = this.getPanes();
      panes.overlayMouseTarget.appendChild(this.htmlElement_);
    };

    CustomOverlay.prototype.draw = function() {
      var overlayProjection = this.getProjection();
      var position = overlayProjection.fromLatLngToDivPixel(this.latlng_);
      var div = this.htmlElement_;
      div.style.left = (position.x - 30) + 'px';
      div.style.top = (position.y - 65) + 'px';
      div.style.position = 'absolute';
      div.style.zIndex = (this.id_ === selectedId) ? 1000 : 10;
    };

    CustomOverlay.prototype.onRemove = function() {
      if (this.htmlElement_.parentNode) {
        this.htmlElement_.parentNode.removeChild(this.htmlElement_);
      }
    };
  }

  function createCustomMarkerElement(p, isSelected) {
    var div = document.createElement('div');
    var color = isSelected ? '#ef4444' : '#485aff';
    var shadow = isSelected ? '0 4px 10px rgba(239,68,68,0.5)' : '0 2px 6px rgba(0,0,0,0.3)';
    var size = isSelected ? '46px' : '40px';
    var imgSize = isSelected ? '40px' : '34px';
    var borderSize = isSelected ? '3px' : '3px';
    var marginOffset = isSelected ? '-6px' : '-5px';

    div.style.width = '60px';
    div.style.height = '70px';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'center';
    div.style.cursor = 'pointer';

    div.innerHTML = 
      '<!-- Circular Avatar -->' +
      '<div style="width: ' + size + '; height: ' + size + '; border-radius: 50%; border: ' + borderSize + ' solid ' + color + '; overflow: hidden; background-color: white; box-shadow: ' + shadow + '; display: flex; align-items: center; justify-content: center;">' +
        '<img src="' + p.avatar + '" style="width: ' + imgSize + '; height: ' + imgSize + '; border-radius: 50%; object-fit: cover;" onerror="this.onerror=null; this.src=\\\'https://avatar.iran.liara.run/public\\\';"/>' +
      '</div>' +
      '<!-- Rating Badge -->' +
      '<div style="background-color: ' + color + '; color: #ffffff; padding: 2px 6px; border-radius: 8px; font-family: system-ui, -apple-system, sans-serif; font-size: 9px; font-weight: 700; margin-top: ' + marginOffset + '; border: 1.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.2); white-space: nowrap;">' +
        '★ ' + p.rating +
      '</div>';

    div.addEventListener('click', function() {
      sendMessage('providerSelected', { id: p.id });
    });
    return div;
  }

  function initMap() {
    initOverlayViewClass();

    var initialPos = { lat: ${userLat}, lng: ${userLng} };
    map = new google.maps.Map(document.getElementById('map'), {
      center: initialPos,
      zoom: 14,
      disableDefaultUI: true,
      gestureHandling: 'greedy'
    });

    // Add user marker
    new google.maps.Marker({
      position: initialPos,
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#485aff',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      }
    });

    // Listen to map changes when user stops dragging/zooming (idle event)
    map.addListener('idle', function() {
      var center = map.getCenter();
      var bounds = map.getBounds();
      var zoom = map.getZoom();
      var sw = bounds ? bounds.getSouthWest() : null;
      var ne = bounds ? bounds.getNorthEast() : null;

      sendMessage('mapMoved', {
        center: { lat: center.lat(), lng: center.lng() },
        bounds: sw && ne ? {
          sw: { lat: sw.lat(), lng: sw.lng() },
          ne: { lat: ne.lat(), lng: ne.lng() }
        } : null,
        zoom: zoom
      });
    });

    if (typeof markerClusterer !== 'undefined' && markerClusterer) {
      markerClusterer.clearMarkers();
    } else if (typeof markerClusterer !== 'undefined') {
      markerClusterer = new markerClusterer.MarkerClusterer({
        map: map,
        algorithmOptions: {
          maxZoom: 15,
          radius: 120,
        },
        renderer: {
          render: function(params) {
            var count = params.count;
            var position = params.position;
            return new google.maps.Marker({
              position: position,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="28">' +
                  '<rect x="1" y="1" width="58" height="26" rx="13" fill="#485aff" stroke="#ffffff" stroke-width="2"/>' +
                  '<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold" font-family="system-ui, sans-serif">👥 ' + count + '</text>' +
                  '</svg>'
                ),
                anchor: new google.maps.Point(30, 14)
              }
            });
          }
        }
      });
    }

    renderMarkers();
  }

  function renderMarkers() {
    if (typeof map === 'undefined' || !map) return;
    
    // Clear existing
    for (var id in overlays) {
      overlays[id].setMap(null);
    }
    overlays = {};

    markersData.forEach(function(p) {
      if (typeof p.lat !== 'number' || isNaN(p.lat) || typeof p.lng !== 'number' || isNaN(p.lng)) {
        return; // Skip invalid coordinates
      }
      var isSelected = p.id === selectedId;
      var latlng = new google.maps.LatLng(p.lat, p.lng);
      var element = createCustomMarkerElement(p, isSelected);
      
      var overlay = new CustomOverlay(latlng, map, element, p.id);
      overlays[p.id] = overlay;

      if (isSelected) {
        map.panTo(latlng);
      }
    });
  }

  // Set standard global callback
  window.initMap = initMap;

  // Listeners for updates
  window.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'setSelected') {
        selectedId = msg.id;
        renderMarkers();
      } else if (msg.type === 'updateData') {
        markersData = msg.providers;
        selectedId = msg.selectedId;
        renderMarkers();
      }
    } catch(err) {
      console.error("Error processing window message:", err);
    }
  });
</script>
<script src="https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js"></script>
<script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap" async defer></script>
</body>
</html>`;
}

export default function GoogleNearbyServicesMap({
  userLat,
  userLng,
  providers,
  selectedProviderId,
  onSelectProvider,
  onMapCenterChange,
  onMapViewportChange,
}: NearbyServicesMapProps) {
  const webViewRef = useRef<WebView>(null);
  const apiKey = ENV.GOOGLE_MAPS_API_KEY;

  const safeLat = typeof userLat === 'number' && !isNaN(userLat) ? userLat : 27.700769;
  const safeLng = typeof userLng === 'number' && !isNaN(userLng) ? userLng : 85.30014;

  const markersPayload = useMemo(() => {
    return providers.map((p) => {
      const lat = p.coordinates?.lat ?? safeLat;
      const lng = p.coordinates?.lng ?? safeLng;
      return {
        id: p.id,
        name: p.name,
        avatar: getImageUrl(p.avatar) || 'https://avatar.iran.liara.run/public',
        rating: typeof p.avg_rating === 'number' ? p.avg_rating.toFixed(1) : '0.0',
        lat,
        lng,
      };
    });
  }, [providers, safeLat, safeLng]);

  useEffect(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'updateData',
        providers: markersPayload,
        selectedId: selectedProviderId,
      }),
    );
  }, [markersPayload, selectedProviderId]);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'providerSelected') {
        onSelectProvider(data.id);
      } else if (data.type === 'mapMoved') {
        if (data.center) {
          onMapCenterChange?.(data.center.lat, data.center.lng);
          onMapViewportChange?.({
            center: data.center,
            bounds: data.bounds,
            zoom: data.zoom,
          });
        } else if (typeof data.lat === 'number' && typeof data.lng === 'number') {
          onMapCenterChange?.(data.lat, data.lng);
          onMapViewportChange?.({
            center: { lat: data.lat, lng: data.lng },
          });
        }
      }
    } catch (err) {
      console.warn('Failed to parse message from GoogleWebView:', err);
    }
  };

  const mapHtml = useMemo(() => generateGoogleNearbyMapHTML(safeLat, safeLng, [], apiKey), [safeLat, safeLng, apiKey]);

  return <SharedWebViewMap ref={webViewRef} html={mapHtml} onMessage={onMessage} />;
}
