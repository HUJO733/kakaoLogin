const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User, Hashtag } = require('../models');

const router = express.Router();

// 모든 라우터에 공통으로 적용되는 미들웨어
router.use((req, res, next) => {
  res.locals.user = req.user; // 현재 로그인한 사용자 정보
  res.locals.followerCount = req.user ? req.user.Followers.length : 0; // 팔로워 수
  res.locals.followingCount = req.user ? req.user.Followings.length : 0; // 팔로잉 수
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : []; // 팔로잉하는 사용자의 ID 목록
  next();
});

// 프로필 페이지 라우트
router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird' }); // 프로필 페이지 렌더링
});

// 회원가입 페이지 라우트
router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', { title: '회원가입 - NodeBird' }); // 회원가입 페이지 렌더링
});

// 메인 페이지 라우트
router.get('/', async (req, res, next) => {
  try {
    // 모든 게시글 조회
    const posts = await Post.findAll({
      include: {
        model: User, // 게시글 작성자 정보 포함
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']], // 최신순으로 정렬
    });
    res.render('main', {
      title: 'NodeBird',
      twits: posts, // 게시글 목록
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// 해시태그 검색 라우트
router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag; // 쿼리에서 해시태그 추출
  if (!query) {
    return res.redirect('/'); // 해시태그가 없으면 메인 페이지로 리다이렉트
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } }); // 해당 해시태그 조회
    let posts = [];
    if (hashtag) {
      // 해당 해시태그를 포함하는 게시글 조회
      posts = await hashtag.getPosts({ include: [{ model: User }] }); // 게시글 작성자 정보 포함
    }

    return res.render('main', {
      title: `${query} | NodeBird`,
      twits: posts, // 게시글 목록
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
