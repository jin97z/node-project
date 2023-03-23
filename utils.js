"use strict";
const crypto = require("crypto");

/**
 * AES加密的配置
 * 1.密钥
 * 2.偏移向量
 * 3.算法模式CBC
 * 4.补全值
 */
var AES_conf = {
  key: getSecretKey(), //密钥
  iv: "1012132405963708", //偏移向量
  padding: "PKCS7Padding", //补全值
};

/**
 * 读取密钥key
 * 更具当前客户端的版本vid、平台platform获取对应的key
 */
function getSecretKey() {
  return "abcdabcdabcdasss";
}

/**
 * AES_128_CBC 加密
 * 128位
 * return base64
 */
function encryption(data) {
  let key = AES_conf.key;
  let iv = AES_conf.iv;
  // let padding = AES_conf.padding;

  var cipherChunks = [];
  var cipher = crypto.createCipheriv("aes-128-cbc", key, iv);
  cipher.setAutoPadding(true);
  cipherChunks.push(cipher.update(data, "utf8", "base64"));
  cipherChunks.push(cipher.final("base64"));
  return cipherChunks.join("");
}

/**
 * 解密
 * return utf8
 */
function decryption(data) {
  let key = AES_conf.key;
  let iv = AES_conf.iv;
  // let padding = AES_conf.padding;

  var cipherChunks = [];
  var decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(data, "base64", "utf8"));
  cipherChunks.push(decipher.final("utf8"));
  return cipherChunks.join("");
}

module.exports = {
  encryption,
  decryption,
};
