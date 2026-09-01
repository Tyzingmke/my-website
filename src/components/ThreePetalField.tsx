"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Petal = {
  mesh: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshStandardMaterial>;
  speed: number;
  drift: number;
  spin: number;
};

function petalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.6);
  shape.bezierCurveTo(0.62, 0.48, 0.68, -0.32, 0, -0.76);
  shape.bezierCurveTo(-0.68, -0.32, -0.62, 0.48, 0, 0.6);
  return new THREE.ShapeGeometry(shape, 10);
}

export function ThreePetalField() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
    camera.position.z = 12;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x000000, 0);
    element.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffe7ed, 2.4));
    const light = new THREE.DirectionalLight(0xff9db5, 2.6);
    light.position.set(-5, 6, 6);
    scene.add(light);
    const geometry = petalGeometry();
    const colors = [0xf6c5d2, 0xffdbe4, 0xe889a2, 0xf3a8bd];
    const petals: Petal[] = Array.from({ length: 28 }, (_, index) => {
      const material = new THREE.MeshStandardMaterial({ color: colors[index % colors.length], roughness: 0.54, metalness: 0.03, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set((Math.random() - 0.5) * 17, Math.random() * 15 - 6, Math.random() * 4 - 2);
      const scale = 0.12 + Math.random() * 0.18;
      mesh.scale.set(scale, scale, scale);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      scene.add(mesh);
      return { mesh, speed: 0.003 + Math.random() * 0.007, drift: (Math.random() - 0.5) * 0.006, spin: (Math.random() - 0.5) * 0.018 };
    });

    let frame = 0;
    const render = () => {
      frame = requestAnimationFrame(render);
      petals.forEach((petal) => {
        petal.mesh.position.y -= petal.speed;
        petal.mesh.position.x += petal.drift + Math.sin(petal.mesh.position.y * 0.9) * 0.0015;
        petal.mesh.rotation.x += petal.spin;
        petal.mesh.rotation.y += petal.spin * 0.65;
        if (petal.mesh.position.y < -7.5) {
          petal.mesh.position.y = 8;
          petal.mesh.position.x = (Math.random() - 0.5) * 17;
        }
      });
      renderer.render(scene, camera);
    };
    const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener("resize", resize);
    render();
    return () => { cancelAnimationFrame(frame); removeEventListener("resize", resize); geometry.dispose(); petals.forEach((petal) => petal.mesh.material.dispose()); renderer.dispose(); element.replaceChildren(); };
  }, []);

  return <div className="three-petal-field" ref={host} aria-hidden="true" />;
}
