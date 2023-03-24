var express = require("express");
var app = express();

var fs = require("fs");

const superagent = require("superagent");

const cheerio = require("cheerio");

// 处理程序之前，在中间件中对传入的请求体进行解析（response body）
const md5 = require("js-md5");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//解决跨域的问题：设置静态资源目录 页面直接访问这个后台地址
app.use("/", express.static("public"));

//引入aes的代码
const util = require("./utils");

//加密;
// console.log(util.encryption("123123"));
//解密;
// console.log(util.decryption("Ly0DBA8pGNj26xnAbIG8fC0KhMEi7r1EhoPjV0RaRFY="));

// md5对密码进行与前台相同操作的加密
function reverseStr(str) {
  return str.split("").reverse().join("");
}
function fmtPwd(password) {
  return md5(reverseStr(md5(reverseStr(password))));
}

// * ：每次请求都会先走这里，相当于是个过滤器
app.use("*", (req, res, next) => {
  //如果不是登录 则都是请求的需要走里面进行验证如果aes秘密解不开将会报错 将返回一个非法请求
  if (req.baseUrl !== "/login") {
    // 在这个req的headers里找到token
    let { token } = req.headers;
    if (!token)
      return res.json({
        code: 200,
        status: 200,
        success: true,
        msg: "非法请求",
        date: new Date().getTime(),
      });
    // try里如果报错，将会走catch里 没传、token不对都会报错
    try {
      // 对token进行解密
      let str = util.decryption(token);
      let time = new Date(parseInt(str.split("|")[1])).toDateString();
      let username = str.split("|")[0];
      console.log(`${username}在${time}请求了${req.baseUrl}`);
      next();
    } catch (error) {
      res.json({
        code: 200,
        status: 200,
        success: true,
        msg: "非法请求",
        date: new Date().getTime(),
      });
    }
  } else {
    next();
  }
});

app.post("/login", (req, res) => {
  let { username, password } = req.body;
  //   let str = fmtPwd("97529752");
  // 验证用户名和秘密是否正确
  if (username === "admin" && password === "123456") {
    //将令牌发给登录过的用户
    let token = util.encryption([username, +new Date()].join("|"));
    res.json({
      code: 0,
      status: 0,
      success: true,
      msg: "成功",
      date: new Date().getTime(),
      data: token,
    });
  } else {
    res.json({
      code: 100,
      status: 1,
      success: false,
      msg: "账号或密码错误",
      date: new Date().getTime(),
    });
  }
});

app.get("/list", function (req, res) {
  fs.readFile(__dirname + "/" + "users.json", "utf8", function (err, data) {
    res.json({
      code: 0,
      status: 0,
      success: true,
      msg: "账号或密码错误",
      date: new Date().getTime(),
      data: JSON.parse(data),
    });
  });
});

app.get("/node", function (req, res, next) {
  superagent.get("https://cnodejs.org/").end(function (err, sres) {
    if (err) {
      return next();
    }
    var $ = cheerio.load(sres.text);
    var items = [];
    $("#topic_list .topic_title").each(function (idx, element) {
      var $element = $(element);
      items.push({
        title: $element.attr("title"),
        href: $element.attr("href"),
      });
    });
    $("#topic_list .user_avatar img").each(function (idx, element) {
      var $element = $(element);
      items[idx]["image"] = $element.attr("src");
    });
    res.json({
      code: 0,
      status: 0,
      success: true,
      msg: "成功",
      date: new Date().getTime(),
      data: items,
    });
  });
});

app.listen(8888, () => {
  console.log("app is sunning, 应用实例，访问地址为 http://127.0.0.1:8888");
});
