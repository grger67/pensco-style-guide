require.config({
    paths: {
        'static': '/static/scripts',
        'toolbar': '/toolbar/scripts',
        'naw': '/newaccountwizard/scripts',
        'pav': '/assetvaluation/scripts',
        'pavc': '/assetvaluation/scripts/application'
    },
    map: {
        '*': {
            'async': 'static/async/1.0/async.min',
            'autoNumeric': 'static/autoNumeric/1.7.5/autoNumeric.min',
            'bootstrap': 'static/bootstrap/2.3.0/bootstrap.min',
            'cookieHelper': 'static/cookieHelper/1.0/cookieHelper',
            'globalize': 'static/globalize/0.1.1/globalize.min',
            'inputmask': 'static/inputmask/1.2.0/jquery.inputmask.min',
            'inputmaskdate': 'static/inputmask/1.2.0/jquery.inputmask.date.extensions.min',
            'jquery.history': 'static/jquery.history/1.7.1/jquery.history.min',
            'jquery.json': 'static/jquery.json/2.3/jquery.json.min',
            'jquery.mustache': 'static/jquery.mustache/0.2.3/jquery-Mustache.min',
            'jqueryui': 'static/jquery.ui/1.9.2/jquery-ui.min',
            'modernizr': 'static/modernizr/2.5.3/modernizr.min',
            'mustache': 'static/mustache/5.0/mustache', // not able to get it to minify and latest version doesn't work well with RequireJS
            'newAccountWizard': 'naw/newAccountWizard.min',
            'pensco.base': 'static/pensco.base/1.1/pensco.base.min',
            'placeholder': 'static/placeholder/2.0.7/jquery.placeholder.min',
            'pubsub': 'static/pubsub/1.0/pubsub.min',
            'underscore': 'static/underscore/1.4.2/underscore-1.4.2.min',
            'unobtrusive': 'static/jquery.validate.unobtrusive/1.0/jquery.validate.unobtrusive.min',
            'validate': 'static/jquery.validate/1.9.0/jquery.validate.min',
            'datatables': '/scripts/ui/jquery.dataTables.js',
            // toolbar items
            'includeToolbar': 'toolbar/include-toolbar',
            'penscoToolbar': 'toolbar/penscotoolbar',
            'toolbarService': 'toolbar/toolbarService',
            'authorization': 'static/authorization/1.0/authorization',
            'fancyboxPack': 'lib/jquery.fancybox.pack',
            'fancyboxMedia': 'lib/jquery.fancybox-media',
            'flexslider': 'lib/jquery.flexslider',
            'typekit': 'application/typekit'
        }
    },
    shim: {
        'static/jquery.ui/1.9.2/jquery-ui.min': {
            deps: ['jquery']
        },
        'static/jquery.validate/1.9.0/jquery.validate.min': {
            deps: ['jquery']
        },
        'static/jquery.validate.unobtrusive/1.0/jquery.validate.unobtrusive.min': {
            deps: ['static/jquery.validate/1.9.0/jquery.validate.min']
        },
        'static/inputmask/1.2.0/jquery.inputmask.date.extensions.min': {
            deps: ['static/inputmask/1.2.0/jquery.inputmask.extensions.min']
        },
        'static/inputmask/1.2.0/jquery.inputmask.extensions.min': {
            deps: ['static/inputmask/1.2.0/jquery.inputmask.min']
        },
        'static/bootstrap/2.3.0/bootstrap.min': {
            deps: ['static/jquery.ui/1.9.2/jquery-ui.min']
        },
        'naw/launchNaw': {
            deps: ['naw/newAccountWizard.min']
        },
        'pav/launchassetvaluation': {
           deps: ['pav/assetvaluation.min']
        },
        'lib/jquery.fancybox-media': {
            deps: ['static/jquery.ui/1.9.2/jquery-ui.min', 'lib/jquery.fancybox.pack']
        }
    },

    waitSeconds: 60
});


