const STORAGE_KEY = 'tetrisv3_highscores';
const MAX_SCORES = 10;

export default class HighScoreManager {
  getScores() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addScore(entry) {
    const scores = this.getScores();
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    const trimmed = scores.slice(0, MAX_SCORES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // localStorage unavailable
    }
    return trimmed;
  }

  isHighScore(score) {
    const scores = this.getScores();
    if (scores.length < MAX_SCORES) return true;
    return score > scores[scores.length - 1].score;
  }
}
