<template>
  <div class="info">
    <div>선택한 이모지 : {{ emoji }}</div>
    <div>이름 : {{ name }}</div>
    <div>설명 : {{ content }}</div>
    <br />
    <div>감정 : {{ category }}</div>
    <div>활성도 : {{ activity }}</div>

    <button @click="createObj">Hi</button>

    <button @click="createEmotion(name, emoji, content, category, activity)">
      감정 등록
    </button>
  </div>

  <div class="canvas"></div>
</template>

<script>
import { useInputStore } from "@/stores/input";
import { storeToRefs } from "pinia";
// import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import * as THREE from "three";
// import TrackballControls from "three-trackballcontrols";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { onMounted, onUpdated } from "@vue/runtime-core";
import { noise, perlin3 } from "perlin";
// import perlinNoise3d from "perlin-noise-3d";

// import { ref } from "vue";
// import {
//   BloomEffect,
//   EffectComposer,
//   GlitchPass,
//   EffectPass,
//   RenderPass,
// } from "postprocessing";

export default {
  name: "TheCanvas",

  setup() {
    const store = useInputStore();
    const { name, emoji, content, category, activity } = storeToRefs(store);
    const { createEmotion } = store;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const light = new THREE.DirectionalLight("hsl(0, 100%, 100%)");
    let geometry = null;
    let material = null;
    let cube = null;
    const axes = new THREE.AxesHelper(5);
    let controls = [];
    let speed = 0.01;
    scene.add(camera);
    scene.add(light);
    scene.add(axes);
    renderer.setSize(window.innerWidth, window.innerHeight);
    light.position.set(0, 0, 10);
    camera.position.z = 5;
    scene.background = new THREE.Color("hsl(0, 100%, 100%)");
    controls = new OrbitControls(camera, renderer.domElement);
    // controls.rotateSpeed = 1.0;
    // controls.zoomSpeed = 5;
    // controls.panSpeed = 0.8;
    // controls.noZoom = false;
    // controls.noPan = false;
    // controls.dynamicDampingFactor = 0.3;

    function createObj() {
      cube = null;
      if (category.value == "joy") {
        geometry = new THREE.BoxGeometry(1, 1, 1);
      } else {
        geometry = new THREE.SphereGeometry(1, 32, 16);
        console.log(category.value);
      }
      material = new THREE.MeshStandardMaterial({
        side: THREE.FrontSide,
        color: "hsl(0, 100%, 50%)",
        wireframe: false,
      });
      cube = new THREE.Mesh(geometry, material);

      scene.add(cube);
      // console.log(cube);
    }

    let k = 3;
    // let p;

    function perlin() {
      let time = performance.now() * 0.003;

      const position = cube.geometry.attributes.position;
      const vector = new THREE.Vector3();

      for (let i = 0; i < position.count; i++) {
        vector.fromBufferAttribute(position, i);
        vector.applyMatrix4(cube.matrixWorld);

        vector
          .normalize()
          .multiplyScalar(
            1 +
              0.3 *
                noise.perlin3(
                  Math.floor(vector.x * k + time),
                  Math.floor(vector.y * k),
                  Math.floor(vector.z * k)
                )
          );
      }

      // for (let i = 0; i < cube.geometry.vertices.length; i++) {
      // let vertices = cube.geometry.attributes.position.array;
      // let p = {
      //   x: cube.geometry.attributes.position.array[i],
      //   y: cube.geometry.attributes.position.array[i + 1],
      //   z: cube.geometry.attributes.position.array[i + 2],
      // };
      // console.log(pos);
      // console.log(p);
      // p = new THREE.Vector3(
      //   cube.geometry.attributes.position.array[i],
      //   cube.geometry.attributes.position.array[i + 1],
      //   cube.geometry.attributes.position.array[i + 2]
      // );

      // var p = cube.geometry.vertices[i];
      // p.normalize().multiplyScalar(
      //   1 + 0.3 * noise.perlin3(p.x * k + time, p.y * k, p.z * k)
      // );

      geometry.computeVertexNormals();
      geometry.normalsNeedUpdate = true;
      geometry.verticesNeedUpdate = true;
    }

    // const noise = new perlinNoise3d();

    // function per3d() {
    //   for (
    //     let i = 0;
    //     i < cube.geometry.attributes.position.array.length;
    //     i += 3
    //   ) {
    //     p = new THREE.Vector3(
    //       cube.geometry.attributes.position.array[i],
    //       cube.geometry.attributes.position.array[i + 1],
    //       cube.geometry.attributes.position.array[i + 2]
    //     );
    //   }

    //   noise.get(p.x, p.y, p.z);
    //   console.log(noise.get(p.x, p.y, p.z));
    // }

    function animate() {
      if (cube !== null) {
        cube.rotation.y += speed;
        perlin();
      }
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    onMounted(() => {
      document.querySelector(".canvas").appendChild(renderer.domElement);
      animate();
    });

    onUpdated(() => {
      //   rotate: () => {
      //     if (this.speed === "") {
      //       return 0;
      //     } else {
      //       return this.speed;
      //     }
      //   };
    });

    return {
      name,
      emoji,
      content,
      category,
      activity,
      scene,
      camera,
      controls,
      //   rotate,
      renderer,
      light,
      cube,
      axes,
      speed,
      animate,
      createObj,
      createEmotion,
    };
  },
  data: function () {
    return {};
  },
  created: function () {},
  mounted: function () {},
  methods: {},
  computed: {},
};
</script>

<style lang="scss">
canvas {
  position: inherit;
  border: 1px solid #999;
}
</style>