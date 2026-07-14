import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
          background: '#231F20', color: '#F4ECDD', textAlign: 'center', padding: 24,
        }}>
          <p style={{ fontSize: 18 }}>حدث خطأ غير متوقع. برجاء إعادة تحميل الصفحة.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: '#F5C400', color: '#231F20', fontWeight: 700, cursor: 'pointer',
            }}
          >
            إعادة التحميل
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
