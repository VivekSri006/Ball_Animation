import * as THREE from 'https://cdn.skypack.dev/three@0.136';

import {OrbitControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/OrbitControls.js';

const DEFAULT_MASS = 0;


class RigidBody {
  constructor() {
  }

  setRestitution(val) {
    this.body_.setRestitution(0.5);
  }

  setFriction(val) {
    this.body_.setFriction(0.5);
  }

  setRollingFriction(val) {
    this.body_.setRollingFriction(0.5);
  }

  

  createBox(mass, pos, quat, size) {
    this.transform_ = new Ammo.btTransform();
    this.transform_.setIdentity();
    this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    this.transform_.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
    this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);


    const btSize = new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
    this.shape_ = new Ammo.btBoxShape(btSize);
    this.shape_.setMargin(0.05);

    this.inertia_ = new Ammo.btVector3(0, 0, 0);
    if (mass > 0) {
      this.shape_.calculateLocalInertia(mass, this.inertia_);
    }

    this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this.shape_, this.inertia_);
    this.body_ = new Ammo.btRigidBody(this.info_);

    Ammo.destroy(btSize);
  }

  createSphere(mass, pos, size) {
    this.transform_ = new Ammo.btTransform();
    this.transform_.setIdentity();
    this.transform_.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z));
    this.transform_.setRotation(new Ammo.btQuaternion(0, 0, 0, 1));
    this.motionState_ = new Ammo.btDefaultMotionState(this.transform_);

    this.shape_ = new Ammo.btSphereShape(size);
    this.shape_.setMargin(0.5);

    this.inertia_ = new Ammo.btVector3(0, 0, 0);
    if(mass > 0) {
      this.shape_.calculateLocalInertia(mass, this.inertia_);
    }

    this.info_ = new Ammo.btRigidBodyConstructionInfo(mass, this.motionState_, this.shape_, this.inertia_);
    this.body_ = new Ammo.btRigidBody(this.info_);
  }
}


class BasicWorldDemo {
  constructor() {
  }

  initialize() {
    this.collisionConfiguration_ = new Ammo.btDefaultCollisionConfiguration();
    this.dispatcher_ = new Ammo.btCollisionDispatcher(this.collisionConfiguration_);
    this.broadphase_ = new Ammo.btDbvtBroadphase();
    this.solver_ = new Ammo.btSequentialImpulseConstraintSolver();
    this.physicsWorld_ = new Ammo.btDiscreteDynamicsWorld(
    this.dispatcher_, this.broadphase_, this.solver_, this.collisionConfiguration_);
    this.physicsWorld_.setGravity(new Ammo.btVector3(0, -100, 0));

    this.threejs_ = new THREE.WebGLRenderer({
      antialias: true,
    });
    this.threejs_.shadowMap.enabled = true;
    this.threejs_.shadowMap.type = THREE.PCFSoftShadowMap;
    this.threejs_.setPixelRatio(window.devicePixelRatio);
    this.threejs_.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.threejs_.domElement);

    window.addEventListener('resize', () => {
      this.onWindowResize_();
    }, true);

    this.camera_ = new THREE.PerspectiveCamera(75, 1920 / 1080,2.0,1000.0);
    this.camera_.position.set(75, 30,55);
    this.scene_ = new THREE.Scene();

    let hemiLight = new THREE.SpotLight(  0xffffff, 0.4);
    hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
    hemiLight.position.set( 30, -10, 30 );
    this.scene_.add( hemiLight );
  
    let dirLight = new THREE.DirectionalLight( 0xffffff , 1.3);
    dirLight.color.setHSL( 0.1, 0.4, 0.95 );
    dirLight.position.set(1, 1.75, 2);
    dirLight.position.multiplyScalar( 100 );
    this.scene_.add( dirLight );
  
    dirLight.castShadow = true;
  
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    
    dirLight.shadow.camera.left = -60;
    dirLight.shadow.camera.right = 60;
    dirLight.shadow.camera.top = 60;
    dirLight.shadow.camera.bottom = -60;
  
