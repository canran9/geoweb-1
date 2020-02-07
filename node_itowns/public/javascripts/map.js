var searchParams = new URL(window.location.href).searchParams;

function showPointcloud(serverUrl, fileName, lopocsTable) {
    var pointcloud;
    var oldPostUpdate;
    var viewerDiv;
    var debugGui;
    var view;
    var controls;

    viewerDiv = document.getElementById('viewerDiv');
    viewerDiv.style.display = 'block';

    itowns.THREE.Object3D.DefaultUp.set(0, 0, 1);

    debugGui = new dat.GUI({ width: 400 });

    // TODO: do we really need to disable logarithmicDepthBuffer ?
    view = new itowns.View('EPSG:3946', viewerDiv);
    setupLoadingScreen(viewerDiv, view);
    view.mainLoop.gfxEngine.renderer.setClearColor(0xcccccc);

    // Configure Point Cloud layer
    pointcloud = new itowns.GeometryLayer('eglise_saint_blaise_arles', new itowns.THREE.Group());
    pointcloud.file = fileName || 'infos/sources';
    pointcloud.protocol = 'potreeconverter';
    pointcloud.url = serverUrl;
    pointcloud.table = lopocsTable;
    if (searchParams.get('material') === 'three') {
        pointcloud.material = new itowns.THREE.PointsMaterial({
            color: 0xff8888,
            sizeAttenuation: false,
            size: 1,
            vertexColors: itowns.THREE.VertexColors
        });
    }

    // point selection on double-click
    function dblClickHandler(event) {
        var pick = view.pickObjectsAt(event, 5, pointcloud);

        for (const p of pick) {
            console.info('Selected point #' + p.index + ' in position (' +
                p.object.position.x + ', ' +
                p.object.position.y + ', ' +
                p.object.position.z +
             ') in Points ' + p.object.layer.id);
        }
    }
    view.mainLoop.gfxEngine.renderer.domElement.addEventListener('dblclick', dblClickHandler);


    function placeCamera(position, lookAt) {
        view.camera.camera3D.position.set(position.x, position.y, position.z);
        view.camera.camera3D.lookAt(lookAt);
        // create controls
        controls = new itowns.FirstPersonControls(view, { focusOnClick: true });
        debugGui.add(controls.options, 'moveSpeed', 1, 100).name('Movement speed');

        view.notifyChange(view.camera.camera3D);
    }

    // add pointcloud to scene
    function onLayerReady() {
        var ratio;
        var position;
        var lookAt = new itowns.THREE.Vector3();
        var size = new itowns.THREE.Vector3();

        pointcloud.root.bbox.getSize(size);
        pointcloud.root.bbox.getCenter(lookAt);

        debug.PointCloudDebug.initTools(view, pointcloud, debugGui);

        view.camera.camera3D.far = 2.0 * size.length();

        ratio = size.x / size.z;
        position = pointcloud.root.bbox.min.clone().add(
            size.multiply({ x: 0, y: 0, z: ratio * 0.5 }));
        lookAt.z = pointcloud.root.bbox.min.z;
        placeCamera(position, lookAt);
        controls.moveSpeed = size.length() / 3;

        // update stats window
        oldPostUpdate = pointcloud.postUpdate;
        pointcloud.postUpdate = function postUpdate() {
            var info = document.getElementById('info');
            oldPostUpdate.apply(pointcloud, arguments);
            info.textContent = 'Nb points: ' +
                pointcloud.displayedCount.toLocaleString();
        };
    }
    window.view = view;

    view.addLayer(pointcloud).then(onLayerReady);
}

if (searchParams.get('selector')) {
    document.getElementsByClassName('centered')[0].style.display = 'block';
    document.getElementById('submit').addEventListener('click', onConnectClicked);
} else {
    onConnectClicked();
}