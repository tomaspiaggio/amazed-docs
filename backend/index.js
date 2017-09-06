var firebase = require("firebase");
var fs = require('fs');
const ROUTES_PATH = 'routes.txt';
const LAST_UPDATE = 'lastUpdate.json';
var config = {
  apiKey: "AIzaSyC1JcI2B7_edoPLSaI1Kfqj2CkyxzBxIpI",
  authDomain: "amazen-docs.firebaseapp.com",
  databaseURL: "https://amazen-docs.firebaseio.com",
  storageBucket: "amazen-docs.appspot.com",
};
// Route object
var routes = [];
var lastUpdate = [];
firebase.initializeApp(config);

// NODE.JS LOCAL

init();

function init(){
    getFile(ROUTES_PATH, (data) => {
        parseLastUpdate();
        parseRoutes(data)
        var toDo = calculateDifferences();
        console.log(toDo);
        pushRoute(toDo.toAdd);
        deleteRoute(toDo.toRemove);
        saveLastUpdate();
    });
}

function getFile(filename, callback){
    fs.readFile(filename, 'utf8', (err, data) => {
        callback(data);
    });
}

function parseRoutes(textFile){
    if(textFile.length <= 4) return;
    var method = textFile.substring(0, textFile.indexOf(' '));
    textFile = textFile.substring(textFile.indexOf('/'), textFile.length);
    var route = textFile.substring(0, textFile.indexOf(' '));
    var jumpIndex = textFile.indexOf('\n');
    var controllerRoute = textFile.substring(textFile.indexOf('controllers'), jumpIndex);
    routes.push(new Route(method, route, controllerRoute));
    parseRoutes(textFile.substring(jumpIndex + 1, textFile.length));
}

function parseLastUpdate(){
    var jsonLastUpdate = JSON.parse(fs.readFileSync(LAST_UPDATE, 'utf8')).routes;
    for(var i = 0; i < jsonLastUpdate.length; i++) lastUpdate.push(new Route(jsonLastUpdate[i].method, jsonLastUpdate[i].path, jsonLastUpdate[i].controllerPath));
}

function calculateDifferences(){
    var toAdd = [];
    var toRemove = [];
    for (var i = 0; i < routes.length; i++) if(contains(lastUpdate, routes[i]) < 0) toAdd.push(routes[i]);
    for (var i = 0; i < lastUpdate.length; i++) if(contains(routes, lastUpdate[i]) < 0) toRemove.push(lastUpdate[i]);
    return {toAdd: toAdd, toRemove: toRemove};
}

function saveLastUpdate(){
    fs.writeFile('lastUpdate.json', '{"routes": ' + JSON.stringify(routes) + '}', (err) => console.log(err));
}


// FIREBASE

// TODO: No anda el delete
// GET           /*others                                controllers.HomeController.other(others)
function deleteRoute(toDeleteRoutes){
    firebase.database().ref('routes').once('value').then((snapshot) => {
        var firebaseList = snapshot.val();
        var firebaseKeys = Object.keys(firebaseList);
        for (var i = 0; i < firebaseKeys.length; i++) {
            if(contains(toDeleteRoutes, firebaseList[firebaseKeys[i]]) >= 0){
                // var ref1 = new Firebase(config.databaseURL + "/routes/");
                firebase.database().ref('routes').child(firebaseKeys[i]).remove();
            }
        }
    }).catch((error) => console.log(error));
}

function pushRoute(routes){
    for (var i = 0; i < routes.length; i++) {
        firebase.database().ref('routes' + routes[i].path.substring(0, (routes[i].path.indexOf('/') >= 0)? routes[i].path.indexOf('/') : routes[i].path.length)).push({
            path: routes[i].path,
            method: routes[i].method,
            controllerPath: routes[i].controllerPath
        });
    }
}


// OBJECTS

function contains(array, route){
    for (var i = 0; i < array.length; i++) if(array[i].compare(array[i], route)) return i;
    return -1;
}

/**
 * @param method http method (GET, POST, PUT, DELETE)
 * @param path the front end path (/users)
 * @param controllerPath is the back end path, where to find the actual function (controllers.getAllUsers())
 */
var Route = function(method, path, controllerPath){
    this.method = method;
    this.path = path;
    this.controllerPath = controllerPath;
};

Route.prototype.compare = function(obj1, obj2){
    if(obj1.method != obj2.method) return false;
    if(obj1.path != obj2.path) return false;
    if(obj1.controllerPath != obj2.controllerPath) return false;
    return true;
};
