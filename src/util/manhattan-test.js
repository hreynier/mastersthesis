window.onload = function () {
    document.querySelector("#hello")
    .addEventListener("click", function () {
        console.log("clicked");
        var sceneEl = document.querySelector('a-scene');
        var entityEl = document.createElement('a-entity');
        if(entityEl){console.log("created entity.");};
        entityEl.setAttribute('material','color', 'red');
        entityEl.setAttribute('geometry', 'primitive', 'box');
        entityEl.setAttribute('position', '0 2 2');
        sceneEl.appendChild(entityEl);
        console.log("appended child.");
    })
};