import { Component, type ReactNode } from 'react';

export class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="scene-fallback">The 3D view is unavailable. All portfolio sections and documents are available below.</div> : this.props.children;
  }
}
