import { useRef, useEffect, useMemo } from 'react';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { ENV } from '@/constants/env';
import { NearbyServicesMapProps } from './OSMNearbyServicesMap';
import { getImageUrl } from '@/utils/image';
import { SharedWebViewMap } from './SharedWebViewMap';
import { MAP_CONSOLE_BRIDGE, safeJsonStringify } from './mapShared';

function generateGoogleNearbyMapHTML(userLat: number, userLng: number, servicesData: any[], apiKey: string) {
  const safeJson = safeJsonStringify(servicesData);

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
      '<!-- Price Badge -->' +
      '<div style="background-color: ' + color + '; color: #ffffff; padding: 2px 6px; border-radius: 8px; font-family: system-ui, -apple-system, sans-serif; font-size: 9px; font-weight: 700; margin-top: ' + marginOffset + '; border: 1.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.2); white-space: nowrap;">' +
        'Rs. ' + p.price +
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
        return; // Skip invalid coordinates to prevent Google Maps crash!
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
        markersData = msg.services;
        selectedId = msg.selectedId;
        renderMarkers();
      }
    } catch(err) {
      console.error("Error processing window message:", err);
    }
  });

  document.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.type === 'setSelected') {
        selectedId = msg.id;
        renderMarkers();
      } else if (msg.type === 'updateData') {
        markersData = msg.services;
        selectedId = msg.selectedId;
        renderMarkers();
      }
    } catch(err) {
      console.error("Error processing window message:", err);
    }
  });
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap" async defer></script>
</body>
</html>`;
}

export default function GoogleNearbyServicesMap({
  userLat,
  userLng,
  services,
  selectedServiceId,
  onSelectService,
}: NearbyServicesMapProps) {
  const webViewRef = useRef<WebView>(null);
  const apiKey = ENV.GOOGLE_MAPS_API_KEY;

  const safeLat = typeof userLat === 'number' && !isNaN(userLat) ? userLat : 27.700769;
  const safeLng = typeof userLng === 'number' && !isNaN(userLng) ? userLng : 85.30014;

  const getStartingPriceVal = (serviceOfferings: any[]) => {
    if (!serviceOfferings || serviceOfferings.length === 0) return '0';
    const prices = serviceOfferings.map((o) => parseFloat(o.price)).filter((p) => !isNaN(p));
    if (prices.length === 0) return '0';
    const minP = Math.min(...prices);
    return minP.toLocaleString('en-NP', { maximumFractionDigits: 0 });
  };

  const markersPayload = useMemo(() => {
    return services.map((s) => {
      const lat = s.provider?.coordinates?.lat ?? safeLat;
      const lng = s.provider?.coordinates?.lng ?? safeLng;
      return {
        id: s.id,
        name: s.provider?.name || 'Provider',
        avatar: getImageUrl(s.provider?.avatar) || 'https://avatar.iran.liara.run/public',
        price: getStartingPriceVal(s.service_offerings),
        lat,
        lng,
      };
    });
  }, [services, safeLat, safeLng]);

  useEffect(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'updateData',
        services: markersPayload,
        selectedId: selectedServiceId,
      }),
    );
  }, [markersPayload, selectedServiceId]);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'providerSelected') {
        onSelectService(data.id);
      }
    } catch (err) {
      console.warn('Failed to parse message from GoogleWebView:', err);
    }
  };

  return (
    <SharedWebViewMap
      ref={webViewRef}
      html={generateGoogleNearbyMapHTML(safeLat, safeLng, markersPayload, apiKey)}
      onMessage={onMessage}
    />
  );
}
