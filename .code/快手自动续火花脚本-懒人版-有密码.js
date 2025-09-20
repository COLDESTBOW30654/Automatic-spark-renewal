//检查无障碍服务是否开启，没有开启则跳转到设置开启界面
auto.waitFor();

// 设置当前脚本版本
const CURRENT_VERSION = "1.0.0";

/**
 * 版本检查更新函数
 * @param {string} currentVersion 当前脚本版本号
 * @param {function} [callback] 可选的回调函数，接收检查结果
 * @returns {Promise<Object>} 返回包含检查结果的对象
 */
function update(currentVersion, callback) {
    return new Promise((resolve) => {
        // 仓库信息配置
        const GITHUB_REPO_URL = "https://github.com/coldestbow30654/automatic-spark-renewal";
        const GITEE_REPO_URL = "https://gitee.com/coldestbow30654/automatic-spark-renewal";
        const UPDATE_FILE_PATH = "update.txt"; // 更新文件路径
        const GITEE_PROJECT_URL = "https://gitee.com/coldestbow30654/automatic-spark-renewal"; // Gitee项目地址

        // 获取GitHub Raw内容URL
        function getGitHubRawUrl(githubUrl, filePath) {
            return githubUrl.replace("github.com", "raw.githubusercontent.com") + "/main/" + filePath;
        }

        // 获取Gitee Raw内容URL
        function getGiteeRawUrl(giteeUrl, filePath) {
            return giteeUrl + "/raw/main/" + filePath;
        }

        // 尝试从指定URL获取版本信息
        function tryGetVersionFromUrl(url, sourceName) {
            return new Promise((resolveUrl) => {
                let timer = setTimeout(() => {
                    resolveUrl({success: false, error: "超时", source: sourceName});
                }, 10000); // 10秒超时
                
                try {
                    let response = http.get(url, {
                        headers: {
                            'User-Agent': 'AutoJS Script'
                        },
                        timeout: 10000 // 设置超时
                    });
                    
                    clearTimeout(timer);
                    
                    if (response.statusCode === 200) {
                        let content = response.body.string().trim();
                        console.log("从" + sourceName + "获取到版本: " + content);
                        resolveUrl({success: true, content: content, source: sourceName});
                    } else {
                        console.warn("从" + sourceName + "获取版本失败，状态码: " + response.statusCode);
                        resolveUrl({success: false, error: "HTTP " + response.statusCode, source: sourceName});
                    }
                } catch (e) {
                    clearTimeout(timer);
                    console.warn("从" + sourceName + "获取版本时发生错误: " + e);
                    resolveUrl({success: false, error: e.toString(), source: sourceName});
                }
            });
        }

        // 比较版本号
        function compareVersions(current, remote) {
            if (!remote) {
                return "无法获取远程版本";
            }
            
            // 简单字符串比较
            if (current === remote) {
                return "版本一致";
            } else {
                return "发现新版本: " + remote + " (当前: " + current + ")";
            }
        }

        // 主执行逻辑
        function checkUpdate() {
            let githubRawUrl = getGitHubRawUrl(GITHUB_REPO_URL, UPDATE_FILE_PATH);
            let giteeRawUrl = getGiteeRawUrl(GITEE_REPO_URL, UPDATE_FILE_PATH);
            
            console.log("尝试从GitHub获取版本信息...");
            tryGetVersionFromUrl(githubRawUrl, "GitHub").then(function(result) {
                if (!result.success) {
                    console.log("GitHub访问失败，原因: " + result.error + "，尝试Gitee...");
                    return tryGetVersionFromUrl(giteeRawUrl, "Gitee");
                } else {
                    return result;
                }
            }).then(function(result) {
                let finalResult = {
                    success: result.success,
                    currentVersion: currentVersion,
                    source: result.source || "无"
                };
                
                if (result.success) {
                    finalResult.remoteVersion = result.content;
                    finalResult.message = compareVersions(currentVersion, result.content);
                    finalResult.hasUpdate = currentVersion !== result.content;
                    
                    // 如果发现新版本，发送通知
                    if (finalResult.hasUpdate) {
                        console.log("发现新版本: " + finalResult.remoteVersion);
                        console.log("请前往 " + GITEE_PROJECT_URL + " 更新脚本");
                        // 发送通知
                        notice("发现新版本", "当前版本: " + CURRENT_VERSION + ", 最新版本: " + finalResult.remoteVersion + "。请手动访问Gitee更新脚本:https://gitee.com/coldestbow30654/automatic-spark-renewal");
                    }
                } else {
                    finalResult.error = result.error;
                    finalResult.message = "脚本更新检查失败";
                }
                
                // 调用回调函数（如果提供）
                if (typeof callback === 'function') {
                    callback(finalResult);
                }
                
                // 解析Promise
                resolve(finalResult);
            }).catch(function(error) {
                let finalResult = {
                    success: false,
                    currentVersion: currentVersion,
                    source: "无",
                    error: error.toString(),
                    message: "脚本更新检查失败"
                };
                if (typeof callback === 'function') {
                    callback(finalResult);
                }
                resolve(finalResult);
            });
        }
        
        // 开始检查更新
        checkUpdate();
    });
}

// 示例使用
function updatemain() {
    // 显示当前版本
    console.log("当前脚本版本: " + CURRENT_VERSION);
    toast("当前脚本版本: " + CURRENT_VERSION);
    
    // 检查更新
    console.log("开始检查更新...");
    
    update(CURRENT_VERSION, function(result) {
        if (result.success) {
            if (result.hasUpdate) {
                console.log("发现新版本: " + result.remoteVersion);
                console.log("请前往 https://gitee.com/coldestbow30654/automatic-spark-renewal 更新脚本");
                // 这里可以添加其他更新逻辑
            } else {
                console.log("当前已是最新版本");
                toast("当前已是最新版本");
            }
        } else {
            console.log("更新检查失败: " + result.error);
            toast("更新检查失败");
        }
        
        // 更新检查完成后退出脚本
        console.log("脚本执行完成，即将退出");
        exit();
    });
}

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
  updatemain();
}
//立即调用函数调用链的第一个函数，使程序运行
unlockScreen();