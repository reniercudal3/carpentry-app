import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modules } from '../data/modules';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { saveProgress } from '../utils/progress';
import ResultScreen from '../components/ResultScreen';
import PagedQuizPanel from '../components/PagedQuizPanel';

// Stages: intro → pretest → objectives → lessons → posttest → done

export default function Module() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { dark } = useTheme();
  const mod = modules.find((m) => m.id === parseInt(id));
  const [stage, setStage] = useState('intro'); // intro | pretest | objectives | lessons | posttest | done
  const [activeLesson, setActiveLesson] = useState(0);
  const [postScore, setPostScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [preScore, setPreScore] = useState(0);
  const [showPreResult, setShowPreResult] = useState(false);

  const bg = dark ? '#1a1a1a' : '#f5f0eb';
  const cardBg = dark ? '#2a2a2a' : '#fff';
  const text = dark ? '#f0f0f0' : '#2c1810';
  const sub = dark ? '#ccc' : '#555';

  if (!mod) return <div style={{ padding: 40 }}>Module not found.</div>;

  const currentModIndex = modules.findIndex(m => m.id === mod.id);
  const nextMod = currentModIndex < modules.length - 1 ? modules[currentModIndex + 1] : null;

  return (
    <div style={{ ...styles.container, background: bg }}>
      <div style={{ ...styles.header, background: mod.color }}>
        <button style={styles.back} onClick={() => navigate('/dashboard')} aria-label="Back">← Dashboard</button>
        <div style={styles.headerTitle}>{mod.icon} {mod.title}</div>
      </div>

      {/* Stage indicator */}
      <div style={styles.stageBar}>
        {['Intro', 'Pre-Test', 'Objectives', 'Lessons', 'Post-Test'].map((s, i) => {
          const stageKeys = ['intro', 'pretest', 'objectives', 'lessons', 'posttest'];
          const current = stageKeys.indexOf(stage);
          return (
            <div key={s} style={{ ...styles.stageStep, background: i <= current ? mod.color : (dark ? '#444' : '#ddd') }}>
              <span style={{ color: i <= current ? '#fff' : (dark ? '#888' : '#999'), fontSize: '12px', fontWeight: '600' }}>{s}</span>
            </div>
          );
        })}
      </div>

      <div style={styles.body}>
        {stage === 'intro' && <Intro mod={mod} dark={dark} cardBg={cardBg} text={text} sub={sub} onNext={() => setStage('pretest')} />}
        {stage === 'pretest' && (
          <PagedQuizPanel
            title="📋 Pre-Test"
            subtitle="Answer these questions before starting the lessons. 5 questions per page — Don't worry, this is just to check your prior knowledge."
            questions={mod.preTest}
            mod={mod} dark={dark} cardBg={cardBg} text={text} sub={sub}
            onSubmit={(answers) => {
              const score = mod.preTest.filter((q) => answers[q.id] === q.correct).length;
              setPreScore(score);
              setShowPreResult(true);
            }}
            onNext={() => { setShowPreResult(false); setStage('objectives'); }}
            onRetry={() => { setShowPreResult(false); }}
            showResult={showPreResult}
            isPreTest={true}
            postScore={preScore}
            postTotal={mod.preTest.length}
          />
        )}
        {stage === 'objectives' && (
          <ObjectivesPanel mod={mod} dark={dark} cardBg={cardBg} text={text} sub={sub} onNext={() => setStage('lessons')} />
        )}
        {stage === 'lessons' && (
          <LessonsPanel
            mod={mod} dark={dark} cardBg={cardBg} text={text} sub={sub}
            activeLesson={activeLesson} setActiveLesson={setActiveLesson}
            onNext={() => setStage('posttest')}
          />
        )}
        {stage === 'posttest' && (
          <PagedQuizPanel
            title="✅ Post-Test"
            subtitle="You've completed the lessons. Now test what you've learned! 5 questions per page."
            questions={mod.postTest}
            mod={mod} dark={dark} cardBg={cardBg} text={text} sub={sub}
            onSubmit={async (answers) => {
              const score = mod.postTest.filter((q) => answers[q.id] === q.correct).length;
              setPostScore(score);
              setShowResult(true);
              try {
                await saveProgress(currentUser?.uid, mod.id, score, mod.postTest.length);
              } catch (e) {
                console.error('Save progress failed:', e);
              }
            }}
            onNext={() => navigate('/dashboard')}
            onRetry={() => {
              setShowResult(false);
              setStage('lessons');
              setActiveLesson(0);
            }}
            showResult={showResult}
            isPreTest={false}
            postScore={postScore}
            postTotal={mod.postTest.length}
            nextMod={nextMod}
          />
        )}
      </div>
    </div>
  );
}

