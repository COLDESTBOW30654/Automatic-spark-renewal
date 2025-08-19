# AutoJS6快手自动续火花

readme文档编写时间：2025年8月19日21点10分

#### 介绍

基于[AutoJS6抖音自动续火花: AutoJS6抖音自动续火花](https://gitee.com/ewaaa/auto-js6-tiktok-auto-spark)二改制作的快手自动续火花

**原作者bilibili：[LuckyLK-的个人空间-LuckyLK-个人主页-哔哩哔哩视频**

**本二改版本的熄屏方式采用模拟电源按键熄屏，由于安卓内部的安全限制，需要使用shizuku给予权限，或使用root基于权限，如果你启动了“自动熄屏”，那当我没说，可忽视“使用说明第二条“，并不在第三条的图片中打开“shizuku权限”**

#### 软件架构：

AutoJS6

JavaScript

#### 使用说明：

1. 安装AutoJS6 [Releases · SuperMonster003/AutoJs6](https://github.com/SuperMonster003/AutoJs6/releases)

2. 安装shizuku[Releases · RikkaApps/Shizuku](https://github.com/RikkaApps/Shizuku/releases)并启用，确保Auto.js可以获取shizuku权限，启用教程可以看这位大佬的视频 [安卓免root神器，Shizuku全机型激活教程！](https://www.bilibili.com/video/BV1Ac1dYSELU?vd_source=5d390e1251e1b33bfb2306c8a255e726)

3. 设置autojs权限，下图圈出了该脚本所需的权限

   ![photo](.\photo.png)

4. 选择合适的脚本复制到你的autojs下

5. 填写需要填写的内容，例如好友昵称，锁屏密码

6. 运行脚本

#### 下载或复制代码：

两个版本本质上只是模拟熄屏按键的代码不同，也就是最后一行，如只使用无障碍权限授权，采用手机自动熄屏，可复制任意一种版本的代码，删除最后一行

**shizuku版:**

```javascript
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
var friendNames = ["账号1", "账号2"];
//在这里输入你的锁屏密码，如果4位或其他，则修改数组长度，例如：[1, 2, 3, 4];
var password = [1, 2, 3, 4, 5, 6];

//执行在点亮手机后，用于上滑手势，并输入密码
function unlockScreen() {
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
    setText(`正在尝试自动续火花`);
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
    let centerX = bounds.centerX();
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
    // 配置参数
    const TARGET_TEXT = "续火花";
    const CLICK_COUNT = 20;
    const CLICK_DELAY = 80; // 每次点击间隔(毫秒)
    const SCROLL_DELAY = 1200;  // 滑动后等待时间
    const VERTICAL_OFFSET = 50; // 点击位置在文本上方的偏移量
    // 1. 找到目标控件（替换为你的控件ID）
    let startControl = id('emotion_img').findOne();
    // 2. 计算滑动距离（3个控件高度）
    let controlHeight = startControl.bounds().height();
    let startY = startControl.bounds().centerY();
    let endY = startY - controlHeight * 3;
    // 修复：检查滑动边界
    if (endY < 50) endY = 50;
    // 3. 执行滑动
    swipe(device.width / 2, startY, device.width / 2, endY, 800);
    sleep(SCROLL_DELAY);
    // 4. 查找"续火花"文本控件
    let sparkText = text(TARGET_TEXT).findOne(5000);
    if (!sparkText) exit();
    // 5. 计算点击位置
    let sparkBounds = sparkText.bounds();
    let targetX = sparkBounds.centerX();
    let targetY = sparkBounds.top - VERTICAL_OFFSET;
    // 确保点击位置安全
    if (targetY < 100) targetY = 100;
    // 6. 执行点击操作
    for (let i = 0; i < CLICK_COUNT; i++) {
        // 使用稳定点击方法
        press(targetX, targetY, CLICK_DELAY);
        // 修复：检查界面是否滑动
        let currentText = text(TARGET_TEXT).findOne(1000);
        if (currentText) {
            let currentBounds = currentText.bounds();
            if (Math.abs(currentBounds.top - sparkBounds.top) > 50) {
                sparkText = currentText;
                sparkBounds = currentBounds;
                targetX = sparkBounds.centerX();
                targetY = sparkBounds.top - VERTICAL_OFFSET;
            }
        }
        sleep(CLICK_DELAY);
    }
    //发送续火花消息
    sleep(1000);
    id("send_btn").findOne().click();
    sleep(1000);
    //发送今日一言
    setText(`今日一言:“${content} —— ${from}”`);
    sleep(1000);
    //点击发送的按钮
    id("send_btn").findOne().click();
    sleep(1000);
    //获取续火花用时
    let runTime = new Date().getTime() - startTime;
    sleep(1000);
    //转换时间
    let milliseconds = runTime; // 直接赋值
    let seconds = milliseconds / 1000; // 转换为秒
    //输出用时
    setText(`续火花完成,总耗时: ${seconds}秒`);
    sleep(1000);
    //点击发送的按钮
    id("send_btn").findOne().click();
    sleep(1000);
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
//使用shizuku权限执行电源按键操作进行熄屏
shizuku(`input keyevent ${KeyEvent.KEYCODE_POWER}`); 
```

**Root版：**

```javascript
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
var friendNames = ["账号1", "账号2"];
//在这里输入你的锁屏密码，如果4位或其他，则修改数组长度，例如：[1, 2, 3, 4];
var password = [1, 2, 3, 4, 5, 6];

//执行在点亮手机后，用于上滑手势，并输入密码
function unlockScreen() {
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
    setText(`正在尝试自动续火花`);
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
    let centerX = bounds.centerX();
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
    // 配置参数
    const TARGET_TEXT = "续火花";
    const CLICK_COUNT = 20;
    const CLICK_DELAY = 80; // 每次点击间隔(毫秒)
    const SCROLL_DELAY = 1200;  // 滑动后等待时间
    const VERTICAL_OFFSET = 50; // 点击位置在文本上方的偏移量
    // 1. 找到目标控件（替换为你的控件ID）
    let startControl = id('emotion_img').findOne();
    // 2. 计算滑动距离（3个控件高度）
    let controlHeight = startControl.bounds().height();
    let startY = startControl.bounds().centerY();
    let endY = startY - controlHeight * 3;
    // 修复：检查滑动边界
    if (endY < 50) endY = 50;
    // 3. 执行滑动
    swipe(device.width / 2, startY, device.width / 2, endY, 800);
    sleep(SCROLL_DELAY);
    // 4. 查找"续火花"文本控件
    let sparkText = text(TARGET_TEXT).findOne(5000);
    if (!sparkText) exit();
    // 5. 计算点击位置
    let sparkBounds = sparkText.bounds();
    let targetX = sparkBounds.centerX();
    let targetY = sparkBounds.top - VERTICAL_OFFSET;
    // 确保点击位置安全
    if (targetY < 100) targetY = 100;
    // 6. 执行点击操作
    for (let i = 0; i < CLICK_COUNT; i++) {
        // 使用稳定点击方法
        press(targetX, targetY, CLICK_DELAY);
        // 修复：检查界面是否滑动
        let currentText = text(TARGET_TEXT).findOne(1000);
        if (currentText) {
            let currentBounds = currentText.bounds();
            if (Math.abs(currentBounds.top - sparkBounds.top) > 50) {
                sparkText = currentText;
                sparkBounds = currentBounds;
                targetX = sparkBounds.centerX();
                targetY = sparkBounds.top - VERTICAL_OFFSET;
            }
        }
        sleep(CLICK_DELAY);
    }
    //发送续火花消息
    sleep(1000);
    id("send_btn").findOne().click();
    sleep(1000);
    //发送今日一言
    setText(`今日一言:“${content} —— ${from}”`);
    sleep(1000);
    //点击发送的按钮
    id("send_btn").findOne().click();
    sleep(1000);
    //获取续火花用时
    let runTime = new Date().getTime() - startTime;
    sleep(1000);
    //转换时间
    let milliseconds = runTime; // 直接赋值
    let seconds = milliseconds / 1000; // 转换为秒
    //输出用时
    setText(`续火花完成,总耗时: ${seconds}秒`);
    sleep(1000);
    //点击发送的按钮
    id("send_btn").findOne().click();
    sleep(1000);
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
//使用root权限执行电源按键操作进行熄屏
Power()
```



#### 注意事项：

1.  请勿同时运行多个重复脚本
2.  脚本运行过程中请勿进行任何操作
3.  **测试使用版本**： 最新autojs版本（6.6.4）
4.  若新版本的脚本使用有问题，例如通过按钮名称自动寻找按钮位置点击无法生效，请尝试修改部分点击坐标的位置
5.  需将发送消息的方式修改为发送按键
6.  确保启用shizuku权限

#### 常见问题回答：

1. autojs如何下载安装使用？

这个你可以去查相关教程，都特别详细，简直是保姆级教程。

2. 这个脚本可以给多个人发送消息吗？

暂未测试

3. 脚本发送的内容可以自定义吗？

目前为开放

4. 如何知道我手机点击位置的坐标？

开发者模式，打开显示坐标功能，具体步骤可以自己查询。

   5.我不会使用shizuku，手机又没root怎么办？

等待一键锁屏APP的开发结束，目前由于部分原因，我测试时发现oppo手机在通过打开“一键锁屏”时无法正常锁屏，由于条件有限，其他手机环境暂未测试

#### 重要提示：

##### 在下载、安装或使用本脚本（以下简称“脚本”）之前，请您务必仔细阅读并充分理解[用户使用协议](.LICENSE.md)的所有条款。您的下载、安装或使用行为即被视为您已完全阅读、理解并同意接受本协议的全部条款约束。如果您不同意本协议的任何内容，请立即停止使用并删除本脚本。

