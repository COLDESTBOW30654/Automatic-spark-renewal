// ==================== 配置区域 ====================
// 需要发送的朋友的抖音（与消息界面昵称一致，也就是修改备注的就是备注名称）
var friendNames = ["账号1", "账号2"];
// 在这里输入你的锁屏密码，如果4位或其他，则修改数组长度，例如：[1, 2, 3, 4];
var password = [1, 2, 3, 4, 5, 6];
// ==================== 配置区域结束 ====================

// 显示控制台悬浮窗
console.show();
console.verbose(`已设置好友列表: ${friendNames.join(", ")}`);
console.verbose("密码已设置");

// 检查无障碍服务是否开启，没有开启则跳转到设置开启界面
console.verbose("正在检查无障碍服务是否开启...");
try {
    auto.waitFor();
    console.verbose("无障碍服务已开启");
} catch (e) {
    console.error("无障碍服务检查失败: " + e);
    exit();
}

// 在打开抖音前置媒体音量为0，需要修改系统设置权限，如果没打开会自动跳转到设置界面
console.verbose("正在设置媒体音量为0...");
try {
    device.setMusicVolume(0);
    console.verbose("媒体音量已设置为0");
} catch (e) {
    console.error("设置媒体音量失败: " + e);
}

// 发送系统消息提示，需要开启发布通知权限，如果没有打开会自动跳转到设置界面
var d = new Date();
console.verbose("正在发送开始执行通知...");
try {
    notice(`开始执行续火花`, `当前时间:${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`);
    console.verbose("通知已发送");
} catch (e) {
    console.error("发送通知失败: " + e);
}

// 记录开始时间，用于统计运行时间
let startTime = new Date().getTime();
console.verbose("开始计时，等待5秒...");
sleep(5000);

// 检查屏幕是否解锁，没有解锁则点亮屏幕
console.verbose("检查屏幕是否解锁...");
try {
    device.wakeUpIfNeeded();
    console.verbose("屏幕已唤醒");
} catch (e) {
    console.error("唤醒屏幕失败: " + e);
}

// 执行在点亮手机后，用于上滑手势，并输入密码
function unlockScreen() {
    console.verbose("开始执行解锁屏幕流程");
    sleep(1000);
    // 上滑手势，进入输入密码界面（如果你的手机手势不是上滑，可能需要其他办法）
    console.verbose("执行上滑手势进入密码界面");
    try {
        swipe(device.width / 2, device.height - 100, device.width / 2, device.height / 2, 500);
        sleep(2000);
        openApp();
    } catch (e) {
        console.error("解锁屏幕失败: " + e);
        exit();
    }
}

// 打开指定软件
function openApp() {
    console.verbose("正在打开抖音应用...");
    try {
        app.launchApp("抖音");
        sleep(5000);
        console.verbose("抖音应用已打开，等待5秒");
        findUser();
    } catch (e) {
        console.error("打开抖音应用失败: " + e);
        exit();
    }
}

// 进入指定好友的聊天界面
function openChat(name) {
    console.verbose(`正在查找好友: ${name}`);
    let target = text(name).findOne(3000) || textContains(name).findOne(2000) || desc(name).findOne(2000);

    if (!target) {
        console.verbose("首屏未找到好友，尝试向上滑动列表查找...");
        swipe(device.width / 2, device.height * 0.7, device.width / 2, device.height * 0.3, 500);
        sleep(2000);
        target = text(name).findOne(3000) || textContains(name).findOne(2000) || desc(name).findOne(2000);
    }

    if (!target) {
        console.error(`未在消息列表中找到好友: ${name}`);
        return false;
    }

    console.verbose(`找到好友: ${name}，正在通过坐标中心点击进入...`);
    let bounds = target.bounds();
    click(bounds.centerX(), bounds.centerY());
    sleep(3000);

    console.verbose("正在检测是否成功进入聊天界面...");
    let inChat = id("lsx").findOne(5000) || className("android.widget.EditText").findOne(3000);
    if (inChat) {
        console.verbose(`已成功进入与 ${name} 的聊天界面`);
        return true;
    }

    console.verbose("坐标点击未触发跳转，尝试点击父级控件...");
    let p = target.parent();
    while (p && !p.isClickable()) {
        p = p.parent();
    }
    if (p && p.isClickable()) {
        p.click();
        sleep(3000);
        if (id("lsx").findOne(5000) || className("android.widget.EditText").findOne(3000)) {
            console.verbose(`已成功进入与 ${name} 的聊天界面`);
            return true;
        }
    }

    console.error(`未能成功进入与 ${name} 的聊天界面，跳过此好友`);
    return false;
}

