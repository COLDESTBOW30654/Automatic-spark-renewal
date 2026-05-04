// ==================== 配置区域 ====================
var config = {
    // 需要发送的朋友的快手（与消息界面昵称一致，也就是修改备注的就是备注名称）
    friendNames: ["账号1", "账号2"],
    // 在这里输入你的锁屏密码，如果4位或其他，则修改数组长度，例如：[1, 2, 3, 4];
    password: [1, 2, 3, 4, 5, 6],
    // 是否启用密码解锁（true: 启用, false: 跳过解锁直接打开应用）
    enablePassword: true,
    // 点击续火花表情的次数
    sparkClickCount: 20,
    // 每次点击续火花表情后的等待时间（毫秒）
    sparkClickInterval: 500,
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

//检查无障碍服务是否开启，没有开启则跳转到设置开启界面
auto.waitFor();
//在打开快手前置媒体音量为0，需要修改系统设置权限，如果没打开会自动跳转到设置界面
device.setMusicVolume(0);
//发送系统消息提示，需要开启发布通知权限，如果没有打开会自动跳转到设置界面
var d = new Date();
notice(`开始执行续火花`, `当前时间:${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
//记录开始时间，用于统计运行时间
let startTime = new Date().getTime();
sleep(5000);
//检查屏幕是否解锁，没有解锁则点亮屏幕
device.wakeUpIfNeeded();

//需要发送的朋友的快手（与消息界面昵称一致，也就是修改备注的就是备注名称）
var friendNames = config.friendNames;
//在这里输入你的锁屏密码，如果4位或其他，则修改数组长度，例如：[1, 2, 3, 4];
var password = config.password;

function unlockScreen() {
  if (config.enablePassword) {
    sleep(1000);
    //上滑手势，进入输入密码界面（如果你的手机手势不是上滑，可能需要其他办法）
    swipe(device.width / 2, device.height - 100, device.width / 2, device.height / 2, 500);
    sleep(1000);
    //这里通过遍历上方输入密码的数组，来依次点击对应按钮输入密码
    for (let i = 0; i < password.length; i++) {
      let p = password[i].toString();
      desc(p).findOne().click();
      sleep(200);
    }
    sleep(2000);
  }
  openApp();
}

//打开指定软件
function openApp() {
    app.launchApp("快手");
    sleep(5000);
    findUser();
}

function findUser() {
    //点击屏幕中的消息文本
    click("消息");
    sleep(5000);
    //根据上面填写的昵称列表，挨个点击进入聊天界面
    for (let i = 0; i < friendNames.length; i++) {
        click(friendNames[i]);
        sleep(3000);
        sendMessage();
    }
    sleep(3000);
    killapp();
}

//发送消息
function sendMessage() {
    var content = ""; //内容
    var from = ""; //出处
    //这里发送的消息的内容是通过hitokoto的api接口，获得不重复的随机的名人名言
    var res = http.get("https://v1.hitokoto.cn/");
    if (res.statusCode == 200) {
        var data = res.body.json();
        content = data.hitokoto;
        from = data.from;
    } else {
        //在请求接口失败后发送的内容
        content = "今天网络不佳，没词了";
    }
    sleep(100);
    //发送续火花提示
    setText(config.sparkMessage);
    sleep(100);
    //点击发送的按钮
    id("send_btn").findOne().click();
    sleep(100);
    //点击表情按钮
    id("emotion_btn").findOne().click();
    sleep(100);
    //划到表情最前面
    // 通过控件ID查找控件
    let targetWidget = id("tabIndicator").findOne();
    // 获取控件坐标信息
    let bounds = targetWidget.bounds();
    let centerY = bounds.centerY();
    // 计算滑动路径的起点和终点 (从控件右侧划到左侧)
    let startX = bounds.right; // 起点：控件右侧50像素处
    let endX = bounds.left + 10000;   // 终点：控件左侧50像素处
    let yPos = centerY;            // Y轴使用控件中心高度
    // 执行滑动操作 (600毫秒完成)
    swipe(startX, yPos, endX, yPos, 500);
    //并点击表情
    sleep(1000);
    auto.waitFor();
    sleep(1000);
    //将表情向上划到顶端
    swipe(device.width / 2, device.height - 320, device.width / 2, device.height + 8000, 500);
    sleep(1000);
    //自动点击续火花表情
    for (let i = 0; i < config.sparkClickCount; i++) {
        id("emotion_name").className("android.widget.TextView").text("续火花").findOne().parent().click();
        sleep(config.sparkClickInterval);
    }
    //发送续火花消息
    sleep(1000);
    id("send_btn").findOne().click();
    sleep(1000);
    //发送今日一言
    if (config.enableHitokoto) {
        setText(`今日一言:"${content} —— ${from}"`);
        sleep(1000);
        //点击发送的按钮
        id("send_btn").findOne().click();
        sleep(1000);
    }
    //获取续火花用时
    let runTime = new Date().getTime() - startTime;
    sleep(1000);
    //转换时间
    let milliseconds = runTime; // 直接赋值
    let seconds = milliseconds / 1000; // 转换为秒
    //输出用时
    if (config.enableTimeOutput) {
        setText(`续火花完成,总耗时: ${seconds}秒`);
        sleep(1000);
        //点击发送的按钮
        id("send_btn").findOne().click();
        sleep(1000);
    }
    back();
}

function killapp() {
    //呼出最近任务,
    recents();
    sleep(1000);
    //通过上滑的方式清除应用后台，手机分辨率大，可能导致上滑距离不足，可以自己试着修改一下数值，增加滑动距离
    //解读一下下面这句代码意思就是：从（设备的宽度/2，设备的高度/2在向下400像素）滑到（设备的宽度/2，设备高度/2在向上400像素），移动时间200毫秒
    swipe(device.width / 2, device.height / 2 + 400, device.width / 2, device.height / 2 - 400, 200);
    sleep(1000);
    //返回桌面
    home();
    sleep(1000);
    //记录运行时间
    let runTime = new Date().getTime() - startTime;
    //发送结束运行消息
    notice(`续火花完成！`, `总耗时: ${runTime}毫秒`);
}
//立即调用函数调用链的第一个函数，使程序运行
unlockScreen();
//根据配置执行息屏操作
if (config.enableAutoSleep) {
    if (config.sleepMode === "root") {
        //使用root权限执行电源按键操作进行熄屏
        Power();
    } else if (config.sleepMode === "shizuku") {
        //使用shizuku权限执行电源按键操作进行熄屏
        shizuku(`input keyevent ${KeyEvent.KEYCODE_POWER}`);
    }
}