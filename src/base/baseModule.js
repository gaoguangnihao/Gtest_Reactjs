import BaseEmitter from './baseEmitter';
import Service from './service';
import SettingsManager from './settingsManager';

var GLOBAL_DEBUG = false;
export default class BaseModule extends BaseEmitter {

  constructor() {
    super();
    this.EVENT_PREFIX = '';
    // Fallback
    this.service = window.Service || Service;
    if (this.EVENTS) {
      this.EVENTS.forEach(function(evt) {
        window.addEventListener(evt, this);
      }, this);
    }
    if (this.SERVICES) {
      this.SERVICES.forEach(function(service) {
        this.service.register(service, this);
      }, this);
    }
    if (this.STATES) {
      this.STATES.forEach(function(state) {
        this.service.registerState(state, this);
      }, this);
    }
    // XXX: import settings-manager on demand?
    if (this.SETTINGS) {
      this._settings = {};
      this.SETTINGS.forEach(function(setting) {
        SettingsManager.addObserver(setting, this)
      }, this);
    }
  };

  publish(event, detail, noPrefix) {
    var prefix = noPrefix ? '' : this.EVENT_PREFIX;
    var evt = new CustomEvent(prefix + event,
                {
                  bubbles: true,
                  detail: detail || this
                });

    this.debug('publishing: ' + prefix + event);

    window.dispatchEvent(evt);
  };

  handleEvent(evt) {
    if (typeof(this._pre_handleEvent) == 'function') {
      var shouldContinue = this._pre_handleEvent(evt);
      if (shouldContinue === false) {
        return;
      }
    } else {
      this.debug('no handle event pre found. skip');
    }
    if (typeof(this['_handle_' + evt.type]) == 'function') {
      this.debug('handling ' + evt.type);
      this['_handle_' + evt.type](evt);
    }
    if (typeof(this._post_handleEvent) == 'function') {
      this._post_handleEvent(evt);
    }
  };

  observe(name, value) {
    this.debug('observing ' + name + ' : ' + value);
    if (!this._settings) {
      this._settings = {};
    }
    this._settings[name] = value;
    if (typeof(this['_observe_' + name]) == 'function') {
      this.debug('observer for ' + name + ' found, invoking.');
      this['_observe_' + name](value);
    }
  };

  debug() {
    if (this.DEBUG || GLOBAL_DEBUG) {
      console.log('[' + this.name + ']' +
      //  '[' + this.service.currentTime() + '] ' +
          Array.slice(arguments).concat());
      if (this.TRACE) {
        console.trace();
      }
    } else if (window.DUMP) {
      DUMP('[' + this.name + ']' +
      //  '[' + this.service.currentTime() + '] ' +
          Array.slice(arguments).concat());
    }
  };
}
