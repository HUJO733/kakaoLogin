const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../models/user');

module.exports = () => {
  // 카카오 로그인 전략 설정
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID, // 카카오 앱의 클라이언트 ID
    callbackURL: '/auth/kakao/callback', // 카카오 인증 후 콜백 URL
  }, async (accessToken, refreshToken, profile, done) => {
    console.log('kakao profile', profile); // 카카오 프로필 로그 출력
    try {
      // 카카오 ID로 사용자 조회
      const exUser = await User.findOne({
        where: { snsId: profile.id, provider: 'kakao' },
      });
      if (exUser) {
        // 기존 사용자가 존재할 경우, 사용자 정보와 함께 완료 처리
        done(null, exUser);
      } else {
        // 새 사용자 생성
        const newUser = await User.create({
          email: profile._json && profile._json.kakao_account_email, // 카카오 계정 이메일
          nick: profile.displayName, // 카카오 닉네임
          snsId: profile.id, // 카카오 ID
          provider: 'kakao', // 제공자는 'kakao'
        });
        // 생성된 사용자 정보와 함께 완료 처리
        done(null, newUser);
      }
    } catch (error) {
      // 오류 발생 시 처리
      console.error(error);
      done(error);
    }
  }));
};
// https://developers.kakao.com 접속
// 내 애플리케이션 가서 애플리케이션 추가