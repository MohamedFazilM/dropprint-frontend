import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import TShirtModel from "./TShirtModel";
import CanvasErrorBoundary from "./CanvasErrorBoundary";

export default function TShirtViewer({
    color,
    frontPreviewUrl,
    frontDecalProps,
    backPreviewUrl,
    backDecalProps,
    isOrbiting,
    rotationY,
    onDebugInfo,
    onLoadingError,
    printArea
}) {
    const { progress, active } = useProgress();

    return (
        <div className="absolute inset-0 bg-zinc-50/50 flex items-center justify-center z-0">
            <CanvasErrorBoundary onError={onLoadingError}>
                <Canvas
                    shadows
                    gl={{ preserveDrawingBuffer: true, antialias: true }}
                    camera={{ position: [0, 0, 0.72], fov: 40 }}
                    style={{ width: "400px", height: "500px" }}
                >
                    <ambientLight intensity={0.7} />
                    <directionalLight
                        position={[2, 4, 3]}
                        intensity={1.5}
                        castShadow
                        shadow-mapSize={[1024, 1024]}
                        shadow-bias={-0.0001}
                    />
                    <directionalLight position={[-2, 2, -3]} intensity={0.5} />
                    <pointLight position={[0, 3, 2]} intensity={0.8} />

                    <Suspense fallback={null}>
                        <group rotation={[0, rotationY, 0]}>
                            <TShirtModel
                                color={color}
                                frontPreviewUrl={frontPreviewUrl}
                                frontDecalProps={frontDecalProps}
                                backPreviewUrl={backPreviewUrl}
                                backDecalProps={backDecalProps}
                                onDebugInfo={onDebugInfo}
                                printArea={printArea}
                                isOrbiting={isOrbiting}
                            />
                        </group>
                    </Suspense>

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={isOrbiting}
                        enableDamping
                        dampingFactor={0.05}
                        makeDefault
                    />
                </Canvas>
            </CanvasErrorBoundary>
        </div>
    );
}
