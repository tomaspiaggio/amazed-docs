var routesContainer = document.querySelector('.mod--routes');
var spinner = document.querySelector('.spinner');
var popup = document.querySelector('.popup--container');

function getRoutes(callback){
    firebase.database()
        .ref('routes')
        .once('value')
        .then((snapshot) => {
            var firebaseList = snapshot.val();
            var firebaseKeys = Object.keys(firebaseList);
            spinner.classList.add('spinner--invisible');
            routesContainer.classList.remove('mod--loading');
            for(var i = 0; i < firebaseKeys.length; i++)
                callback(firebaseList[firebaseKeys[i]]);
        });
}

function createRouteInDom(route){
    var container = document.createElement('DIV');
    var content = document.createElement('DIV');
    var header = document.createElement('H2');
    var path = document.createElement('H3');
    var controller = document.createElement('H3');

    container.classList.add('mod__route');
    content.classList.add('mod__content');
    header.classList.add('mod__header');
    path.classList.add('mod__path');
    controller.classList.add('mod__controller');

    header.textContent = route.method;
    path.textContent = "Path: " + route.path;
    controller.textContent = "Controller: " + route.controllerPath;

    content.append(header);
    content.append(path);
    content.append(controller);
    container.append(content);
    container.addEventListener('click', function(key){
        popup.querySelector('.mod__header').textContent = route.method;
        popup.querySelector('.mod__path').textContent = route.path;
        popup.querySelector('.mod__controller').textContent = route.controllerPath;
        popup.classList.add('popup--container--active');
        // popup.querySelector('.mod__description').textContent = routes[key].description;
    });
    routesContainer.append(container);
}

function init(){
    getRoutes(createRouteInDom);
    document.querySelector('.mod__exit').addEventListener('click', function(){
        popup.classList.remove('popup--container--active');
    });
}

window.onload = init;