function findUser() {
    console.verbose("开始查找用户流程");
    console.verbose("尝试点击底栏'消息'选项卡");
    try {
        let msgTab = text("消息").findOne(5000) || desc("消息").findOne(3000);
        if (msgTab) {
            click(msgTab.bounds().centerX(), msgTab.bounds().centerY());
        } else {
            click("消息");
        }
        sleep(5000);
        console.verbose("已进入消息界面，等待5秒");

        // 根据上面填写的昵称列表，挨个点击进入聊天界面
        console.verbose(`开始遍历好友列表，共 ${friendNames.length} 个好友`);
        for (let i = 0; i < friendNames.length; i++) {
            let name = friendNames[i];
            console.verbose(`正在处理第 ${i + 1}/${friendNames.length} 个好友: ${name}`);
            let entered = openChat(name);
            if (entered) {
                sendMessage();
                sleep(2000);
            } else {
                console.error(`未进入 ${name} 的聊天界面，放弃本次续火花`);
            }
        }
        sleep(3000);
        console.verbose("所有好友处理完成");
        killapp();
    } catch (e) {
        console.error("查找用户失败: " + e);
        exit();
    }
}

// 点击发送按钮
function clickSendButton() {
    console.verbose("尝试点击发送按钮");
    var button = desc('发送').findOne(3000);
    if (button) {
        click(button.bounds().centerX(), button.bounds().centerY());
        console.verbose("已通过 desc('发送') 点击发送");
        return true;
    }
    var textBtn = text('发送').findOne(1000);
    if (textBtn) {
        if (textBtn.parent() && textBtn.parent().isClickable()) {
            textBtn.parent().click();
        } else {
            textBtn.click();
        }
        console.verbose("已通过 text('发送') 点击发送");
        return true;
    }
    console.error("未找到发送按钮");
    return false;
}

// 发送消息
function sendMessage() {
    console.verbose("开始发送消息流程");
    try {
        // 严格检测是否在聊天界面
        let inChat = id("lsx").findOne(3000) || className("android.widget.EditText").findOne(3000);
        if (!inChat) {
            console.error("当前不在聊天界面，终止发送流程！");
            return;
        }

        sleep(1000);
        // 发送续火花提示
        console.verbose("输入续火花提示文本");
        let input = className("android.widget.EditText").findOne(3000);
        if (input) {
            input.setText(`正在尝试自动续火花`);
        } else {
            setText(`正在尝试自动续火花`);
        }
        sleep(1000);
        // 点击发送的按钮
        clickSendButton();
        sleep(1000);

        // 获取续火花用时
        let runTime = new Date().getTime() - startTime;
        sleep(1000);
        // 转换时间
        let milliseconds = runTime; // 直接赋值
        let seconds = milliseconds / 1000; // 转换为秒

        // 输出用时
        console.verbose(`续火花完成，总耗时: ${seconds}秒`);
        let edit = className("android.widget.EditText").findOne(3000);
        if (edit) {
            edit.setText(`续火花完成,总耗时: ${seconds}秒`);
        } else {
            setText(`续火花完成,总耗时: ${seconds}秒`);
        }
        sleep(1000);

        // 点击发送的按钮
        clickSendButton();
        sleep(1000);

        console.verbose("返回上一级界面");
        back();
    } catch (e) {
        console.error("发送消息失败: " + e);
        back(); // 尝试返回上一级界面
    }
}

function killapp() {
    console.verbose("开始清理应用流程");
    try {
        // 呼出最近任务
        console.verbose("呼出最近任务");
        recents();
        sleep(1000);

        // 通过上滑的方式清除应用后台，手机分辨率大，可能导致上滑距离不足，可以自己试着修改一下数值，增加滑动距离
        console.verbose("上滑清除应用后台");
        // 解读一下下面这句代码意思就是：从（设备的宽度/2，设备的高度/2在向下400像素）滑到（设备的宽度/2，设备高度/2在向上400像素），移动时间200毫秒
        swipe(device.width / 2, device.height / 2 + 400, device.width / 2, device.height / 2 - 400, 200);
        sleep(1000);

        // 返回桌面
        console.verbose("返回桌面");
        home();
        sleep(1000);

        // 记录运行时间
        let runTime = new Date().getTime() - startTime;
        // 发送结束运行消息
        console.verbose(`发送完成通知，总耗时: ${runTime}毫秒`);
        notice(`续火花完成！`, `总耗时: ${runTime}毫秒`);
    } catch (e) {
        console.error("清理应用失败: " + e);
    }
}

// 立即调用函数调用链的第一个函数，使程序运行
console.verbose("脚本开始执行，调用解锁屏幕函数");
try {
    unlockScreen();
    console.verbose("脚本执行完成");
} catch (e) {
    console.error("脚本执行失败: " + e);
}