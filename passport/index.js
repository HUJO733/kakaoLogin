const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
  // 사용자 정보를 세션에 저장하는 함수
  passport.serializeUser((user, done) => {
    done(null, user.id); // 사용자의 id만 세션에 저장
  });

  // 세션에 저장된 사용자 정보를 기반으로 사용자 정보를 불러오는 함수
  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id }, // 저장된 ID를 사용하여 사용자 조회
      include: [{
        model: User, // 'User' 모델을 참조
        attributes: ['id', 'nick'], // 'id'와 'nick' 속성만 포함
        as: 'Followers', // '팔로워'로 명시 (User 모델과의 관계에서)
      }, {
        model: User, // 'User' 모델을 참조
        attributes: ['id', 'nick'], // 'id'와 'nick' 속성만 포함
        as: 'Followings', // '팔로잉'으로 명시 (User 모델과의 관계에서)
      }],
    })
      .then(user => done(null, user)) // 조회된 사용자 정보 반환
      .catch(err => done(err)); // 오류 발생 시 처리
  });

  // 로컬 로그인 전략
  local();
  // 카카오 로그인 전략
  kakao();
};
// passport는 로그인 시의 동작을 전략이라는 용어로 설명합니다