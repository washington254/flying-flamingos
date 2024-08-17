import {
  Center,
  Environment,
  Sky,
  Float,
  MeshTransmissionMaterial,
  OrbitControls,
  SoftShadows,
  Text3D,
} from "@react-three/drei";

import {
  Bloom,
  DepthOfField,
  EffectComposer,
  GodRays,
} from "@react-three/postprocessing";
import { useAtom } from "jotai";
import { folder, useControls } from "leva";
import { useEffect, useState , Suspense, useRef, useMemo  } from "react";
import { DoubleSide } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { Boids } from "./Boids";
import { themeAtom, THEMES } from "./UI";
import { Water } from 'three-stdlib'
import { Canvas, extend, useThree, useLoader, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
extend({ Water })
import VolumetricClouds from "../VolumetricClouds/VolumetricClouds";



function Ocean() {
  const ref = useRef()
  const gl = useThree((state) => state.gl)
  const waterNormals = useLoader(THREE.TextureLoader, '/waternormals.jpeg')
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping
  const geom = useMemo(() => new THREE.PlaneGeometry(10000, 10000), [])
  
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 7.7,
      fog: false,
      format: gl.encoding
    }),
    [waterNormals]
  )
  useFrame((state, delta) => (ref.current.material.uniforms.time.value += delta))
  return <water ref={ref} args={[geom, config]} position-y={-4} rotation-x={-Math.PI / 2} />
}
   

export const Experience = () => {
  const [theme] = useAtom(themeAtom);
 

  const cloudsProps = useControls({
    VolumetricClouds: folder(
      {
        threshold: {
          value: 0.55,
          min: 0.01,
          max: 1.0,
        },
        opacity: {
          value: 0.45,
          min: 0.01,
          max: 1.0,
        },
        range: {
          value: 0.11,
          min: 0.01,
          max: 1.0,
        },
        steps: {
          value: 64,
          min: 16,
          max: 256,
          step: 10,
        },
        position: {
          value: [0, 60, 0],
          step: 1,
        },
        color: {
          value: "#d6d8e1",
        },
        scale: { value: [120, 60, 120] },
        depthTest: {
          value: false,
        },
      },
      { collapsed: true },
    ),
  });
  const boundaries = useControls(
    "Boundaries",
    {
      debug: false,
      x: { value: 26, min: 0, max: 40 },
      y: { value: 8, min: 0, max: 40 },
      z: { value: 20, min: 0, max: 40 },
    },
    { collapsed: true }
  );

  const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
  const scaleX = Math.max(0.5, size[0] / 1920);
  const scaleY = Math.max(0.5, size[1] / 1080);
  const responsiveBoundaries = {
    x: boundaries.x * scaleX,
    y: boundaries.y * scaleY,
    z: boundaries.z,
  };

  useEffect(() => {
    let timeout;
    function updateSize() {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setSize([window.innerWidth, window.innerHeight]);
      }, 50);
    }
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  const [sunRef, setSunRef] = useState();

  const { focusRange, focusDistance, focalLength, bokehScale } = useControls(
    "Depth of field",
    {
      focusRange: { value: 3.5, min: 0, max: 20, step: 0.01 },
      focusDistance: { value: 0.25, min: 0, max: 1, step: 0.01 },
      focalLength: { value: 0.22, min: 0, max: 1, step: 0.01 },
      bokehScale: { value: 5.5, min: 0, max: 10, step: 0.1 },
    },
    {
      collapsed: true,
    }
  );

  return (
    <>
      <OrbitControls />

      <Boids boundaries={responsiveBoundaries} />
      <Ocean />
      <VolumetricClouds {...cloudsProps} />
      

      <mesh visible={boundaries.debug}>
        <boxGeometry
          args={[
            responsiveBoundaries.x,
            responsiveBoundaries.y,
            responsiveBoundaries.z,
          ]}
        />
        <meshStandardMaterial
          color="orange"
          transparent
          opacity={0.5}
          side={DoubleSide}
        />
      </mesh>
     

      {/* LIGHTS */}
      <SoftShadows size={15} focus={1.5} samples={12} />
      <Sky scale={1000} sunPosition={[500, 150, -1000]} turbidity={0.1} />
      <directionalLight
        position={[15, 15, 15]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
        shadow-camera-far={300}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.1}
      />
      <hemisphereLight
        intensity={1.35}
        color={THEMES[theme].skyColor}
        groundColor={THEMES[theme].groundColor}
      />

{/* {THEMES[theme].dof && (
          <DepthOfField
            target={[0, 0, 0]} // where to focus
            worldFocusRange={focusRange} // how far away to start blurring
            worldFocusDistance={focusDistance} // where to focus
            focalLength={focalLength} // focal length
            bokehScale={bokehScale} // bokeh size
          />
        )}
     */}
             {/* {sunRef && <GodRays sun={sunRef} exposure={0.34} decay={0.89} blur />} */}


      {/* Post Processing */}
      <EffectComposer>
        
        <Bloom luminanceThreshold={1.5} intensity={0.4} mipmapBlur />
      </EffectComposer>
    </>
  );
};
