import { useEffect } from 'react';

export function DiagnosticOverlay() {
  useEffect(() => {
    console.log('🎨 ULTIMATE ENHANCEMENTS DIAGNOSTIC');
    console.log('===================================');
    
    // Check if CSS classes exist
    const testDiv = document.createElement('div');
    testDiv.className = 'aurora-text holographic levitate breathe';
    document.body.appendChild(testDiv);
    
    const styles = window.getComputedStyle(testDiv);
    const hasAnimation = styles.animation !== 'none' && styles.animation !== '';
    
    console.log('✅ Test element created with classes: aurora-text, holographic, levitate, breathe');
    console.log('Animation value:', styles.animation);
    console.log('Has animation:', hasAnimation);
    
    document.body.removeChild(testDiv);
    
    // Check CSS file is loaded
    const styleSheets = Array.from(document.styleSheets);
    const hasCSSRules = styleSheets.some(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        return rules.some(rule => 
          rule.cssText && (
            rule.cssText.includes('aurora') || 
            rule.cssText.includes('holographic') ||
            rule.cssText.includes('levitate')
          )
        );
      } catch (e) {
        return false;
      }
    });
    
    console.log('CSS file contains enhancement rules:', hasCSSRules);
    
    if (!hasCSSRules) {
      console.error('⚠️ CSS ENHANCEMENTS NOT LOADED!');
      console.log('💡 Solution: Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)');
    } else {
      console.log('✅ ALL ENHANCEMENTS LOADED SUCCESSFULLY!');
      console.log('🌟 If you don\'t see effects, do a hard refresh: Ctrl+Shift+R');
    }
    
    console.log('===================================');
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '10px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      border: '2px solid #667eea',
      boxShadow: '0 0 20px rgba(102, 126, 234, 0.5)'
    }}>
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        🎨 Enhancement Status
      </div>
      <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
        Check browser console (F12) for diagnostic info.
        <br /><br />
        <strong>If effects don't show:</strong>
        <br />
        Press <code style={{ background: '#667eea', padding: '2px 6px', borderRadius: '3px' }}>Ctrl+Shift+R</code> to hard refresh
      </div>
      <button 
        onClick={() => window.location.reload()}
        style={{
          marginTop: '10px',
          background: '#667eea',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          color: 'white',
          cursor: 'pointer',
          width: '100%',
          fontWeight: 'bold'
        }}
      >
        🔄 Force Reload
      </button>
    </div>
  );
}
