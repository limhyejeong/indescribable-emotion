<template>
  <div class="render">
    <Renderer ref="renderer" antialias orbit-ctrl resize="window">
      <Camera :position="{ x: 5, y: 5, z: 5 }" />

      <Scene ref="Scene" background="#000">
        <AmbientLight :position="{ x: 10, y: 10, z: 10 }" :intensity="0.5" />
        <PointLight :position="{ x: 10, y: 10, z: 10 }" :intensity="1" />

        <Cone
          ref="sphereRef"
          :position="{ z: 0, y: 0, z: 0 }"
          :radialSegments="100"
          :heightSegments="1"
          :scale="{ x: 1, y: 1, z: 1 }"
          :rotation="{
            y: Math.PI / 4,
            z: Math.PI / 4,
          }"
          :cast-shadow="true"
          :receive-shadow="true"
        >
          <!-- <PhongMaterial color="#dd00dd" /> -->
          <MatcapMaterial src="./assets/textures/soul2.jpg" />
          <!-- <ShaderMaterial
            :props="{
              uniforms: {
                uTime: { value: 0 },
                uSpeed: { value: settings.speed },
                uDistortion: { value: 0 },
                uNoiseDensity: { value: settings.density },
                uNoiseStrength: { value: settings.strength },
                uFrequency: { value: settings.frequency },
                uAmplitude: { value: settings.amplitude },
                uIntensity: { value: settings.intensity },
                uColor: { value: settings.color },
                uLightColor: { value: settings.lightColor },
                uLightDirection: { value: settings.lightDirection },
                uBrightness: { value: settings.brightness },
                uContrast: { value: settings.contrast },
                uOscilation: { value: settings.oscilation },
                uPhase: { value: settings.phase },
              },
              vertexShader: vertexShader,
              fragmentShader: fragmentShader,
            }"
          >
            <Texture src="/assets/textures/water/water001.jpg" uniform="map" />
          </ShaderMaterial> -->
        </Cone>
      </Scene>
    </Renderer>
  </div>
</template>

<script>
import { useInputStore } from "@/stores/input";
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import {
  Renderer,
  Camera,
  Scene,
  Sphere,
  Cone,
  AmbientLight,
  PointLight,
  ShaderMaterial,
  PhongMaterial,
  Texture,
  MatcapMaterial,
} from "troisjs";
// import { makeNoise4D } from "open-simplex-noise";
import { vertexShader, fragmentShader, twist } from "@/assets/js/twist";
import * as THREE from "three";
import { noise } from "@/assets/js/noise";
// import emoColRef from "@/firebase";
// import { addDoc } from "firebase/firestore";

export default {
  name: "OutputView",
  components: {
    Renderer,
    Camera,
    Scene,
    Sphere,
    Cone,
    AmbientLight,
    PointLight,
    ShaderMaterial,
    PhongMaterial,
    Texture,
    MatcapMaterial,
  },
  setup() {
    const store = useInputStore();
    const { name, emoji, content, category, activity } = storeToRefs(store);
    const { createEmotion } = store;
    const renderer = ref(null);

    let sphereRef = ref(null);
    let sphereMesh = null;
    let v3 = new THREE.Vector3();
    let clock = new THREE.Clock();
    let noiseSettings = {
      진폭: 2,
      반경: 1,
      속도: 1,
    };
    // let isCreated = ref(false);

    const settings = {
      speed: 1,
      distortion: 1, //왜곡
      density: 1, //밀도
      strength: 0.1, //힘
      frequency: 1, //빈도 (회전)
      amplitude: 1, //진폭 (회전)
      intensity: 1, //대비
      color: new THREE.Color(0xffffff),
      lightColor: new THREE.Color(0xf9c53a),
      lightDirection: new THREE.Vector3(0.0, 1.0, 0.0),
      brightness: new THREE.Vector3(1.0, 1.0, 1.0),
      contrast: new THREE.Vector3(1.0, 1.0, 1.0),
      oscilation: new THREE.Vector3(0.1, 0.1, 0.1),
      phase: new THREE.Vector3(0.1, 0.1, 0.1),
    };

    function createObj() {
      // createShapes();
      // isCreated.value = true;
      sphereMesh = sphereRef.value.mesh;
      sphereMesh.geometry.positionData = [];
      for (let i = 0; i < sphereMesh.geometry.attributes.position.count; i++) {
        v3.fromBufferAttribute(sphereMesh.geometry.attributes.position, i);
        sphereMesh.geometry.positionData.push(v3.clone());
      }
    }

    onMounted(() => {
      createObj();
      renderer?.value?.onBeforeRender(() => {
        if (sphereMesh != null) {
          noise(sphereMesh, clock, noiseSettings, v3);
          // twist(sphereMesh, clock, settings);
          sphereMesh.rotation.y += 0.01;
        }
      });
    });

    return {
      store,
      name,
      emoji,
      content,
      category,
      activity,
      createEmotion,
      renderer,
      sphereRef,
      vertexShader,
      fragmentShader,
      settings,
      createObj,
      noiseSettings,
    };
  },
};
</script>
