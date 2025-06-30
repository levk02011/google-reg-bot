const { useProxy, proxyList } = require('../config');

function getRandomProxy() {
  if (!useProxy || proxyList.length === 0) return null;
  const [user, passHost] = proxyList[Math.floor(Math.random() * proxyList.length)].split('@');
  const [ip, port] = passHost.split(':');
  return { server: `${ip}:${port}`, username: user.split(':')[0], password: user.split(':')[1] };
}

module.exports = { getRandomProxy };
