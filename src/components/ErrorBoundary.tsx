import React from "react";
export default class ErrorBoundary extends React.Component<{children: React.ReactNode},{hasError:boolean; err?: any}> {
  constructor(p:any){ super(p); this.state={hasError:false}; }
  static getDerivedStateFromError(err:any){ return { hasError:true, err }; }
  componentDidCatch(err:any, info:any){ console.error("[ErrorBoundary]", err, info); }
  render(){
    if(this.state.hasError){
      return (
        <div className="min-h-screen grid place-items-center text-slate-300 p-6">
          <div>
            <div className="text-xl mb-2">Oups, une erreur est survenue.</div>
            <pre className="text-xs opacity-75">{String(this.state.err?.message ?? this.state.err)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
