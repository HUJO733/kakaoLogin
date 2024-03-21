const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
  // Passport 로컬 로그인 전략 설정
  passport.use(new LocalStrategy({
    usernameField: 'email', // 사용자 이름 필드를 'email'로 설정
    passwordField: 'password', // 비밀번호 필드를 'password'로 설정
  }, async (email, password, done) => {
    try {
      // 이메일을 통해 사용자 검색
      const exUser = await User.findOne({ where: { email } });
      if (exUser) {
        // 비밀번호 비교
        const result = await bcrypt.compare(password, exUser.password);
        if (result) {
          // 비밀번호가 일치하면 사용자 정보와 함께 완료 처리
          done(null, exUser);
        } else {
          // 비밀번호 불일치
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        // 사용자가 존재하지 않음
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      // 오류 발생 시 처리
      console.error(error);
      done(error);
    }
  }));
};
