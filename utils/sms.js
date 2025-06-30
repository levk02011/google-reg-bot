const axios = require('axios');
const { smsApiKey } = require('../config');

async function getPhone() {
  const res = await axios.get(`https://5sim.net/v1/user/buy/activation/any/any/google`, {
    headers: { Authorization: `Bearer ${smsApiKey}` }
  });
  return res.data;
}

async function waitForSms(id) {
  for (let i = 0; i < 30; i++) {
    const res = await axios.get(`https://5sim.net/v1/user/check/${id}`, {
      headers: { Authorization: `Bearer ${smsApiKey}` }
    });
    if (res.data.sms.length > 0) return res.data.sms[0].code;
    await new Promise(r => setTimeout(r, 5000));
  }
  throw new Error('SMS не прийшло');
}

module.exports = { getPhone, waitForSms };
