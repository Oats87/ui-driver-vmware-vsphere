/*!!!!!!!!!!!Do not change anything between here (the DRIVERNAME placeholder will be automatically replaced at buildtime)!!!!!!!!!!!*/
import NodeDriver from 'shared/mixins/node-driver';

// do not remove LAYOUT, it is replaced at build time with a base64 representation of the template of the hbs template
// we do this to avoid converting template to a js file that returns a string and the cors issues that would come along with that
const LAYOUT;
/*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/


/*!!!!!!!!!!!GLOBAL CONST START!!!!!!!!!!!*/
// EMBER API Access - if you need access to any of the Ember API's add them here in the same manner rather then import them via modules, since the dependencies exist in rancher we dont want to expor the modules in the amd def
const computed     = Ember.computed;
const get          = Ember.get;
const set          = Ember.set;
const alias        = Ember.computed.alias;
const service      = Ember.inject.service;

/*!!!!!!!!!!!GLOBAL CONST END!!!!!!!!!!!*/



/*!!!!!!!!!!!DO NOT CHANGE START!!!!!!!!!!!*/
export default Ember.Component.extend(NodeDriver, {
    settings: service(),
    model: null,
    showEngineUrl: false,
    initParamArray: null,
    driverName: '%%DRIVERNAME%%',
    config:     alias('model.%%DRIVERNAME%%Config'),
    app:        service(),

    init() {
        // This does on the fly template compiling, if you mess with this :cry:
        const decodedLayout = window.atob(LAYOUT);
        const template      = Ember.HTMLBars.compile(decodedLayout, {
            moduleName: 'nodes/components/driver-%%DRIVERNAME%%/template'
        });
        set(this,'layout', template);

        this._super(...arguments);
        this.initCfgParam();

    },
    /*!!!!!!!!!!!DO NOT CHANGE END!!!!!!!!!!!*/

    actions: {
        paramChanged(array) {
            const out = [];

            array.filter((param) => param.value && param.key).forEach((param) => {
                out.push(`${ param.key }=${ param.value }`);
            });
            set(this, 'config.cfgparam', out);
        }
    },

    network: computed('config.network', {
        set(k, value) {
            set(this, 'config.network', value.split(',').filter((x) => {
                return x.trim().length !== 0
            }));

            return value;
        }
    }),

    // Write your component here, starting with setting 'model' to a machine with your config populated
    bootstrap() {
        // bootstrap is called by rancher ui on 'init', you're better off doing your setup here rather then the init function to ensure everything is setup correctly
        let iso = 'https://releases.rancher.com/os/latest/rancheros-vmware.iso';
        let config = get(this, 'globalStore').createRecord({
            type: '%%DRIVERNAME%%Config',
            cpuCount: 2,
            memorySize: 2048,
            password:       '',
            diskSize:       20000,
            vcenterPort:    443,
            network:        [],
            cfgparam:       ['disk.enableUUID=TRUE'],
            boot2dockerUrl: iso,
        });

        set(this, 'model.%%DRIVERNAME%%Config', config);
    },

    initCfgParam() {
        const cfgparam = get(this, 'config.cfgparam') || [];

        set(this, 'initParamArray', []);
        (cfgparam || []).forEach((param) => {
            const index = (param || '').indexOf('=');

            if ( index > -1 ) {
                get(this, 'initParamArray').push({
                    key:   param.slice(0, index),
                    value: param.slice(index + 1),
                });
            }
        });
    },

    // Any computed properties or custom logic can go here
});