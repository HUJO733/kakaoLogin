const express = require('express');

const { isLoggedIn } = require('./middlewares'); // 로그인 여부 확인 미들웨어를 가져옵니다.
const User = require('../models/user'); // 사용자 모델을 가져옵니다.

const router = express.Router(); // Express 라우터를 생성합니다.

// 사용자를 팔로우하는 POST 요청 핸들러
router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    // 현재 로그인한 사용자를 데이터베이스에서 찾습니다.
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      // 찾은 사용자가 있다면, 주어진 ID의 사용자를 팔로우합니다.
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send('success'); // 성공 메시지를 응답으로 보냅니다.
    } else {
      res.status(404).send('no user'); // 사용자를 찾지 못한 경우 404 상태 코드와 메시지를 응답으로 보냅니다.
    }
  } catch (error) {
    console.error(error); // 에러가 발생한 경우 콘솔에 에러 메시지를 출력합니다.
    next(error); // 다음 미들웨어로 에러를 전달합니다.
  }
});

module.exports = router; // 라우터를 내보냅니다.
