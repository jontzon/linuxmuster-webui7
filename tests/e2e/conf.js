exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['global-admin.js'],
  multiCapabilities: [{
        'browserName': 'firefox',
    }, {
        'browserName': 'chrome',
    }
    ]
};


//npm install -g protractor
//webdriver-manager update
//apt install openjdk-11-jdk google-chrome-stable firefox ## So, without Travis/Maven, needs a desktop ...
//webdriver-manager start

//// Documentation
// Protractor API : https://www.protractortest.org/#/api
// Jasmine API : https://jasmine.github.io/api/edge/
// Integration with Travis CI : http://dev.topheman.com/setup-travis-ci-saucelabs-for-protractor/