    dirLight.shadow.camera.far = 13500;

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        './resources/posx.jpg',
        './resources/negx.jpg',
        './resources/posy.jpg',
        './resources/negy.jpg',
        './resources/posz.jpg',
        './resources/negz.jpg',
    ]);
    this.scene_.background = texture;

    const controls = new OrbitControls(
    this.camera_, this.threejs_.domElement);
    controls.target.set(0, 10, 0);
    // controls.enableRotate  = false;
    controls.enableZoom = false;
    controls.update();
    var mat=new THREE.ShadowMaterial()
    mat.opacity = 0.7;
    const ground = new THREE.Mesh(
    new THREE.BoxGeometry(60,0.1, 60),
    // mat)
    new THREE.MeshStandardMaterial({color: 0xffffff}));
    // ground.castShadow = true;
    ground.receiveShadow = true;
    this.scene_.add(ground);

    const rbGround = new RigidBody();
    rbGround.createBox(0, ground.position, ground.quaternion, new THREE.Vector3(100, 1, 100));
    rbGround.setRestitution(0.01);
    this.physicsWorld_.addRigidBody(rbGround.body_);

    this.rigidBodies_ = [];

    var Texture1 = THREE.ImageUtils.loadTexture( './resources/333q.jpg' );
    var Ball1 = new THREE.Mesh(
            new THREE.SphereGeometry(3),
            new THREE.MeshStandardMaterial( {  map: Texture1} ))
            Ball1.position.set( 9, 60,15);
            Ball1.castShadow = true;
            Ball1.receiveShadow = true;
            this.scene_.add(Ball1);
            var rbBall1 = new RigidBody();
            rbBall1.createSphere(1, Ball1.position,3);
            rbBall1.setRestitution(0.5);
            rbBall1.setFriction(1);
            rbBall1.setRollingFriction(1);
            this.physicsWorld_.addRigidBody(rbBall1.body_);         
            this.rigidBodies_.push({mesh: Ball1, rigidBody: rbBall1});
  var Texture2 = THREE.ImageUtils.loadTexture( './resources/222q.jpg' );
  var  b= new THREE.SphereGeometry(5.5)
    const Ball2 = new THREE.Mesh(
            b,
            new THREE.MeshStandardMaterial({map: Texture2} ));
            console.log(b);
            Ball2.position.set( 8,100,6);
            Ball2.castShadow = true;
            Ball2.receiveShadow = true;
            this.scene_.add(Ball2);
            var rbBall2 = new RigidBody();
            rbBall2.createSphere(2, Ball2.position,5.5);
            rbBall2.setRestitution(0.5);
            this.physicsWorld_.addRigidBody(rbBall2.body_);         
            this.rigidBodies_.push({mesh: Ball2, rigidBody: rbBall2});

  var Texture3 = THREE.ImageUtils.loadTexture( './resources/111q.jpg' );
    var Ball3 = new THREE.Mesh(
            new THREE.SphereGeometry(8,100,100), new THREE.MeshStandardMaterial( {  map: Texture3} ))
            Ball3.position.set(-2, 160,-10);
            Ball3.castShadow = true;
            Ball3.receiveShadow = true;
            this.scene_.add(Ball3);
            var rbBall3 = new RigidBody();
            rbBall3.createSphere(1, Ball3.position,8);
            rbBall3.setRestitution(0.5);
            rbBall3.setFriction(1);
            rbBall3.setRollingFriction(1);
            this.physicsWorld_.addRigidBody(rbBall3.body_);         
            this.rigidBodies_.push({mesh: Ball3, rigidBody: rbBall3});
            this.tmpTransform_ = new Ammo.btTransform();
            this.countdown_ = 1.0;
            this.count_ = 0;
            this.previousRAF_ = null;
            this.raf_();
  }
  

  onWindowResize_() {
    this.camera_.aspect = window.innerWidth / window.innerHeight;
    this.camera_.updateProjectionMatrix();
    this.threejs_.setSize(window.innerWidth, window.innerHeight);
  }

  raf_() {
    requestAnimationFrame((t) => {
      if (this.previousRAF_ === null) {
        this.previousRAF_ = t;
      }
      this.step_(t - this.previousRAF_);
      this.threejs_.render(this.scene_, this.camera_);
      this.raf_();
      this.previousRAF_ = t;
    });
  }

  step_(timeElapsed) {
    const timeElapsedS = timeElapsed * 0.001;
    this.countdown_ -= timeElapsedS;
    if (this.countdown_ < 0 && this.count_ < 10) {
      this.countdown_ = 0.25;
      this.count_ += 1;
    }

    this.physicsWorld_.stepSimulation(timeElapsedS, 10);

    for (let i = 0; i < this.rigidBodies_.length; ++i) {
      this.rigidBodies_[i].rigidBody.motionState_.getWorldTransform(this.tmpTransform_);
      const pos = this.tmpTransform_.getOrigin();
      const quat = this.tmpTransform_.getRotation();
      const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
      const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
      this.rigidBodies_[i].mesh.position.copy(pos3);
      this.rigidBodies_[i].mesh.quaternion.copy(quat3);
      this.rigidBodies_[0].mesh.rotation.x=-12.5
      this.rigidBodies_[0].mesh.rotation.y=1
      this.rigidBodies_[0].mesh.rotation.z=3.9
      this.rigidBodies_[1].mesh.rotation.x=-5.8
      this.rigidBodies_[1].mesh.rotation.z=-23.1
      this.rigidBodies_[2].mesh.rotation.x=-0.24
      this.rigidBodies_[2].mesh.rotation.y=47
    }
  }
}


let APP_ = null;

window.addEventListener('DOMContentLoaded', async () => {
  Ammo().then((lib) => {
    Ammo = lib;
    APP_ = new BasicWorldDemo();
    APP_.initialize();
  });
});


