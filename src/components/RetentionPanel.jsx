import React from "react";
import { ACHIEVEMENTS, DAILY_MISSIONS } from "../data/retention";
import { claimMissionReward, dayKey, levelFromXp } from "../services/playerProgress";

const text = {
  es: { missions: "Misiones de hoy", achievements: "Logros", claimed: "Reclamada", progress: "En progreso", completed: "Completado" },
  en: { missions: "Today's missions", achievements: "Achievements", claimed: "Claimed", progress: "In progress", completed: "Completed" },
};

const styles = {
  section: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22, marginBottom: 46 },
  heading: { margin: "0 0 14px", fontSize: 24, letterSpacing: "-.03em" },
  list: { display: "grid", gap: 10 },
  mission: { display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 12, padding: 14, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, background: "rgba(255,255,255,.05)" },
  icon: { width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 13, background: "rgba(255,255,255,.08)", fontSize: 21 },
  detail: { minWidth: 0, display: "flex", flexDirection: "column", gap: 4 },
  description: { color: "#aaa7b8", fontSize: 11 },
  track: { height: 6, overflow: "hidden", borderRadius: 999, background: "rgba(255,255,255,.09)" },
  fill: { display: "block", height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#22d3ee,#a855f7)" },
  button: { minWidth: 92, border: 0, borderRadius: 11, padding: "9px 10px", fontSize: 11, fontWeight: 900 },
  achievements: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 },
  achievement: { minHeight: 132, display: "flex", flexDirection: "column", gap: 5, padding: 15, border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, background: "rgba(255,255,255,.04)" },
};

export default function RetentionPanel({ lang, progress, onProgressChange }) {
  const copy = text[lang];
  const today = dayKey();
  const claimed = progress.daily?.date === today ? progress.daily.claimedMissions || [] : [];

  const claim = (mission) => {
    const result = claimMissionReward(progress, mission.id, mission.reward);
    onProgressChange(result.progress);
  };

  return <section style={styles.section} aria-label={copy.missions}>
    <div>
      <h2 style={styles.heading}>🎯 {copy.missions}</h2>
      <div style={styles.list}>
        {DAILY_MISSIONS.map((mission) => {
          const value = Math.min(mission.target, mission.metric(progress, today));
          const complete = value >= mission.target;
          const alreadyClaimed = claimed.includes(mission.id);
          return <article key={mission.id} style={{ ...styles.mission, borderColor: complete ? "rgba(52,211,153,.38)" : "rgba(255,255,255,.1)" }}>
            <div style={styles.icon}>{mission.icon}</div>
            <div style={styles.detail}>
              <strong>{mission[lang]}</strong>
              <span style={styles.description}>{lang === "es" ? mission.descEs : mission.descEn}</span>
              <div style={styles.track}><i style={{ ...styles.fill, width: `${(value / mission.target) * 100}%` }}/></div>
              <small>{value}/{mission.target}</small>
            </div>
            <button style={{ ...styles.button, cursor: complete && !alreadyClaimed ? "pointer" : "default" }} disabled={!complete || alreadyClaimed} onClick={() => claim(mission)}>
              {alreadyClaimed ? `✓ ${copy.claimed}` : complete ? `+${mission.reward} 🪙` : copy.progress}
            </button>
          </article>;
        })}
      </div>
    </div>

    <div>
      <h2 style={styles.heading}>🏆 {copy.achievements}</h2>
      <div style={styles.achievements}>
        {ACHIEVEMENTS.map((achievement) => {
          const value = achievement.progress(progress, { levelFromXp });
          const unlocked = value >= achievement.target;
          return <article key={achievement.id} style={{ ...styles.achievement, opacity: unlocked ? 1 : .55, borderColor: unlocked ? "rgba(250,204,21,.35)" : "rgba(255,255,255,.1)" }}>
            <div style={{ fontSize: 24, filter: unlocked ? "none" : "grayscale(1)" }}>{achievement.icon}</div>
            <strong>{achievement[lang]}</strong>
            <span style={styles.description}>{lang === "es" ? achievement.descEs : achievement.descEn}</span>
            <small style={{ marginTop: "auto", color: "#fde68a", fontWeight: 900 }}>{unlocked ? `✓ ${copy.completed}` : `${value}/${achievement.target}`}</small>
          </article>;
        })}
      </div>
    </div>
  </section>;
}
