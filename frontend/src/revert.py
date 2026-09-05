import sys

def revert_features():
    with open('./components/Features.jsx', 'r') as f:
        content = f.read()
    
    target = """        <div className="editorial-card">
          <h3>profits & growth.</h3>
          <p>track performance, engagement rates, and ROI to make data-driven marketing decisions.</p>
        </div>
        
        <div className="doodle-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gridColumn: 'span 2', minHeight: '200px' }}>
          <svg width="250" height="150" viewBox="0 0 250 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
            <path className="doodle-path" d="M20 120 Q 80 150, 120 80 T 220 40" stroke="var(--text-primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path className="doodle-arrow" d="M190 30 L225 38 L205 70" stroke="var(--text-primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path className="doodle-star doodle-star-1" d="M50 40 L55 25 L60 40 L75 45 L60 50 L55 65 L50 50 L35 45 Z" fill="var(--text-primary)" />
            <path className="doodle-star doodle-star-2" d="M160 110 L163 100 L166 110 L176 113 L166 116 L163 126 L160 116 L150 113 Z" fill="var(--text-primary)" />
          </svg>
        </div>"""
        
    replacement = """        <div className="editorial-card">
          <h3>profits & growth.</h3>
          <p>track performance, engagement rates, and ROI to make data-driven marketing decisions.</p>
        </div>"""
        
    if target in content:
        content = content.replace(target, replacement)
        with open('./components/Features.jsx', 'w') as f:
            f.write(content)
        print("Features.jsx reverted")
    else:
        print("Target not found in Features.jsx")

def revert_css():
    with open('./App.css', 'r') as f:
        content = f.read()
        
    if '/* Doodle Animation */' in content:
        content = content.split('/* Doodle Animation */')[0]
        with open('./App.css', 'w') as f:
            f.write(content)
        print("App.css reverted")
    else:
        print("Doodle animation CSS not found")

revert_features()
revert_css()
