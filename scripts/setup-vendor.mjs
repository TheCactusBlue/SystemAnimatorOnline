/**
 * setup-vendor.mjs
 *
 * Copies vendored files from node_modules to the paths expected by the
 * legacy script-tag/importmap loading system.
 *
 * Run with: node scripts/setup-vendor.mjs
 * Or:       pnpm setup-vendor
 */

import {
  cpSync,
  mkdirSync,
  existsSync,
  copyFileSync,
  rmSync,
  realpathSync,
  lstatSync,
} from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const NM = resolve(ROOT, "node_modules");

/**
 * Resolve a path through pnpm symlinks to the real file.
 */
function resolveNM(pkg) {
  const p = resolve(NM, pkg);
  if (!existsSync(p)) return null;
  try {
    return realpathSync(p);
  } catch {
    return p;
  }
}

function copy(src, dest) {
  const srcPath = resolveNM(src);
  const destPath = resolve(ROOT, dest);

  if (!srcPath) {
    console.warn(`  SKIP (not found): ${src}`);
    return;
  }

  mkdirSync(dirname(destPath), { recursive: true });
  copyFileSync(srcPath, destPath);
  console.log(`  ${dest}`);
}

function copyDir(src, dest) {
  const srcPath = resolveNM(src);
  const destPath = resolve(ROOT, dest);

  if (!srcPath) {
    console.warn(`  SKIP (not found): ${src}`);
    return;
  }

  // Remove existing destination to avoid conflicts
  if (existsSync(destPath)) {
    rmSync(destPath, { recursive: true, force: true });
  }

  mkdirSync(destPath, { recursive: true });
  // dereference: true resolves pnpm symlinks to copy actual files
  cpSync(srcPath, destPath, { recursive: true, dereference: true });
  console.log(`  ${dest}/`);
}

console.log("Setting up vendor files from node_modules...\n");

// ── js/ directory: simple library files ──────────────────────────────
console.log("Copying JS libraries to js/...");
copy("jszip/dist/jszip.js", "js/jszip.js");
copy("encoding-japanese/encoding.min.js", "js/encoding.min.js");
copy("encoding-japanese/encoding.min.js.map", "js/encoding.min.js.map");
copy("nipplejs/dist/nipplejs.js", "js/nipplejs.js");
copy("peerjs/dist/peerjs.min.js", "js/peerjs.min.js");
copy("rbush/rbush.min.js", "js/rbush.min.js");
copy("jsmediatags/dist/jsmediatags.min.js", "js/jsmediatags.js");

// ── js/@huggingface/ ─────────────────────────────────────────────────
console.log("\nCopying @huggingface packages...");
copyDir("@huggingface/jinja", "js/@huggingface/jinja");
copyDir("@huggingface/transformers", "js/@huggingface/transformers");

// ── js/@mediapipe/ ───────────────────────────────────────────────────
console.log("\nCopying @mediapipe packages...");
copyDir("@mediapipe/holistic", "js/@mediapipe/holistic");
mkdirSync(resolve(ROOT, "js/@mediapipe/tasks"), { recursive: true });
copyDir("@mediapipe/tasks-vision", "js/@mediapipe/tasks/tasks-vision");

// MediaPipe WASM/binary files expected in js/ root (loaded at runtime)
// Each file comes from its respective @mediapipe/* package.
console.log("\nCopying MediaPipe WASM/binary assets to js/...");
const mediapipeAssets = [
  // From @mediapipe/holistic
  ["@mediapipe/holistic/holistic_solution_packed_assets.data", "js/holistic_solution_packed_assets.data"],
  ["@mediapipe/holistic/holistic_solution_simd_wasm_bin.wasm", "js/holistic_solution_simd_wasm_bin.wasm"],
  ["@mediapipe/holistic/holistic_solution_wasm_bin.wasm", "js/holistic_solution_wasm_bin.wasm"],
  // From @mediapipe/face_mesh
  ["@mediapipe/face_mesh/face_mesh_solution_packed_assets.data", "js/face_mesh_solution_packed_assets.data"],
  ["@mediapipe/face_mesh/face_mesh_solution_simd_wasm_bin.wasm", "js/face_mesh_solution_simd_wasm_bin.wasm"],
  ["@mediapipe/face_mesh/face_mesh_solution_wasm_bin.wasm", "js/face_mesh_solution_wasm_bin.wasm"],
  // From @mediapipe/hands
  ["@mediapipe/hands/hands_solution_packed_assets.data", "js/hands_solution_packed_assets.data"],
  ["@mediapipe/hands/hands_solution_simd_wasm_bin.wasm", "js/hands_solution_simd_wasm_bin.wasm"],
  ["@mediapipe/hands/hands_solution_wasm_bin.wasm", "js/hands_solution_wasm_bin.wasm"],
  // From @mediapipe/pose
  ["@mediapipe/pose/pose_solution_packed_assets.data", "js/pose_solution_packed_assets.data"],
  ["@mediapipe/pose/pose_solution_simd_wasm_bin.wasm", "js/pose_solution_simd_wasm_bin.wasm"],
  ["@mediapipe/pose/pose_solution_wasm_bin.wasm", "js/pose_solution_wasm_bin.wasm"],
];
for (const [src, dest] of mediapipeAssets) {
  copy(src, dest);
}

