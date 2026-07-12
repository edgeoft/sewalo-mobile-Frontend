export const MAP_USER_AGENT =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 SewaloApp/1.0';

export const CARTODB_VOYAGER_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

export const CARTODB_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export const MAP_CONSOLE_BRIDGE = `
  // Console logging and exception bridging to React Native console
  (function() {
    var log = console.log;
    var error = console.error;
    console.log = function() {
      var args = Array.prototype.slice.call(arguments);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'log',
          message: args.join(' ')
        }));
      }
      log.apply(console, args);
    };
    console.error = function() {
      var args = Array.prototype.slice.call(arguments);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'log',
          message: 'ERROR: ' + args.join(' ')
        }));
      }
      error.apply(console, args);
    };
    window.onerror = function(message, source, lineno, colno, errorObj) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'log',
          message: 'EXCEPTION: ' + message + ' at ' + source + ':' + lineno + ':' + colno
        }));
      }
      return true;
    };
  })();
`;

/**
 * Escapes backticks and template string markers inside a stringified JSON
 * to prevent breaking the ES6 template literal.
 */
export function safeJsonStringify(data: unknown): string {
  return JSON.stringify(data).replace(/`/g, '\\`').replace(/\${/g, '\\${');
}
