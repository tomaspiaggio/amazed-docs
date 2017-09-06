var routes = document.querySelector('.mod--routes');

function getRoutes(callback){
    firebase.database()
        .ref('routes')
        .once('value')
        .then((snapshot) => {
            var firebaseList = snapshot.val();
            var firebaseKeys = Object.keys(firebaseList);
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
    routes.append(container);
}

function init(){
    getRoutes(createRouteInDom);
}

window.onload = init;
