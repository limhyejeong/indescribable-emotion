<template>
  <div class="loadingView" v-show="!isLoad">
    Loading emotions...
    <!-- <div class="progress"><div class="bar"></div></div> -->
  </div>

  <CheckPassword v-show="isDelete" v-bind:selectedData="selectedData" />

  <section v-show="isClick" class="modal">
    <div class="outputInfo">
      <div class="title">
        <span class="outputInfoName">{{ selectedData.name }}</span
        >님의 감정
      </div>
      <div class="outputInfoEmoji">
        <h5>분석 이모지</h5>
        {{ selectedData.emoji }}
      </div>
      <div class="outputInfoContent">
        <h5>감정 설명</h5>
        {{ selectedData.content }}
      </div>
    </div>

    <div class="outputInfo outputCategoryDiv">
      <h5>
        감정 유형
        <span class="outputInfoCategory">{{ categoryText }}</span>
      </h5>
      <div class="outputRadarDiv">
        <canvas ref="chartCanvas" width="220" height="220" />
      </div>
    </div>

    <div class="outputInfo outputActivityDiv">
      <h5>
        감정의 활성도
        <span class="outputInfoActivity">{{ selectedData.activity }}</span>
      </h5>
      <div class="outputProgressDiv">
        <div class="outputProgress"></div>
      </div>
    </div>

    <button @click="isDelete = true" class="deleteBtn">감정 삭제</button>

    <button @click="closeModal" class="closeModal">
      <img src="@/assets/img/plus.svg" />
    </button>
  </section>

  <canvas id="homeCanvas" />
</template>

<script>
import { useHomeStore } from "@/stores/home";
import { storeToRefs } from "pinia";
import { ref, onMounted, watch } from "vue";
import * as TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CreateEmoject,
  noiseSettings,
  noiseAnimation,
} from "@/assets/js/CreateEmoject";
// import { vertexShader, fragmentShader, twist } from "@/assets/js/twist";
import { PreventDragClick } from "@/assets/js/PreventDragClick";
import { chart, radarChart } from "@/assets/js/radarChartHome";
import { CategoryTrans } from "@/assets/js/CategoryTrans";
import CheckPassword from "@/components/CheckPassword.vue";

