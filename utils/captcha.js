const axios = require('axios');
const { captchaApiKey } = require('../config');

async function solveCaptcha(sitekey, pageurl) {
  const submit = await axios.get(`http://2captcha.com/in.php?key=${captchaApiKey}&method=userrecaptcha&googlekey=${sitekey}&pageurl=${pageurl}&json=1`);
  const id = submit.data.request;
  for (let i = 0; i < 30; i++) {
    const res = await axios.get(`http://2captcha.com/res.php?key=${captchaApiKey}&action=get&id=${id}&json=1`);
    if (res.data.status === 1) return res.data.request;
    await new Promise(r => setTimeout(r, 5000));
  }
  throw new Error('Капча не вирішена');
}

module.exports = { solveCaptcha };
