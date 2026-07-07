import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ fontFamily: "'Outfit', sans-serif" }} className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-center">
                    <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg border border-red-100 flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100 shadow-inner animate-pulse">
                            <span className="text-red-500 font-extrabold text-3xl">⚠️</span>
                        </div>
                        <h1 className="text-2xl font-black text-zinc-900 mb-2 leading-tight">Something Went Wrong</h1>
                        <p className="text-sm text-zinc-500 font-medium mb-4 leading-relaxed">
                            An unexpected render-phase crash was intercepted. Details are logged below:
                        </p>
                        <div className="bg-red-50/50 border border-red-100/50 rounded-lg p-4 w-full text-left mb-6 overflow-auto max-h-60">
                            <p className="text-xs font-bold text-red-700 mb-1.5 font-mono">{this.state.error && this.state.error.toString()}</p>
                            <pre className="text-[10px] text-red-500 font-mono leading-relaxed whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>
                        <button
                            onClick={() => {
                                window.location.href = "/";
                            }}
                            className="bg-zinc-950 hover:bg-zinc-800 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 rounded-lg transition-all shadow-md shadow-zinc-950/10 cursor-pointer"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