export default {
  name: "EmotionSpace",
  components: {
    CheckPassword,
  },
  setup() {
    let isLoad = ref(false);
    const store = useHomeStore();
    const { emotions, isDelete } = storeToRefs(store);
    const { fetchEmotions } = store;
    let isClick = ref(false);

    THREE.DefaultLoadingManager.onProgress = function (
      url,
      itemsLoaded,
      itemsTotal
    ) {
      if (itemsLoaded === itemsTotal) {
        isLoad.value = true;
      }
    };

    fetchEmotions(); // home.js pinia에서 데이터 불러오기

    // threejs 추가하기
    let scene, renderer, camera, controls;
    let width = window.innerWidth,
      height = window.innerHeight;
    let homeCanvas;
    // const homeRadarChart = ref("");
    let chartCanvas = ref("");
    let categoryText = ref("");

    // 기본적인 Sence 제작 함수
    function initThreejs() {
      scene = new THREE.Scene();
      // scene.background = new THREE.Color(0xffffff);
      scene.fog = new THREE.Fog(0x000000, 0, 80);
      // scene.fog = new THREE.Fog(0x000000, 15, 45);
      homeCanvas = document.querySelector("#homeCanvas");
      renderer = new THREE.WebGLRenderer({
        canvas: homeCanvas,
        antialias: true,
        alpha: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

      camera = new THREE.PerspectiveCamera(45, width / height, 1, 100);
      camera.position.x = 0;
      camera.position.y = 20;
      camera.position.z = 25;
      scene.add(camera);

      const light = new THREE.AmbientLight(0xffffff, 2); // soft white light
      const pointLight = new THREE.PointLight(0xff0000, 2, 1);
      pointLight.position.set(50, 50, 50);

      scene.add(light, pointLight);
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.maxDistance = 40;
      controls.minDistance = 5;
      controls.autoRotateSpeed = 1;
    }

    const group = new THREE.Group();

    // emotions에 데이터가 들어오면 감정 오브젝트를 뿌려줌
    watch(emotions, () => {
      importEmoject(emotions._object.emotions[0], 0);
      for (let i = 1; i < emotions._object.emotions.length; i++) {
        importEmoject(emotions._object.emotions[i], 20);
      }
      scene.add(group);
      // console.log(emotions._object.emotions.length);
    });

    // 감정 오브젝트 만드는 함수
    let emoject;
    const importEmoject = (data, range) => {
      emoject = CreateEmoject(
        emoject,
        data.category,
        data.activity,
        Math.floor(data.emoji.length / 2),
        data.color
      );
      emoject.userData = [data, noiseSettings]; // 이모젝트에 데이터 추가
      emoject.position.x = Math.floor(Math.random() * (range * 2) - range);
      emoject.position.y = Math.floor(Math.random() * (range * 2) - range);
      emoject.position.z = Math.floor(Math.random() * (range * 2) - range);
      // emoject.position.z = Math.floor(
      //   Math.random() * (range * 2 * 2) - range * 2
      // );
      emoject.rotation.x = Math.random() * 360;
      emoject.rotation.y = Math.random() * 360;
      let size = Math.random() * (1.3 - 0.7) + 0.7;
      emoject.scale.x = size;
      emoject.scale.y = size;
      emoject.scale.z = size;
      noiseAnimation(emoject, emoject.userData[1]);
      group.add(emoject);
    };

    // 레이캐스터 (클릭 감지)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // 클릭하면 selectedMesh 활성화, selectedData 값 변경
    let selectedData = ref({});
    let selectedMesh;
    let clicked = false;

    function onPointerClick(event) {
      if (preventDragClick.mouseMoved || clicked) return;
      clicked = true;

      if (isClick.value == true) {
        closeModal();
      } else {
        pointer.x = (event.clientX / width) * 2 - 1;
        pointer.y = -(event.clientY / height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        if (intersects.length !== 0) {
          // 클릭한 것이 있을 때
          for (let i = 0; i < intersects.length; i++) {
            selectedMesh = intersects[i].object;
            break;
          }
          selectedData.value = selectedMesh.userData[0];
          setProgress(selectedData.value.activity);
          radarChart(
            chartCanvas.value.getContext("2d"),
            selectedData.value.categoryData
          );
          categoryText.value = CategoryTrans(selectedData.value.category); // 감정 한글로 변환
          openModal();
        } else {
          selectedMesh = null;
        }
      }

      setTimeout(() => {
        clicked = false;
      }, 1000);
    }

    const settings = {
      speed: 0.5,
      density: 1,
      strength: 0.8,
      frequency: 2.0,
      amplitude: 10.0,
      intensity: 1,
    };
    let duration = 700;
    let saveControls;

    // 메쉬에 카메라 포커스가 맞춰지고 모달이 열리는 함수
    function openModal() {
      setTimeout(() => (isClick.value = true), duration / 2);
      saveControls = controls.saveState();

      // 카메라 위치 변경
      new TWEEN.Tween(camera.position)
        .to(
          {
            x: selectedMesh.position.x,
            y: selectedMesh.position.y,
            z: selectedMesh.position.z + 5,
          },
          duration
        )
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

      new TWEEN.Tween(scene)
        .to(
          {
            fog: new THREE.Fog(0x000000, 5, 10),
          },
          duration
        )
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();

      // 카메라 시점 변경
      new TWEEN.Tween(controls)
        .to({ target: selectedMesh.position }, duration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    }

    // 모달 닫기
    function closeModal() {
      isClick.value = false;
      controls.reset();
      chart.destroy();

      new TWEEN.Tween(scene)
        .to(
          {
            // fog: new THREE.Fog(0x000000, 15, 45),
            fog: new THREE.Fog(0x000000, 10, 80),
          },
          500
        )
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
    }

    // 프로그래스 바 함수
    function setProgress(activity) {
      const outputProgress = document.querySelector(".outputProgress");
      outputProgress.style.width = activity * 10 + "%";
    }

    // 브라우저 창 사이즈
    function setSize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.render(scene, camera);

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", setSize);

    // 모든 emoject에 노이즈 애니메이션
    function emojectsMotion() {
      for (let i = 0; i < group.children.length; i++) {
        noiseAnimation(group.children[i], group.children[i].userData[1]);
      }
    }

    // 애니메이션
    function animate() {
      requestAnimationFrame(animate);
      if (isClick.value == false) {
        controls.autoRotate = true;
        // emojectsMotion();
      } else {
        selectedMesh.rotation.y += 0.01;
        selectedMesh.rotation.x += 0.01;
        noiseAnimation(selectedMesh, selectedMesh.userData[1]);
        controls.autoRotate = false;
      }
      controls.update();
      TWEEN.update();
      renderer.render(scene, camera);
    }

    let preventDragClick; // 드래그 시 클릭 방지

    onMounted(() => {
      initThreejs();

      animate();
      homeCanvas.addEventListener("click", onPointerClick);
      preventDragClick = new PreventDragClick(homeCanvas);
    });

    return {
      isLoad,
      isDelete,
      isClick,
      closeModal,
      openModal,
      importEmoject,
      renderer,
      camera,
      scene,
      settings,
      emotions,
      controls,
      selectedData,
      chartCanvas,
      categoryText,
    };
  },
};
</script>

<style lang="scss">
.loadingView {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-weight: bold;
  // text-transform: uppercase;
  color: var(--point);
  // font-family: "Ydestreet";
  z-index: 100;
  letter-spacing: 0rem;
}

.modal {
  position: absolute;
  right: 50px;
  top: 50%;
  z-index: 1;
  transform: translate(0, -50%);
  transition: 0.25s;
}

.closeModal {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  right: -15px;
  top: -15px;
  background: var(--point);
  font-size: 1.2rem;
  margin: 5px 5px 0 0;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 15px;
    height: 15px;
    transform: rotate(45deg);
    opacity: 0.75;
    filter: invert(1);
  }
}

.deleteBtn {
  width: 100%;
  border-radius: 8px;
  padding: 18px;
  background: linear-gradient(0deg, #e91e4b, #ff4a4a);
  color: var(--black);
  font-weight: 700;
  border: 1px solid var(--background);
  // box-shadow: inset 2px 2px 4px var(--gray1), inset -3px -3px 10px #000,
  //   10px 10px 20px var(--shadow);
  border: none;

  &:hover {
    box-shadow: inset 3px 3px 10px #000;
    color: var(--gray1);
  }
}

@media screen and (min-width: 100px) and (max-width: 860px) {
  .modal {
    margin-top: 500px;
    right: 0;
    z-index: 1;
    width: 100%;
    padding: 20px;

    .closeModal {
      right: 0px;
      top: -5px;
    }
  }
}
</style>
