import THREElib from 'three-js'

var THREE = THREElib();

var container;
var camera;
var scene;
var spheres = [];
var renderer;
var mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', onDocumentMouseMove, false);
window.addEventListener('resize', onWindowResize, false);

init();
animate();
// render();

function init() {
	container = document.getElementById('container');

	camera = new THREE.PerspectiveCamera(60, 
		window.innerWidth / window.innerHeight,
		1, 100000);
	camera.position.z = 1000;

	scene = new THREE.Scene();
	scene.background = new THREE.CubeTextureLoader()
								.setPath('png/hdrmap/ggx_filtered/')
								.load([
									'pisa_mip1_face0.png',
									'pisa_mip1_face1.png',
									'pisa_mip1_face2.png',
									'pisa_mip1_face3.png',
									'pisa_mip1_face4.png',
									'pisa_mip1_face5.png'
								]);

	let geometry = new THREE.SphereBufferGeometry(100, 32, 16);
	let material = new THREE.MeshBasicMaterial({ color: 0xffffff,
												 envMap: scene.background });


	createSphere(scene, geometry, material);

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	container.appendChild(renderer.domElement);
}

function animate() {
	requestAnimationFrame(animate);
	render();
}

function render() {
	camera.position.x += (mouseX - camera.position.x) * .05;
	camera.position.y += (-mouseY - camera.position.y) * .05;


	camera.lookAt(scene.position);
	renderer.render(scene, camera);
}

function createSphere(scene, geometry, material, x = 0, y = 0, z = 0) {
	let mesh = new THREE.Mesh(geometry, material);
	mesh.position.x = x;
	mesh.position.y = y;
	mesh.position.z = z;

	scene.add(mesh);
	spheres.push(mesh);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
	mouseX = (event.clientX - window.innerWidth / 2) * 10;
	mouseY = (event.clientY - window.innerHeight / 2) * 10;
}