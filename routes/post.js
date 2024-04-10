const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

// uploads 폴더가 존재하는지 확인하고 없으면 생성
try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');
}

// multer 설정: 파일 저장 위치와 파일명 설정, 파일 크기 제한
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/'); // 파일 저장 경로
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname); // 파일 확장자 추출
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext); // 파일명 설정
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 파일 크기 제한: 5MB
});

// 이미지 업로드 라우트
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` }); // 업로드된 파일의 URL 반환
});

const upload2 = multer();
// 게시글 업로드 라우트
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    console.log(req.user);
    // 새 게시글 생성
    const post = await Post.create({
      content: req.body.content, // 게시글 내용
      img: req.body.url, // 이미지 URL
      UserId: req.user.id, // 사용자 ID
    });
    // 해시태그 추출 및 처리
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() }, // 해시태그 생성 또는 조회
          })
        }),
      );
      await post.addHashtags(result.map(r => r[0])); // 게시글에 해시태그 연결
    }
    res.redirect('/'); // 홈으로 리다이렉트
  } catch (error) {
    // 오류 처리
    console.error(error);
    next(error);
  }
});

module.exports = router;
