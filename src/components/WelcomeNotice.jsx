import { useState } from 'react';

export default function WelcomeNotice() {
  const [visible, setVisible] = useState(true);

  function handleClose() {
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',}}>
      <div style={{background: '#2c1810',
        color: '#f5f0eb',
        borderRadius: '16px',
        maxWidth: '560px',
        width: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        border: '1px solid #8B4513',}}>
        {/* Scrollable body */}
        <div style={{overflowY: 'auto',
          padding: '28px 28px 8px',
          flex: 1,}}>
          {/* Header */}
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <h1 style={{fontSize: '1.7rem', fontWeight: 700, margin: 0}}>Welcome to Compass! &#x1F9ED;</h1>
            <p style={{margin: '6px 0 0', color: '#d4a96a', fontWeight: 600, fontSize: '1rem'}}>
              Your Digital Carpentry Classroom
            </p>
          </div>

          {/* Intro paragraphs */}
          <p style={{lineHeight: 1.7, marginBottom: '14px'}}>
            This app will make you an expert in carpentry. Whether you are a complete beginner or
            someone looking to sharpen your skills, Compass will guide you through everything you
            need to know, step by step, at your own pace.
          </p>
          <p style={{lineHeight: 1.7, marginBottom: '20px'}}>
            This app will teach you the fundamentals of carpentry, from understanding tools and
            materials to applying real-world techniques used by professional carpenters. Every module
            will teach you different lessons, building your knowledge and skills from the ground up
            until you are fully equipped to work with confidence.
          </p>

          {/* How it works */}
          <h2 style={{fontSize: '1.1rem', color: '#d4a96a', marginBottom: '10px'}}>Here is how it works:</h2>
          <ul style={{paddingLeft: '0', listStyle: 'none', margin: '0 0 20px'}}>
            {[
              ['📋 Modules', 'The app is divided into learning modules. Each module covers a different carpentry topic and teaches you new skills. You must complete them in order, finish one to unlock the next.'],
              ['✅ Pre-Test', 'Before each lesson, you will take a short quiz to check what you already know. Do not worry if you do not get everything right, it is just to measure your starting point.'],
              ['📖 Lessons', 'After the pre-test, go through the lessons carefully. Read everything and make sure you understand each topic before moving on.'],
              ['🎯 Post-Test', 'After the lessons, you will take a final quiz. You need to score at least 80% to pass the module and unlock the next one.'],
              ['🎓 Certificate', 'Complete all modules and earn your certificate of completion!'],
            ].map(([title, desc]) => (
              <li key={title} style={{marginBottom: '12px', paddingLeft: '4px'}}>
                <span style={{fontWeight: 700, color: '#d4a96a'}}>{title}</span>
                {' '}&mdash;{' '}{desc}
              </li>
            ))}
          </ul>

          {/* Tips */}
          <h2 style={{fontSize: '1.1rem', color: '#d4a96a', marginBottom: '10px'}}>Tips for success:</h2>
          <ul style={{paddingLeft: '20px', margin: '0 0 20px', lineHeight: 1.8}}>
            <li>Read every lesson carefully before taking the post-test</li>
            <li>If you do not pass, review the lessons and try again</li>
            <li>Complete all modules to finish the course and become a certified carpenter!</li>
          </ul>
        </div>

        {/* Sticky button */}
        <div style={{padding: '16px 28px 24px', flexShrink: 0}}>
          <button
            onClick={handleClose}
            style={{width: '100%',
              padding: '14px',
              background: '#8B4513',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.3px',}}
          >
            Got it, Let us Start! &#x1FA9A;
          </button>
        </div>
      </div>
    </div>
  );
}
