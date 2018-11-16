export default class PhysicalWorld {
  constructor() {
    real = new CANNON.World();

  }
  initBasePhysics() {
    this.real.gravity.set(0,0,0);
    this.real.broadphase = new CANNON.NaiveBroadphase();
    this.real.solver.iterations = 10;
  }
}