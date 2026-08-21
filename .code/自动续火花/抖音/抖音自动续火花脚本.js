// ==================== 配置区域 ====================
var config = {
    // 需要发送的朋友的抖音（与消息界面昵称一致，也就是修改备注的就是备注名称）
    friendNames: ["账号1", "账号2"],
    // 在这里输入你的锁屏密码，如果4位或其他，则修改数组长度，例如：[1, 2, 3, 4];
    password: [1, 2, 3, 4, 5, 6],
    // 是否启用密码解锁（true: 启用, false: 跳过解锁直接打开应用）
    enablePassword: true,
    // 自动续火花声明消息
    sparkMessage: "正在尝试自动续火花",
    // 是否启用今日一言（true: 启用, false: 不发送）
    enableHitokoto: true,
    // 是否输出用时（true: 输出, false: 不输出）
    enableTimeOutput: true,
    // 是否启用自动息屏（true: 启用, false: 不启用）
    enableAutoSleep: true,
    // 息屏模式（"root": root权限模式, "shizuku": shizuku权限模式）
    sleepMode: "shizuku"
};
// ==================== 配置区域结束 ====================

// 检查无障碍服务是否开启，没有开启则跳转到设置开启界面
auto.waitFor();

// 在打开抖音前置媒体音量为0，需要修改系统设置权限，如果没打开会自动跳转到设置界面
device.setMusicVolume(0);
// 发送系统消息提示，需要开启发布通知权限，如果没有打开会自动跳转到设置界面
var d = new Date();
notice(`开始执行续火花`, `当前时间:${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
// 记录开始时间，用于统计运行时间
let startTime = new Date().getTime();
sleep(5000);
// 检查屏幕是否解锁，没有解锁则点亮屏幕
device.wakeUpIfNeeded();

// 需要发送的朋友的抖音（与消息界面昵称一致，也就是修改备注的就是备注名称）
var friendNames = config.friendNames;
// 在这里输入你的锁屏密码，如果4位或其他，则修改数组长度，例如：[1, 2, 3, 4];
var password = config.password;

// 执行在点亮手机后，用于上滑手势，并输入密码
function unlockScreen() {
  if (config.enablePassword) {
    sleep(1000);
    // 上滑手势，进入输入密码界面（如果你的手机手势不是上滑，可能需要其他办法）
    swipe(device.width / 2, device.height - 100, device.width / 2, device.height / 2, 500);
    sleep(1000);
    // 这里通过遍历上方输入密码的数组，来依次点击对应按钮输入密码
    for (let i = 0; i < password.length; i++) {
      let p = password[i].toString();
      desc(p).findOne().click();
      sleep(200);
    }
    sleep(2000);
  }
  openApp();
}

// 打开指定软件
function openApp() {
  app.launchApp("抖音");
  sleep(5000);
  findUser();
}

// 进入指定好友的聊天界面
function openChat(name) {
  // 查找好友昵称控件
  let target = text(name).findOne(3000) || textContains(name).findOne(2000) || desc(name).findOne(2000);

  // 首屏未找到则尝试滑动消息列表查找
  if (!target) {
    swipe(device.width / 2, device.height * 0.7, device.width / 2, device.height * 0.3, 500);
    sleep(2000);
    target = text(name).findOne(3000) || textContains(name).findOne(2000) || desc(name).findOne(2000);
  }

  if (!target) {
    return false;
  }

  // 点击好友项（通过坐标中心点击，确保能够触发跳转）
  let bounds = target.bounds();
  click(bounds.centerX(), bounds.centerY());
  sleep(3000);

  // 严格判定是否已成功进入聊天界面（检测表情按钮 id("lsx") 或输入框）
  let inChat = id("lsx").findOne(5000) || className("android.widget.EditText").findOne(3000);
  if (inChat) {
    return true;
  }

  // 尝试点击可点击的父级控件
  let p = target.parent();
  while (p && !p.isClickable()) {
    p = p.parent();
  }
  if (p && p.isClickable()) {
    p.click();
    sleep(3000);
    if (id("lsx").findOne(5000) || className("android.widget.EditText").findOne(3000)) {
      return true;
    }
  }

  return false;
}

function findUser() {
  // 点击屏幕底部的“消息”选项卡
  let msgTab = text("消息").findOne(5000) || desc("消息").findOne(3000);
  if (msgTab) {
    click(msgTab.bounds().centerX(), msgTab.bounds().centerY());
  } else {
    click("消息");
  }
  sleep(5000);

  // 根据上面填写的昵称列表，挨个点击进入聊天界面
  for (let i = 0; i < friendNames.length; i++) {
    let name = friendNames[i];
    let entered = openChat(name);
    if (entered) {
      sendMessage();
      sleep(2000);
    }
  }
  sleep(3000);
  killapp();
}

// 点击发送按钮
function clickSendButton() {
  var button = desc('发送').findOne(3000);
  if (button) {
    click(button.bounds().centerX(), button.bounds().centerY());
    return true;
  }
  var textBtn = text('发送').findOne(1000);
  if (textBtn) {
    if (textBtn.parent() && textBtn.parent().isClickable()) {
      textBtn.parent().click();
    } else {
      textBtn.click();
    }
    return true;
  }
  return false;
}

// 发送消息
function sendMessage() {
  // 确保处于聊天界面再开始执行
  let inChat = id("lsx").findOne(3000) || className("android.widget.EditText").findOne(3000);
  if (!inChat) {
    return;
  }

  var content = ""; // 内容
  var from = ""; // 出处
  // 随机选择一言分类: i (诗词), j (网易云), k (哲学)
  var types = ["i", "j", "k"];
  var randomType = types[Math.floor(Math.random() * types.length)];
  // 这里发送的消息的内容是通过hitokoto的api接口，获得不重复的随机名言（诗词/网易云/哲学）
  var res = http.get("https://v1.hitokoto.cn/?c=" + randomType);
  if (res.statusCode == 200) {
    var data = res.body.json();
    content = data.hitokoto;
    from = data.from;
  } else {
    // 在请求接口失败后发送的内容
    content = "今天网络不佳，没词了";
  }
  sleep(500);

  // 发送续火花提示
  let input = className("android.widget.EditText").findOne(3000);
  if (input) {
    input.setText(config.sparkMessage);
  } else {
    setText(config.sparkMessage);
  }
  sleep(500);
  // 点击发送的按钮
  clickSendButton();
  sleep(1000);

  // 发送今日一言
  if (config.enableHitokoto) {
    let msg = `今日一言:“${content} —— ${from}”`;
    let edit = className("android.widget.EditText").findOne(3000);
    if (edit) {
      edit.setText(msg);
    } else {
      setText(msg);
    }
    sleep(1000);
    clickSendButton();
    sleep(1000);
  }

  // 获取续火花用时
  let runTime = new Date().getTime() - startTime;
  sleep(1000);
  // 转换时间
  let milliseconds = runTime; // 直接赋值
  let seconds = milliseconds / 1000; // 转换为秒
  // 输出用时
  if (config.enableTimeOutput) {
    let timeMsg = `续火花完成,总耗时: ${seconds}秒`;
    let edit = className("android.widget.EditText").findOne(3000);
    if (edit) {
      edit.setText(timeMsg);
    } else {
      setText(timeMsg);
    }
    sleep(1000);
    clickSendButton();
    sleep(1000);
  }
  back();
}

function killapp() {
  // 呼出最近任务
  recents();
  sleep(1000);
  // 通过上滑的方式清除应用后台，手机分辨率大，可能导致上滑距离不足，可以自己试着修改一下数值，增加滑动距离
  // 解读一下下面这句代码意思就是：从（设备的宽度/2，设备的高度/2在向下400像素）滑到（设备的宽度/2，设备高度/2在向上400像素），移动时间200毫秒
  swipe(device.width / 2, device.height / 2 + 400, device.width / 2, device.height / 2 - 400, 200);
  sleep(1000);
  // 返回桌面
  home();
  sleep(1000);
  // 记录运行时间
  let runTime = new Date().getTime() - startTime;
  // 发送结束运行消息
  notice(`续火花完成！`, `总耗时: ${runTime}毫秒`);
}

// 立即调用函数调用链的第一个函数，使程序运行
unlockScreen();

// 根据配置执行息屏操作
if (config.enableAutoSleep) {
  if (config.sleepMode === "root") {
    // 使用root权限执行电源按键操作进行熄屏
    Power();
  } else if (config.sleepMode === "shizuku") {
    // 使用shizuku权限执行电源按键操作进行熄屏
    shizuku(`input keyevent ${KeyEvent.KEYCODE_POWER}`);
  }
}
