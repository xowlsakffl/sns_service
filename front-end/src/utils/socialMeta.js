import marie from 'assets/images/marie.jpg';
import team1 from 'assets/images/team-1.jpg';
import team2 from 'assets/images/team-2.jpg';
import team3 from 'assets/images/team-3.jpg';
import team4 from 'assets/images/team-4.jpg';
import team5 from 'assets/images/team-5.jpg';
import ivana from 'assets/images/ivana-square.jpg';
import bruce from 'assets/images/bruce-mars.jpg';
import home1 from 'assets/images/home-decor-1.jpg';
import home2 from 'assets/images/home-decor-2.jpg';
import home3 from 'assets/images/home-decor-3.jpg';
import home4 from 'assets/images/home-decor-4.jpeg';
import bgProfile from 'assets/images/bg-profile.jpeg';
import bgReset from 'assets/images/bg-reset-cover.jpeg';

const avatarPool = [marie, team1, team2, team3, team4, team5, ivana, bruce];
const mediaPool = [home1, home2, home3, home4, bgProfile, bgReset];

const profileMap = {
  admin: { displayName: 'admin', avatar: bruce, note: '운영과 신고를 관리합니다.' },
  demo: { displayName: 'demo', avatar: ivana, note: '일상 기록을 자주 올립니다.' },
  luna: { displayName: 'luna', avatar: marie, note: '사진과 취향을 공유합니다.' },
  minho: { displayName: 'minho', avatar: team1, note: '개발과 제품 이야기를 올립니다.' },
  jisu: { displayName: 'jisu', avatar: team2, note: '짧은 리뷰를 자주 남깁니다.' },
  haein: { displayName: 'haein', avatar: team3, note: '주말 기록을 정리합니다.' },
};

function pickFromPool(pool, seed) {
  const normalizedSeed = Number.isFinite(seed) ? seed : 0;
  return pool[Math.abs(normalizedSeed) % pool.length];
}

export function getUserProfile(username = 'guest') {
  const normalized = String(username || 'guest').toLowerCase();
  const fallbackSeed = normalized.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const base = profileMap[normalized] || {};

  return {
    username: normalized,
    displayName: base.displayName || normalized,
    avatar: base.avatar || pickFromPool(avatarPool, fallbackSeed),
    note: base.note || '최근 소식을 공유했습니다.',
  };
}

export function getPostMedia(postId = 0) {
  return pickFromPool(mediaPool, Number(postId) || 0);
}

export function getRelativeHint(postId = 0) {
  const hints = ['12m', '28m', '1h', '2h', '4h', '6h', '9h'];
  return pickFromPool(hints, Number(postId) || 0);
}

export function getEngagementHints(postId = 0) {
  const seed = Number(postId) || 1;

  return {
    likes: seed * 17 + 24,
    comments: (seed % 4) + 3,
  };
}

export function buildStoryItems(posts = []) {
  const used = new Set();

  return posts
    .map((post) => post?.user?.username || post?.user?.userName || post?.user?.name || '')
    .filter((username) => {
      if (!username || used.has(username)) {
        return false;
      }

      used.add(username);
      return true;
    })
    .slice(0, 6)
    .map((username, index) => ({
      ...getUserProfile(username),
      key: `${username}-${index}`,
      seen: index > 2,
    }));
}

export const sidebarSuggestions = ['luna', 'haein', 'minho', 'jisu'].map((username) =>
  getUserProfile(username),
);
