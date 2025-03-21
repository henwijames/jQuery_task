$(document).ready(function () {
  const parts = {
    head,
    arms,
    legs,
  };

  $.each(parts, function (key) {
    $(`#${key}-description`).hide();
    $(`.${key}_path`).hide();
    $(`#${key}-body`).hide();
  });

  $("#head").hover(
    function () {
      $("#arms-description").fadeOut("fast");
      $(".arms_path").fadeOut("fast");
      $("#arms-body").fadeOut("fast");
      $("#legs-description").fadeOut("fast");
      $(".legs_path").fadeOut("fast");
      $("#legs-body").fadeOut("fast");
      let title = $(this).data("head-title");
      let desc = $(this).data("head-description");
      $(".head_path").show().stop(true, true).animate({ left: "450px" }, 300); // Fix animation

      $("#head-card-title").text(title);
      $(".head-card-text").text(desc);
      $("#head-description").fadeIn();
    },
    function () {
      // When hover out, reset position
      $(".head_path").animate({ left: "430px" }, 300);
    }
  );

  $("#arms, #arms2").hover(
    function () {
      $("#head-description").fadeOut("fast");
      $(".head_path").fadeOut("fast");
      $("#head-body").fadeOut("fast");
      $("#legs-description").fadeOut("fast");
      $(".legs_path").fadeOut("fast");
      $("#legs-body").fadeOut("fast");
      let title = $(this).data("arms-title");
      let desc = $(this).data("arms-description");
      $(".arms_path").show().stop(true, true).animate({ left: "430px" }, 300); // Fix animation

      $("#arms-card-title").text(title);
      $(".arms-card-text").text(desc);
      $("#arms-description").fadeIn();
    },
    function () {
      // When hover out, reset position
      $(".arms_path").animate({ left: "410px" }, 300);
    }
  );

  $("#legs, #legs2").hover(
    function () {
      $("#head-description").fadeOut("fast");
      $(".head_path").fadeOut("fast");
      $("#head-body").fadeOut("fast");
      $("#arms-description").fadeOut("fast");
      $(".arms_path").fadeOut("fast");
      $("#arms-body").fadeOut("fast");

      let title = $(this).data("legs-title");
      let desc = $(this).data("legs-description");
      $(".legs_path").show().stop(true, true).animate({ left: "430px" }, 300); // Fix animation

      $("#legs-card-title").text(title);
      $(".legs-card-text").text(desc);
      $("#legs-description").fadeIn();
    },
    function () {
      // When hover out, reset position
      $(".legs_path").animate({ left: "410px" }, 300);
    }
  );

  $.each(parts, function (key, value) {
    $(`#${key}-card-title`).click(function (event) {
      event.stopPropagation();
      $(`#${key}-body`).fadeToggle();
    });

    $(`#${key}-close`).click(function () {
      $(`#${key}-description`).fadeOut();
      $(`.${key}_path`).fadeOut();
      $(`#${key}-body`).fadeOut();
    });
  });
});

class Stage {
  constructor() {
    this.renderParam = {
      clearColor: 0x666666,
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.cameraParam = {
      left: -1,
      right: 1,
      top: 1,
      bottom: 1,
      near: 0,
      far: -1,
    };

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.geometry = null;
    this.material = null;
    this.mesh = null;

    this.isInitialized = false;
  }

  init() {
    this._setScene();
    this._setRender();
    this._setCamera();

    this.isInitialized = true;
  }

  _setScene() {
    this.scene = new THREE.Scene();
  }

  _setRender() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById("webgl-canvas"),
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(new THREE.Color(this.renderParam.clearColor));
    this.renderer.setSize(this.renderParam.width, this.renderParam.height);
  }

  _setCamera() {
    if (!this.isInitialized) {
      this.camera = new THREE.OrthographicCamera(
        this.cameraParam.left,
        this.cameraParam.right,
        this.cameraParam.top,
        this.cameraParam.bottom,
        this.cameraParam.near,
        this.cameraParam.far
      );
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    this.camera.aspect = windowWidth / windowHeight;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(windowWidth, windowHeight);
  }

  _render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this._setCamera();
  }

  onRaf() {
    this._render();
  }
}

class Mesh {
  constructor(stage) {
    this.canvas = document.getElementById("webgl-canvas");
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;

    this.uniforms = {
      resolution: { type: "v2", value: [this.canvasWidth, this.canvasHeight] },
      time: { type: "f", value: 0.0 },
      xScale: { type: "f", value: 1.0 },
      yScale: { type: "f", value: 0.5 },
      distortion: { type: "f", value: 0.05 },
    };

    this.stage = stage;

    this.mesh = null;

    this.xScale = 1.0;
    this.yScale = 0.5;
    this.distortion = 0.05;
  }

  init() {
    this._setMesh();
    // this._setGui();
  }

  _setMesh() {
    const position = [
      -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0,
      1.0, 0.0, 1.0, 1.0, 0.0,
    ];

    const positions = new THREE.BufferAttribute(new Float32Array(position), 3);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", positions);

    const material = new THREE.RawShaderMaterial({
      vertexShader: document.getElementById("js-vertex-shader").textContent,
      fragmentShader: document.getElementById("js-fragment-shader").textContent,
      uniforms: this.uniforms,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geometry, material);

    this.stage.scene.add(this.mesh);
  }

  _diffuse() {
    // gsap.to(this.mesh.material.uniforms.xScale, {
    //   value: 2,
    //   duration: 0.1,
    //   ease: 'power2.inOut',
    //   repeat: -1,
    //   yoyo: true
    // });
    // gsap.to(this.mesh.material.uniforms.yScale, {
    //   value: 1,
    //   duration: 0.1,
    //   ease: 'power2.inOut',
    //   repeat: -1,
    //   yoyo: true
    // });
  }

  _render() {
    this.uniforms.time.value += 0.01;
  }

  _setGui() {
    const parameter = {
      xScale: this.xScale,
      yScale: this.yScale,
      distortion: this.distortion,
    };
    const gui = new dat.GUI();
    gui.add(parameter, "xScale", 0.0, 5.0, 0.01).onChange((value) => {
      this.mesh.material.uniforms.xScale.value = value;
    });
    gui.add(parameter, "yScale", 0.0, 1.0, 0.01).onChange((value) => {
      this.mesh.material.uniforms.yScale.value = value;
    });
    gui.add(parameter, "distortion", 0.001, 0.1, 0.001).onChange((value) => {
      this.mesh.material.uniforms.distortion.value = value;
    });
  }

  onRaf() {
    this._render();
  }
}

(() => {
  const stage = new Stage();

  stage.init();

  const mesh = new Mesh(stage);

  mesh.init();

  window.addEventListener("resize", () => {
    stage.onResize();
  });

  window.addEventListener("load", () => {
    setTimeout(() => {
      mesh._diffuse();
    }, 1000);
  });

  const _raf = () => {
    window.requestAnimationFrame(() => {
      stage.onRaf();
      mesh.onRaf();

      _raf();
    });
  };

  _raf();
})();
