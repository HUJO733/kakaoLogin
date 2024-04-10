const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

// 회원가입 라우트
router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    // 이메일로 기존 사용자 존재 여부 확인
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      // 사용자가 이미 존재할 경우, 회원가입 페이지로 리다이렉트
      return res.redirect('/join?error=exist');
    }
    // 비밀번호 해시 생성 후 사용자 데이터 저장
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    // 홈 페이지로 리다이렉트
    return res.redirect('/');
  } catch (error) {
    // 오류 처리
    console.error(error);
    return next(error);
  }
});

// 로그인 라우트
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      // 인증 과정 중 오류 발생 시 처리
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      // 사용자 정보가 없을 경우, 로그인 페이지로 리다이렉트
      return res.redirect(`/?loginError=${info.message}`);
    }
    // 세션에 사용자 정보 저장
    return req.login(user, (loginError) => {
      if (loginError) {
        // 로그인 과정 중 오류 발생 시 처리
        console.error(loginError);
        return next(loginError);
      }
      // 홈 페이지로 리다이렉트
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내부에서 다른 미들웨어 호출
});

// 로그아웃 라우트
router.get('/logout', isLoggedIn, (req, res) => {
  req.logout(); // 로그아웃 처리
  req.session.destroy(); // 세션 파괴
  res.redirect('/'); // 홈 페이지로 리다이렉트
});

// 카카오 로그인 라우트
router.get('/kakao', passport.authenticate('kakao'));

// 카카오 로그인 콜백 라우트
router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/'); // 로그인 성공 시 홈 페이지로 리다이렉트
});

module.exports = router;
