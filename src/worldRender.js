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

export function initCannonWithThree() {

  world = new CANNON.World();
  world.gravity.set(0,-9.82, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 10;

  shape = new CANNON.Box(new CANNON.Vec3(1,1,1));
  body = new CANNON.Body({
    mass: 1
  });
  body.addShape(shape);
  body.angularVelocity.set(0,10,0);
  body.angularDamping = 0.5;
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

  var groundShape = new CANNON.Plane();
  groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
  groundBody.position.set(0,0,0);
  world.addBody(groundBody);
}

export function initThreeWithCannon() {

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

  var ambient = new THREE.AmbientLight( 0x111111 );
  scene.add( ambient )
  controls = new PointerLockControls( camera , sphereBody );
  scene.add( controls.getObject() );

  // floor
  let floorGeo = new THREE.PlaneGeometry( 300, 300, 50, 50 );
  floorGeo.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

  let floorMat = new THREE.MeshLambertMaterial({color: 0xD43001});
  window.floorMat = floorMat

  mesh = new THREE.Mesh( floorGeo, floorMat );

  mesh.position.copy(groundBody.position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add( mesh );

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize( window.innerWidth, window.innerHeight )

  document.body.appendChild( renderer.domElement )
}

export function animateAndRerender() {
  requestAnimationFrame( animateAndRerender );
  updatePhysics()
  renderWithThreeAndCannon();
}

function renderWithThreeAndCannon() {
  renderer.render( scene, camera );
}

export function updatePhysics() {

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
