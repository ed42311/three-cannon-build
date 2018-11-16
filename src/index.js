THREE = require('three')
CANNON = require('cannon')

var time = Date.now(), timeStep = 1/60, world, body, shape, mesh, groundBody,
camera, scene, renderer, sphereBody, sphereShape, controls, light, floor;


var meshes=[], bodies=[];

import PointerLockControls from './PointerLockControls'

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize( window.innerWidth, window.innerHeight )
}

function addPhysicalConstruct (n) {
  let g = new THREE.BoxGeometry( 1, 1, 1, 10, 10 );
  let m = new THREE.MeshPhongMaterial( { color: 0x888888 } );
  for(let i=0; i<n; i++){
      let cubeMesh = new THREE.Mesh(g, m);
      cubeMesh.castShadow = true;
      meshes.push(cubeMesh);
      scene.add(cubeMesh);
  }
}

function initCannonWithThree() {

  world = new CANNON.World();
  world.gravity.set(0,-9.82, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 10;

  shape = new CANNON.Box(new CANNON.Vec3(1,1,1));
  body = new CANNON.Body({
    mass: 1
  });
  body.addShape(shape);
  bodies.push(body)
  world.addBody(body);

  var nx = 50,
    ny = 8,
    nz = 50,
    sx = 0.5,
    sy = 0.5,
    sz = 0.5;

  // Create a sphere
  var mass = 5, radius = 1.3;
  sphereShape = new CANNON.Sphere(radius);
  sphereBody = new CANNON.Body({ mass: mass });
  sphereBody.addShape(sphereShape);
  sphereBody.position.set(nx*sx*0.5,ny*sy+radius*2,nz*sz*0.5);
  sphereBody.linearDamping = 0.9;
  world.addBody(sphereBody);


  var wallShape = new CANNON.Plane();
  var wallBody = new CANNON.Body({ mass: 0 });
  wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),Math.PI);
  wallBody.position.set(20,20,0);
  world.addBody(wallBody);

  var groundShape = new CANNON.Plane();
  groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
  groundBody.position.set(0,0,0);
  world.addBody(groundBody);
}

function initThreeWithCannon() {

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 100 )
  camera.position.z = 5
  camera.position.set(50, 2, 0);
  camera.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2);
  scene.add( camera )

  let boxGeo = new THREE.BoxGeometry( 2, 2, 2 )
  let boxMat = new THREE.MeshBasicMaterial( { color: 0x0000ff } )

  mesh = new THREE.Mesh( boxGeo, boxMat )
  meshes.push( mesh )
  scene.add( mesh )

  //  add ambient light
  var ambient = new THREE.AmbientLight( 0xffffff );
  scene.add( ambient )

  light = new THREE.SpotLight( 0xffffff );
  light.position.set( 10, 30, 20 );
  light.target.position.set( 0, 0, 0 );
  scene.add(light)

  controls = new PointerLockControls( camera , sphereBody );
  scene.add( controls.getObject() );

  // add all these walls
  function createWall(floor, direction, colorOrTexture) {
    let wallGeography;
    let eastWestRelation = floor.geometry.parameters.height/2
    let northSouthRelation = floor.geometry.parameters.width/2
    if (direction === 'south' || direction === 'north') {
      wallGeography = new THREE.BoxGeometry(1, 1000, floor.geometry.parameters.height)
    }
    else if (direction == 'east' || direction === 'west') {
      wallGeography = new THREE.BoxGeometry(floor.geometry.parameters.width, 1000, 1)
    }
  
    let mat = new THREE.MeshPhongMaterial({
      emissive: 1,
      color: colorOrTexture
    })
  
    let wall = new THREE.Mesh(wallGeography, mat)
    switch (direction) {
      case 'south':
        wall.position.x = -northSouthRelation;
        wall.position.z = 0;
        break;
      case 'north':
        wall.position.x = northSouthRelation;
        wall.position.z = 0;
        break;
      case 'east':
        wall.position.x = 0;
        wall.position.z = eastWestRelation;
        break;
      case 'west':
        wall.position.x = 0;
        wall.position.z = -eastWestRelation;
        break;
    }
    return wall
  }
  
 

  // floor
  let floorGeo = new THREE.PlaneGeometry( 10000, 5000, 100, 100 );
  floorGeo.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

  let floorMat = new THREE.MeshLambertMaterial({color: 0xD43001});

  floor = new THREE.Mesh( floorGeo, floorMat );

  floor.position.copy(groundBody.position);
  floor.castShadow = true;
  floor.receiveShadow = true;
  console.log(floor)

  // let northWall = createWall(floor, 'north', 'yellow')
  // let southWall = createWall(floor, 'south', 'red')
  // let eastWall = createWall(floor, 'east', 'green')
  // let westWall = createWall(floor, 'west', 'blue')
  
  // scene.add(northWall, southWall, eastWall, westWall)
  scene.add( floor );

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize( window.innerWidth, window.innerHeight )

  document.body.appendChild( renderer.domElement )
}

function animateAndRerender() {
  requestAnimationFrame( animateAndRerender );
  updatePhysics()
  renderWithThreeAndCannon();
}

function renderWithThreeAndCannon() {
  renderer.render( scene, camera );
}

function updatePhysics() {

  if(controls.enabled){
    world.step(timeStep);
  }
  controls.update( Date.now() - time );

  // Copy coordinates from Cannon.js to Three.js
  for(var i=0; i !== meshes.length; i++){
    meshes[i].position.copy(bodies[i].position);
    meshes[i].quaternion.copy(bodies[i].quaternion);
  }
}


initCannonWithThree()
initThreeWithCannon()
animateAndRerender()

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;


if ( havePointerLock && controls !== 'undefined') {

  var element = document.body;

  var pointerlockchange = function ( event ) {

      if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

          controls.enabled = true;

          blocker.style.display = 'none';

      } else {

          controls.enabled = false;

          blocker.style.display = '-webkit-box';
          blocker.style.display = '-moz-box';
          blocker.style.display = 'box';

          instructions.style.display = '';

      }

  }

  var pointerlockerror = function ( event ) {
      instructions.style.display = '';
  }

  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

  instructions.addEventListener( 'click', function ( event ) {
      instructions.style.display = 'none';

      // Ask the browser to lock the pointer
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

      if ( /Firefox/i.test( navigator.userAgent ) ) {

          var fullscreenchange = function ( event ) {

              if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                  document.removeEventListener( 'fullscreenchange', fullscreenchange );
                  document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

                  element.requestPointerLock();
              }

          }

          document.addEventListener( 'fullscreenchange', fullscreenchange, false );
          document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

          element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

          element.requestFullscreen();

      } else {

          element.requestPointerLock();

      }

  }, false );

} else {

  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}