// ── three.js/ directory: Three.js core + addons ──────────────────────
console.log("\nCopying Three.js core...");
copy(
  "three/build/three.module.js",
  "three.js/three.module.js",
);
copy(
  "three/build/three.module.min.js",
  "three.js/three.module.min.js",
);

// Three.js example addons (loaders, effects, postprocessing, etc.)
console.log("\nCopying Three.js addons...");

const threeAddonFiles = [
  // Loaders
  ["three/examples/jsm/loaders/EXRLoader.js", "three.js/loaders/EXRLoader.js"],
  ["three/examples/jsm/loaders/FBXLoader.js", "three.js/loaders/FBXLoader.js"],
  ["three/examples/jsm/loaders/GLTFLoader.js", "three.js/loaders/GLTFLoader.js"],
  ["three/examples/jsm/loaders/MMDLoader.js", "three.js/loaders/MMDLoader.js"],
  ["three/examples/jsm/loaders/RGBELoader.js", "three.js/loaders/RGBELoader.js"],
  ["three/examples/jsm/loaders/TGALoader.js", "three.js/loaders/TGALoader.js"],

  // Animation
  ["three/examples/jsm/animation/CCDIKSolver.js", "three.js/animation/CCDIKSolver.js"],
  ["three/examples/jsm/animation/MMDAnimationHelper.js", "three.js/animation/MMDAnimationHelper.js"],
  ["three/examples/jsm/animation/MMDPhysics.js", "three.js/animation/MMDPhysics.js"],

  // Effects
  ["three/examples/jsm/effects/OutlineEffect.js", "three.js/effects/OutlineEffect.js"],

  // Postprocessing
  ["three/examples/jsm/postprocessing/EffectComposer.js", "three.js/postprocessing/EffectComposer.js"],
  ["three/examples/jsm/postprocessing/MaskPass.js", "three.js/postprocessing/MaskPass.js"],
  ["three/examples/jsm/postprocessing/OutputPass.js", "three.js/postprocessing/OutputPass.js"],
  ["three/examples/jsm/postprocessing/Pass.js", "three.js/postprocessing/Pass.js"],
  ["three/examples/jsm/postprocessing/RenderPass.js", "three.js/postprocessing/RenderPass.js"],
  ["three/examples/jsm/postprocessing/SMAAPass.js", "three.js/postprocessing/SMAAPass.js"],
  ["three/examples/jsm/postprocessing/ShaderPass.js", "three.js/postprocessing/ShaderPass.js"],
  ["three/examples/jsm/postprocessing/UnrealBloomPass.js", "three.js/postprocessing/UnrealBloomPass.js"],

  // Shaders
  ["three/examples/jsm/shaders/CopyShader.js", "three.js/shaders/CopyShader.js"],
  ["three/examples/jsm/shaders/LuminosityHighPassShader.js", "three.js/shaders/LuminosityHighPassShader.js"],
  ["three/examples/jsm/shaders/MMDToonShader.js", "three.js/shaders/MMDToonShader.js"],
  ["three/examples/jsm/shaders/OutputShader.js", "three.js/shaders/OutputShader.js"],
  ["three/examples/jsm/shaders/SMAAShader.js", "three.js/shaders/SMAAShader.js"],
  ["three/examples/jsm/shaders/BokehShader2.js", "three.js/shaders/BokehShader2.js"],

  // Curves
  ["three/examples/jsm/curves/NURBSCurve.js", "three.js/curves/NURBSCurve.js"],
  ["three/examples/jsm/curves/NURBSUtils.js", "three.js/curves/NURBSUtils.js"],

  // Math
  ["three/examples/jsm/math/Capsule.js", "three.js/math/Capsule.js"],
  ["three/examples/jsm/math/Octree.js", "three.js/math/Octree.js"],

  // Exporters
  ["three/examples/jsm/exporters/GLTFExporter.js", "three.js/exporters/GLTFExporter.js"],

  // Utils
  ["three/examples/jsm/utils/BufferGeometryUtils.js", "three.js/utils/BufferGeometryUtils.js"],
  ["three/examples/jsm/utils/TextureUtils.js", "three.js/utils/TextureUtils.js"],

  // Libs
  ["three/examples/jsm/libs/fflate.module.js", "three.js/libs/fflate.module.js"],
  ["three/examples/jsm/libs/lil-gui.module.min.js", "three.js/libs/lil-gui.module.min.js"],
];

for (const [src, dest] of threeAddonFiles) {
  copy(src, dest);
}

// mmdparser is bundled with three.js examples
copy(
  "three/examples/jsm/libs/mmdparser.module.js",
  "three.js/libs/mmdparser.module.js",
);

// Three-VRM and VRM Animation
console.log("\nCopying Three-VRM...");
copy(
  "@pixiv/three-vrm/lib/three-vrm.module.min.js",
  "three.js/three-vrm.module.min.js",
);
copy(
  "@pixiv/three-vrm-animation/lib/three-vrm-animation.module.js",
  "three.js/three-vrm-animation.module.js",
);

console.log("\nVendor setup complete.");