function Intro({ mod, dark, cardBg, text, sub, onNext }) {
  return (
    <div style={{ ...styles.card, background: cardBg }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{mod.icon}</div>
      <h2 style={{ ...styles.lessonTitle, color: text }}>{mod.title}</h2>
      <div style={{ ...styles.introBadge, background: mod.color }}>Lesson Introduction</div>
      <div style={styles.introText}>
        {mod.intro.split('\n\n').map((p, i) => (
          <p key={i} style={{ color: sub, fontSize: '15px', lineHeight: 1.8, marginBottom: '14px' }}>{p}</p>
        ))}
      </div>
      <button style={{ ...styles.btn, background: mod.color }} onClick={onNext}>
        Take Pre-Test →
      </button>
    </div>
  );
}

function ObjectivesPanel({ mod, dark, cardBg, text, sub, onNext }) {
  return (
    <div style={{ ...styles.card, background: cardBg }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
      <h2 style={{ ...styles.lessonTitle, color: text }}>Learning Objectives</h2>
      <div style={{ ...styles.introBadge, background: mod.color }}>What You Will Learn</div>
      <p style={{ color: sub, fontSize: '14px', margin: '16px 0', lineHeight: 1.6 }}>
        By the end of this module, you will be able to:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        {mod.objectives.map((obj, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: '12px',
            padding: '14px', borderRadius: '12px',
            background: dark ? '#333' : '#fdf6f0',
            border: `1.5px solid ${mod.color}22`,
          }}>
            <div style={{
              minWidth: '28px', height: '28px', borderRadius: '50%',
              background: mod.color, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '700', flexShrink: 0,
            }}>{i + 1}</div>
            <p style={{ color: text, fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{obj}</p>
          </div>
        ))}
      </div>
      <button style={{ ...styles.btn, background: mod.color }} onClick={onNext}>
        Start Lessons →
      </button>
    </div>
  );
}

function LessonsPanel({ mod, dark, cardBg, text, sub, activeLesson, setActiveLesson, onNext }) {
  const [activeVideo, setActiveVideo] = useState(0);
  const lesson = mod.lessons[activeLesson];
  const videos = lesson.videos
    ? lesson.videos
    : lesson.videoUrl
      ? [{ url: lesson.videoUrl, title: lesson.videoTitle }]
      : [];

  // Reset video selection when lesson changes
  const handleLessonChange = (i) => {
    setActiveLesson(i);
    setActiveVideo(0);
  };

  return (
    <div>
      <div style={styles.tabs}>
        {mod.lessons.map((l, i) => (
          <button key={l.id}
            style={i === activeLesson
              ? { ...styles.tab, background: mod.color, color: '#fff', borderColor: mod.color }
              : { ...styles.tab, background: cardBg, color: text }}
            onClick={() => handleLessonChange(i)}>
            {i + 1}. {l.title}
          </button>
        ))}
      </div>
      <div style={{ ...styles.card, background: cardBg }}>
        <h2 style={{ ...styles.lessonTitle, color: text }}>{lesson.title}</h2>

        {/* Video selector tabs */}
        {videos.length > 1 && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            {videos.map((v, i) => (
              <button key={i}
                onClick={() => setActiveVideo(i)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: `1.5px solid ${i === activeVideo ? mod.color : (dark ? '#555' : '#ddd')}`,
                  background: i === activeVideo ? mod.color : (dark ? '#333' : '#f5f5f5'),
                  color: i === activeVideo ? '#fff' : text,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}>
                Video {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Video player - only shown if videos exist */}
        {videos.length > 0 && (
          <div style={styles.videoWrap}>
            <iframe style={styles.video}
              src={videos[activeVideo].url}
              title={videos[activeVideo].title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
          </div>
        )}
        <div>
          {lesson.content.split('\n\n').map((para, i) => (
            <p key={i} style={{ color: sub, fontSize: '15px', lineHeight: 1.7, marginBottom: '14px' }}
              dangerouslySetInnerHTML={{
                __html: para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
              }} />
          ))}
        </div>
        <div style={styles.navRow}>
          {activeLesson > 0 && (
            <button style={{ ...styles.navBtn, background: dark ? '#444' : '#e0d8d0', color: text }}
              onClick={() => handleLessonChange(activeLesson - 1)}>← Previous</button>
          )}
          {activeLesson < mod.lessons.length - 1 ? (
            <button style={{ ...styles.navBtn, marginLeft: 'auto', background: mod.color, color: '#fff' }}
              onClick={() => handleLessonChange(activeLesson + 1)}>Next Lesson →</button>
          ) : (
            <button style={{ ...styles.navBtn, marginLeft: 'auto', background: '#22c55e', color: '#fff' }}
              onClick={onNext}>Take Post-Test →</button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  header: { color: '#fff', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px', position: 'sticky', top: 0, zIndex: 10 },
  back: { background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: '#fff', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  headerTitle: { fontSize: '17px', fontWeight: '700' },
  stageBar: { display: 'flex', gap: '4px', padding: '12px 16px', overflowX: 'auto' },
  stageStep: { flex: 1, padding: '8px 4px', borderRadius: '8px', textAlign: 'center', minWidth: '70px' },
  body: { padding: '12px 16px 40px', maxWidth: '800px', margin: '0 auto' },
  card: { borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '16px' },
  lessonTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '12px' },
  introBadge: { display: 'inline-block', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', marginBottom: '16px' },
  introText: { marginBottom: '24px' },
  btn: { padding: '13px 24px', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'block', width: '100%' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' },
  tab: { padding: '9px 14px', borderRadius: '8px', border: '1.5px solid #ddd', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  videoWrap: { position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: '22px', borderRadius: '12px', overflow: 'hidden' },
  video: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
  navRow: { display: 'flex', marginTop: '22px', gap: '10px' },
  navBtn: { padding: '12px 18px', borderRadius: '10px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  qBlock: { marginBottom: '22px' },
  optBtn: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid', marginBottom: '8px', cursor: 'pointer', fontSize: '14px' },
  optLetter: { width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
  resultBox: { padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '22px' },
  resultScore: { fontSize: '44px', fontWeight: '700', color: '#2c1810' },
};
