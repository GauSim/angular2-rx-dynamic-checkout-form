/**
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
    // map tells the System loader where to look for things
    var map = {
        'app': 'dist',
        '@angular': 'node_modules/@angular',
        '@angular2-material': 'node_modules/@angular2-material',
        'angular2-in-memory-web-api': 'node_modules/angular2-in-memory-web-api',
        '@ngrx': 'node_modules/@ngrx',
        'rxjs': 'node_modules/rxjs',
        'immutable': 'node_modules/immutable'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app': {
            main: 'index.js',
            defaultExtension: 'js'
        },
        'rxjs': {
            defaultExtension: 'js'
        },
        'immutable': {
            main: 'dist/immutable.js',
            defaultExtension: 'js'
        },
        'angular2-in-memory-web-api': {
            main: 'index.js',
            defaultExtension: 'js'
        },
        '@ngrx/core': {
            main: 'index.js',
            format: 'cjs'
        },
        '@ngrx/store': {
            main: 'index.js',
            format: 'cjs'
        }
    };

    var ngPackageNames = [
        'common',
        'compiler',
        'core',
        'http',
        'platform-browser',
        'platform-browser-dynamic',
        'router',
        'router-deprecated',
        'upgrade',
    ];
    // Individual files (~300 requests):
    function packIndex(pkgName) {
        packages['@angular/' + pkgName] = { main: 'index.js', defaultExtension: 'js' };
    }
    // Bundled (~40 requests):
    function packUmd(pkgName) {
        packages['@angular/' + pkgName] = { main: pkgName + '.umd.js', defaultExtension: 'js' };
    };

    // Most environments should use UMD; some (Karma) need the individual index files
    var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;

    // Add package entries for angular packages

    ngPackageNames.forEach(setPackageConfig);

    // put the names of any of your Material components here
    const materialPkgs = [
        'core',
        'button',
        'card',
        'tabs'
    ];

    materialPkgs.forEach(pkg => {
        packages[`@angular2-material/${pkg}`] = { main: `${pkg}.js` };
    });

    var config = {
        map: map,
        packages: packages
    }

    System.config(config);

})(this);
