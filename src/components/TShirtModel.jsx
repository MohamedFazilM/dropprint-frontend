import React, { useMemo, useEffect, useState, useRef } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import { useThree, createPortal } from "@react-three/fiber";
import * as THREE from "three";

export default function TShirtModel({
    color,
    frontPreviewUrl,
    frontDecalProps,
    backPreviewUrl,
    backDecalProps,
    onDebugInfo,
    printArea = "Front"
}) {
    const { scene } = useGLTF("/models/oversized_t-shirt.glb");
    const { invalidate } = useThree();
    const [mainMesh, setMainMesh] = useState(null);
    const meshRef = useRef(null);
    const rootRef = useRef(null);

    // Bounding-box scale normalization & auto centering (Calculated in local space)
    const transform = useMemo(() => {
        if (!scene) return { position: [0, 0, 0], scale: [1, 1, 1] };

        // Temporarily reset scene transforms to measure pure local coordinates
        const oldPos = scene.position.clone();
        const oldScale = scene.scale.clone();
        const oldRot = scene.rotation.clone();

        scene.position.set(0, 0, 0);
        scene.scale.set(1, 1, 1);
        scene.rotation.set(0, 0, 0);
        scene.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(scene);

        // Restore original scene transforms
        scene.position.copy(oldPos);
        scene.scale.copy(oldScale);
        scene.rotation.copy(oldRot);
        scene.updateMatrixWorld(true);

        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = new THREE.Vector3();
        box.getSize(size);

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetDim = 0.45; // Ideal normalized height in 3D units

        if (maxDim > 0) {
            const calculatedScale = targetDim / maxDim;
            return {
                position: [
                    -center.x * calculatedScale,
                    -center.y * calculatedScale - 0.02,
                    -center.z * calculatedScale
                ],
                scale: [calculatedScale, calculatedScale, calculatedScale]
            };
        }
        return { position: [0, 0, 0], scale: [1, 1, 1] };
    }, [scene]);

    // Send debugging and list of meshes back to layout diagnostics
    useEffect(() => {
        if (scene && onDebugInfo) {
            const box = new THREE.Box3().setFromObject(scene);
            const center = new THREE.Vector3();
            box.getCenter(center);
            const size = new THREE.Vector3();
            box.getSize(size);

            const meshesList = [];
            scene.traverse((child) => {
                if (child.isMesh) {
                    meshesList.push(`${child.name} [Original Material]`);
                }
            });

            onDebugInfo({
                status: "Model Loaded Successfully!",
                boxSize: `Width: ${size.x.toFixed(3)}, Height: ${size.y.toFixed(3)}, Depth: ${size.z.toFixed(3)}`,
                boxCenter: `X: ${center.x.toFixed(3)}, Y: ${center.y.toFixed(3)}, Z: ${center.z.toFixed(3)}`,
                meshes: meshesList
            });
        }
    }, [scene, onDebugInfo]);

    // Apply swatch color tint and matte cotton qualities safely
    useEffect(() => {
        if (scene) {
            let hexColor = color.toLowerCase();
            if (hexColor === "navy") hexColor = "#0f1a2c";
            if (hexColor === "gray") hexColor = "#808b96";
            if (hexColor === "white") hexColor = "#ffffff";
            if (hexColor === "black") hexColor = "#121212";
            if (hexColor === "red") hexColor = "#c0392b";

            console.log(`[TShirtModel] Applying color tint: "${color}" (Hex: ${hexColor})`);

            scene.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // Handle standard materials and multi-material arrays
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    materials.forEach((mat) => {
                        if (mat) {
                            if (mat.color) {
                                mat.color.set(hexColor);
                            }
                            mat.roughness = 0.7;
                            mat.metalness = 0.1;
                        }
                    });
                }
            });

            // Force React Three Fiber to redraw the canvas frame immediately
            invalidate();
        }
    }, [scene, color, invalidate]);

    // Find target body mesh for decal mapping (Mathematical largest-mesh selection)
    useEffect(() => {
        if (scene) {
            let target = null;
            let maxVolume = 0;

            scene.traverse((child) => {
                if (child.isMesh) {
                    child.updateMatrixWorld(true);
                    const meshBox = new THREE.Box3().setFromObject(child);
                    const meshSize = new THREE.Vector3();
                    meshBox.getSize(meshSize);
                    const meshCenter = new THREE.Vector3();
                    meshBox.getCenter(meshCenter);
                    const volume = meshSize.x * meshSize.y * meshSize.z;

                    // We select the largest mesh as the primary candidate for decal projection
                    if (volume > maxVolume) {
                        maxVolume = volume;
                        target = child;
                    }
                }
            });

            if (target) {
                // Bypass Drei Decal strict type === 'Mesh' bug for SkinnedMeshes
                target.type = 'Mesh';
                console.log(`[TShirtModel] Selected target mesh: "${target.name}"`);
            }

            setMainMesh(target);
            meshRef.current = target;
        }
    }, [scene]);

    // Cleanup to prevent React 19 / React-Three-Fiber portal unmount crash
    useEffect(() => {
        return () => {
            setMainMesh(null);
            setFrontDecalTexture(null);
            setBackDecalTexture(null);
        };
    }, []);

    const [frontDecalTexture, setFrontDecalTexture] = useState(null);
    const [backDecalTexture, setBackDecalTexture] = useState(null);
    const [frontDecalState, setFrontDecalState] = useState(null);
    const [backDecalState, setBackDecalState] = useState(null);

    // Load design decal texture asynchronously to trigger state updates and frame renders
    useEffect(() => {
        if (!frontPreviewUrl) {
            setFrontDecalTexture(null);
            return;
        }

        const loader = new THREE.TextureLoader();
        if (!frontPreviewUrl.startsWith("blob:")) {
            loader.setCrossOrigin("anonymous");
        }

        loader.load(
            frontPreviewUrl,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                setFrontDecalTexture(texture);
            },
            undefined,
            (err) => {
                console.error("Failed to load front decal texture:", err);
            }
        );
    }, [frontPreviewUrl]);

    useEffect(() => {
        if (!backPreviewUrl) {
            setBackDecalTexture(null);
            return;
        }

        const loader = new THREE.TextureLoader();
        if (!backPreviewUrl.startsWith("blob:")) {
            loader.setCrossOrigin("anonymous");
        }

        loader.load(
            backPreviewUrl,
            (texture) => {
                texture.colorSpace = THREE.SRGBColorSpace;
                setBackDecalTexture(texture);
            },
            undefined,
            (err) => {
                console.error("Failed to load back decal texture:", err);
            }
        );
    }, [backPreviewUrl]);

    useEffect(() => {
        if (!mainMesh || !rootRef.current) return;

        const parent = rootRef.current.parent;
        if (!parent) return;

        const calculateDecal = (decalProps, side) => {
            if (!decalProps) return null;

            // Temporarily set parent's rotation.y to 0
            const oldRotationY = parent.rotation.y;
            parent.rotation.y = 0;
            parent.updateMatrixWorld(true);

            // Calculate position: project slightly in front/behind the model center
            const parentPos = new THREE.Vector3(
                decalProps.position[0],
                decalProps.position[1],
                side === "Back" ? -0.15 : 0.15
            );

            // Transform parentPos to world space, then to mainMesh local space
            const worldPos = parentPos.clone().applyMatrix4(rootRef.current.matrixWorld);
            const localPos = mainMesh.worldToLocal(worldPos.clone());

            // Scale:
            const localScale = new THREE.Vector3(
                decalProps.scale[0],
                decalProps.scale[1],
                0.4
            );
            const worldScale = new THREE.Vector3();
            rootRef.current.getWorldScale(worldScale);
            const worldDecalScale = localScale.clone().multiply(worldScale);
            
            const meshWorldScale = new THREE.Vector3();
            mainMesh.getWorldScale(meshWorldScale);
            const localDecalScale = new THREE.Vector3(
                worldDecalScale.x / meshWorldScale.x,
                worldDecalScale.y / meshWorldScale.y,
                worldDecalScale.z / meshWorldScale.z
            );

            // Rotation:
            const localRotationEuler = [0, side === "Back" ? Math.PI : 0, decalProps.rotation[2] || 0];
            const targetQuaternion = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(localRotationEuler[0], localRotationEuler[1], localRotationEuler[2])
            );
            const worldQuaternion = new THREE.Quaternion();
            rootRef.current.getWorldQuaternion(worldQuaternion);
            worldQuaternion.multiply(targetQuaternion);

            const meshWorldQuaternion = new THREE.Quaternion();
            mainMesh.getWorldQuaternion(meshWorldQuaternion);
            const localQuaternion = meshWorldQuaternion.clone().invert().multiply(worldQuaternion);
            const localRot = new THREE.Euler().setFromQuaternion(localQuaternion);

            // Restore parent rotation
            parent.rotation.y = oldRotationY;
            parent.updateMatrixWorld(true);

            return {
                position: [localPos.x, localPos.y, localPos.z],
                rotation: [localRot.x, localRot.y, localRot.z],
                scale: [localDecalScale.x, localDecalScale.y, localDecalScale.z],
            };
        };

        if (frontPreviewUrl && frontDecalProps) {
            setFrontDecalState(calculateDecal(frontDecalProps, "Front"));
        } else {
            setFrontDecalState(null);
        }

        if (backPreviewUrl && backDecalProps) {
            setBackDecalState(calculateDecal(backDecalProps, "Back"));
        } else {
            setBackDecalState(null);
        }
    }, [mainMesh, frontDecalProps, backDecalProps, frontPreviewUrl, backPreviewUrl]);

    return (
        <group ref={rootRef}>
            {/* T-shirt 3D model */}
            <group position={transform.position} scale={transform.scale} dispose={null}>
                <primitive object={scene} dispose={null} />
            </group>

            {/* Decals projected onto the main body mesh via portal */}
            {mainMesh && frontDecalTexture && frontDecalState && createPortal(
                <Decal
                    position={frontDecalState.position}
                    rotation={frontDecalState.rotation}
                    scale={frontDecalState.scale}
                >
                    <meshStandardMaterial
                        map={frontDecalTexture}
                        transparent
                        alphaTest={0.01}
                        roughness={0.7}
                        metalness={0.1}
                        depthWrite={true}
                        polygonOffset
                        polygonOffsetFactor={-10}
                    />
                </Decal>,
                mainMesh
            )}

            {mainMesh && backDecalTexture && backDecalState && createPortal(
                <Decal
                    position={backDecalState.position}
                    rotation={backDecalState.rotation}
                    scale={backDecalState.scale}
                >
                    <meshStandardMaterial
                        map={backDecalTexture}
                        transparent
                        alphaTest={0.01}
                        roughness={0.7}
                        metalness={0.1}
                        depthWrite={true}
                        polygonOffset
                        polygonOffsetFactor={-10}
                    />
                </Decal>,
                mainMesh
            )}
        </group>
    );
}
