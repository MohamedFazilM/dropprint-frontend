import React, { Component } from "react";

export default class CanvasErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("3D Canvas Error:", error, errorInfo);
        if (this.props.onError) {
            this.props.onError(error.message || String(error));
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/50 p-6 text-center z-10">
                    <span className="text-2xl mb-2">⚠️</span>
                    <h3 className="font-extrabold text-xs text-[#cc0000] uppercase tracking-wider mb-1">
                        3D Context Loss / Render Error
                    </h3>
                    <p className="text-[10px] text-zinc-500 max-w-[250px] leading-relaxed">
                        {this.state.error?.message || "Failed to compile shaders or initialize WebGL context."}
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}
