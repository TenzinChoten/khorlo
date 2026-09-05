import sys

def edit_features():
    with open('./components/Features.jsx', 'r') as f:
        content = f.read()
    
    target = """        <div className="editorial-card">
          <h3>profits & growth.</h3>
          <p>track performance, engagement rates, and ROI to make data-driven marketing decisions.</p>
        </div>"""
        
    replacement = """        <div className="editorial-card">
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
        
    if target in content:
        content = content.replace(target, replacement)
        with open('./components/Features.jsx', 'w') as f:
            f.write(content)
        print("Features.jsx edited")
    else:
        print("Target not found in Features.jsx")

def edit_css():
    with open('./App.css', 'a') as f:
        f.write("""
/* Doodle Animation */
.doodle-path {
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
  animation: drawPath 1.5s ease-out forwards;
}

.doodle-arrow {
  opacity: 0;
  animation: fadeIn 0.3s ease-out 1.2s forwards;
}

.doodle-star {
  opacity: 0;
  transform: scale(0);
  transform-origin: center;
}

.doodle-star-1 {
  transform-origin: 55px 45px;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.5s forwards;
}

.doodle-star-2 {
  transform-origin: 163px 113px;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 1.7s forwards;
}

@keyframes drawPath {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes popIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .doodle-container {
    grid-column: span 1 !important;
  }
}
""")
    print("App.css edited")

edit_features()
edit_css()