require(['jquery', 'cookieHelper', 'globalize', 'jqueryui', 'bootstrap', 'lib/holder', 'pensco.base'],
    function(cookieHelper) {
        require(['carousel', 'fancyboxPack', 'fancyboxMedia', 'flexslider', 'typekit'], function () {
            $('.flexslider').flexslider();
            $(".fancybox-media").fancybox({
                openEffect: 'none',
                closeEffect: 'none',
                helpers: {
                    media: {}
                }
            });

            $('.btn-group button').on('click', function(e) {
                var type = $(e.target).attr('id');
                window.location = '/Forms#' + type;
            });

            try {
                 Typekit.load();
            } catch (e) { }
        });

    var currentCulture = $('#currentCulture').val() || 'en-US',
        cultureRequire = 'static/globalize/0.1.1/cultures/globalize.culture.' + currentCulture,
        cookieHelpr = new cookieHelper(),
        config = {},
        logInIsLoaded = false;

    // if log in html is present, bind it.
    if (typeof $('#LoginModalGo', '#log-in')[0] !== 'undefined') {
        bindLogin();
        logInIsLoaded = true;
    }

    // load config from controller and parse JSON result into config object
    loadConfig(config);

    // set the current culture
    window.Globalize.culture(currentCulture);

    window.require(['services/logging', 'naw/application/translations', cultureRequire],
        function (loggingService, translations) {
            var trans = new translations();

            trans.getTranslations()
                .done(function (result) {
                    window.Translations = result;                   

                    window.require(['ui/page/portalDropdown'], function (portalDropdown) {
                        var pd = new portalDropdown();
                    });
                    
                    if (logInIsLoaded === false) {
                        bindLogin();
                    }

                    if (window.location.pathname === '/OpenAnAccount/Wizard' || window.location.pathname.search(/accountsetup/i) == true) {
                        window.require(['naw/launchNaw']);
                    }

                    // wire up error dialog if not in NAW
                    if (window.location.pathname.search(/accountsetup/i) < 0) {

                        $('#errorDialogDiv').errorDialog();
                    }
                }); 
            if (window.location.pathname === '/Professionals/AssetValuation' || window.location.pathname.search(new RegExp('/Professionals/AssetValuation', 'i')) > -1 ||
                    window.location.pathname.search(new RegExp('Professionals/AssetValuation', 'i')) > -1) {
                window.require(['pav/launchassetvaluation']);
            }
            window.require(['pavc/config'], function (config) {
                var pageObject;
                var cnfg = new config();
                cnfg.target = '/assetvaluation/config/configurations';
                cnfg.getConfig()
               .done(function (results) {
                   window.Config = results;
               });
            });
            // global error handler
            window.onerror = function (msg, url, linenumber) {
                var loggingSvc = new loggingService(),
                    data = { message: msg, url: url, lineNumber: linenumber };

                loggingSvc.target = '/apipub/logging';

                if (url !== '') {
                    loggingSvc.log(data);
                }
                
                return true;
            };
        });
    
    var urlParts = window.location.pathname.split('/'),
                step;

    step = (urlParts.length === 2) ? urlParts[1] : urlParts[2];

    switch (step.toLowerCase()) {
        case "contactus":
            $(document).ready(function () {
                window.require(['ui/page/contactUs'], function (contactUs) {
                    var contactUsPage = new contactUs();
                });
            });
    }
    
    function loadConfig() {
        $.get('/PublicConfig/Get', function (results) {
            config = JSON.parse(results);
        });
    }
    
    function bindLogin() {
        $('#LoginModalGo', '#log-in').off('click');
        $('#LoginModalGo', '#log-in').on('click', function () {
            redirectLogin();
        });
    }

    function redirectLogin() {
        var selectionId = $('input[name=loginOption]:checked', '#log-in')[0].id;

        switch (selectionId) {
            case 'account-owner':
                window.location = config.signInUrl;
                break;
            case 'account-beneficiary':
                window.location = config.signInUrl;
                break;
            case 'account-affiliate':
                window.location = config.advisorUrl;
                break;
            case 'account-register':
                window.location = config.newaccountUrl + "?id=2";
                break;
            case 'account-register-online-access':
                window.location = "https://client.pensco.com/Registration/userregistration.aspx";
                //window.location = config.userregistrationUrl;
                break;
        }        
    }
});