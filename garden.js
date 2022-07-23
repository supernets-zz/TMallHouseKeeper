var garden = {};

var common = require("./common.js");
var commonAction = require("./commonAction.js");

const signInTag = "猫享花园每日任务";
const summon = "./Garden/summon.jpg";
const envelope = "./Garden/envelope.jpg";
const getItBubble = "./Garden/getItBubble.jpg";
const dailyBonus = "./Garden/dailyBonus.jpg";
const loading = "./Garden/loading.jpg";

garden.dailyJobs = [];
garden.dailyJobs.push(signInTag);

//进入猫享花园
gotoGarden = function () {
    log("gotoGarden");
    var mineTab = packageName(common.destPackageName).desc("我").visibleToUser(true).findOne(1000);
    if (mineTab == null) {
        return null;
    }

    var clickRet = click(mineTab.bounds().centerX(), mineTab.bounds().centerY());
    if (clickRet == false) {
        log("点击 我: " + clickRet);
        return null;
    }

    log("点击 我: " + clickRet + ", 并等待 我的订单 出现, 15s超时");
    var orderTips = common.waitForText("text", "我的订单", true, 15);
    if (orderTips == null) {
        return null;
    }

    var gardenTips = text("奇妙花园").visibleToUser(true).findOne(1000);
    if (gardenTips == null) {
        return null;
    }

    clickRet = gardenTips.parent().child(0).click();
    if (clickRet == false) {
        log("点击 奇妙花园: " + clickRet);
        return null;
    }
/*
    var gardenTips = text("猫享花园").visibleToUser(true).findOne(1000);
    if (gardenTips == null) {
        log("上划屏幕: " + swipe(device.width / 2, device.height * 3 / 4, device.width / 2, device.height / 4, 500));
        gardenTips = text("猫享花园").visibleToUser(true).findOne(1000);
        if (gardenTips == null) {
            return null;
        }
    }

    clickRet = gardenTips.parent().click();
    if (clickRet == false) {
        log("点击 猫享花园: " + clickRet);
        return null;
    }
*/
    // log("点击 猫享花园: " + clickRet + ", 并等待 /Lv\.\d+|开心收下/ 出现, 30s超时");
    // var levelTips = common.waitForTextMatches(/Lv\.\d+|开心收下/, true, 30);
    // if (levelTips == null) {
    //     return null;
    // }
    log("点击 猫享花园: " + clickRet + ", 并等待 加载画面 出现，30s超时");
    var loadingPt = common.waitForImage(loading, 30);
    if (loadingPt == null) {
        return null;
    }

    log("等待 加载画面 消失，30s超时");
    var ret = common.waitImageDismiss(loading, 30);
    if (!ret) {
        return null;
    }

    sleep(5000);
    log("等待 图片 召唤 或 开心收下 出现，30s超时");
    var startTick = new Date().getTime();
    for (;;) {
        var getBtn = text("开心收下").findOne(1000);
        var summonPt = common.findImageInRegion(summon, 0, device.height * 3 / 4, device.width, device.height / 4);
        log("开心收下: " + getBtn);
        log("召唤: " + summonPt);

        if (getBtn != null) {
            clickRet = getBtn.click();
            toastLog("点击 开心收下: " + clickRet);
            if (clickRet == false) {
                return null;
            }
            break;
        }

        if (summonPt != null) {
            toastLog("图片 召唤: " + summonPt);
            break;
        }

        sleep(1000);
        if (new Date().getTime() - startTick > 30 * 1000) {
            log("timeout");
            return null;
        }
    }

    var levelTips = textMatches(/Lv\.\d+/).findOne(1000);
    if (levelTips == null) {
        return null;
    }

    //集氧气levelTips.parent().parent().parent().parent().parent().child(最后一个)
    return levelTips.parent().parent().parent().parent().parent();
}

doGetDailyBonus = function () {
    var bonusPt = common.findImageInRegion(dailyBonus, 0, device.height / 4, device.width, device.height / 2);
    if (bonusPt != null) {
        var clickRet = click(bonusPt.x, bonusPt.y);
        log("点击领取" + bonusPt + ": " + clickRet);
    }
}

doOneWalkTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + tasklist[i].Button.click());
        // 等待离开任务列表页面
        sleep(tasklist[i].Timeout * 1000);
        commonAction.backToFeedTaskList(tasklist[i].Title);
        ret = true;
        break;
    }

    return ret;
}

doGuideTasks = function (tasklist) {
    var ret = false;
    for (var i = 0; i < tasklist.length; i++) {
        toastLog("点击[" + (i+1) + "/" + tasklist.length + "] " + tasklist[i].Title + " " + tasklist[i].BtnName + ": " + tasklist[i].Button.click());
        // 等待离开任务列表页面
        var giveupBtn = common.waitForText("textContains", "放弃攒氧气", true, 15);
        if (giveupBtn == null) {
            commonAction.backToFeedTaskList(tasklist[i].Title);
            break;
        }

        var clickRet = giveupBtn.parent().child(1).click();
        log("点击 首页花园: " + clickRet);
        if (clickRet == false) {
            commonAction.backToFeedTaskList(tasklist[i].Title);
            break;
        }

        ret = true;
        break;
    }

    return ret;
}

//攒动力任务
doGetOxygenTasks = function (actionBar) {
    toastLog("garden.doGetOxygenTasks");
    var getOxygenBtn = actionBar.child(actionBar.childCount() - 1);
    var clickRet = getOxygenBtn.click();
    if (!clickRet) {
        toastLog("点击 集氧气: " + clickRet);
        return;
    }

    sleep(3000);
    toastLog("点击 集氧气: " + clickRet + ", 并等待 做任务集氧气 出现");
    var taskTips = common.waitForText("text", "做任务集氧气", true, 5);
    if (taskTips == null) {
        return;
    }

    var closeBtn = taskTips.parent().parent().child(2);
    var startTick = new Date().getTime();
    for (;;) {
        var taskList = taskTips.parent().child(1);
        var totalTasks = [];
        for (var i = 0; i < taskList.childCount(); i++) {
            var taskItem = {};
            taskItem.Title = taskList.child(i).child(1).text();
            var tips = "";
            for (var j = 2; j < taskList.child(i).childCount() - 1; j++) {
                tips = tips + taskList.child(i).child(j).text();
            }
            taskItem.Tips = tips;
            taskItem.Button = taskList.child(i).child(taskList.child(i).childCount() - 1);
            taskItem.BtnName = taskItem.Button.text();
            taskItem.Timeout = 20;
            if (taskItem.Button.bounds().height() > 50) {
                totalTasks.push(taskItem);
            }
        }

        toastLog("任务数: " + Math.floor(taskList.childCount() / 4) + ", 可见: " + totalTasks.length);
        if (totalTasks.length == 0) {
            captureScreen("/sdcard/Download/" + (new Date().Format("yyyy-MM-dd HH:mm:ss")) + ".png");
            break;
        }

        var doneTaskList = [];
        var oneWalkTaskList = [];
        var guideTaskList = [];
        totalTasks.forEach(function (tv) {
            if (tv.Tips.indexOf("购买") != -1 || tv.BtnName.indexOf("已完成") != -1 || tv.BtnName.indexOf("去邀请") != -1) {
                log("跳过任务: " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            } else {
                if (tv.BtnName.indexOf("领取奖励") != -1) {
                    doneTaskList.push(tv);
                } else if (tv.Tips.indexOf("首页") != -1) {
                    guideTaskList.push(tv);
                } else {
                    oneWalkTaskList.push(tv);
                }
                if (tv.Title.indexOf("福气签到") != -1 || tv.Title.indexOf("上新了") != -1) {
                    tv.Timeout = 30;
                }
                log("未完成任务" + (doneTaskList.length + oneWalkTaskList.length + guideTaskList.length) + ": " + tv.Title + ", " + tv.BtnName + ", (" + tv.Button.bounds().centerX() + ", " + tv.Button.bounds().centerY() + "), " + tv.Tips);
            }
        });

        var uncompleteTaskNum = doneTaskList.length + oneWalkTaskList.length + guideTaskList.length;
        log("未完成任务数: " + uncompleteTaskNum);
        if (uncompleteTaskNum == 0) {
            log("关闭 集氧气任务列表: " + closeBtn.click());
            sleep(3000);

            var nowDate = new Date().Format("yyyy-MM-dd");
            common.safeSet(nowDate + ":" + signInTag, "done");
            toastLog("完成 " + signInTag);
            break;
        }

        if (doneTaskList.length != 0) {
            log("点击 " + doneTaskList[0].BtnName + ": " + doneTaskList[0].Button.click());
            sleep(2000);
            continue;
        }

        if (doOneWalkTasks(oneWalkTaskList)) {
            continue;
        }

        if (doGuideTasks(guideTaskList)) {
            break;
        }

        if (new Date().getTime() - startTick > 5 * 60 * 1000) {
            log("doGetPowerTasks timeout");
            break;
        }
    }
}

doGetBubbleOxygenAndPigeon = function () {
    toastLog("garden.doGetBubbleOxygenAndPigeon");
    var startTick = new Date().getTime();
    for (;;) {
        // var bubbleBtn = id("timing_icon").visibleToUser(true).findOne(1000);
        var bubbleOxygenPt = common.findImageInRegion(getItBubble, 0, 0, device.width, Math.floor(device.height / 4));
        var pigeonPt = common.findImageInRegion(envelope, 0, Math.floor(device.height / 4), device.width, Math.floor(device.height / 4));
    
        if (pigeonPt != null || bubbleOxygenPt != null) {
            if (pigeonPt != null) {
                toastLog("piegon click(" + pigeonPt + "): " + click(pigeonPt.x, pigeonPt.y));
                sleep(2000);
            } else if (bubbleOxygenPt != null) {
                toastLog("bubble click(" + bubbleOxygenPt + "): " + click(bubbleOxygenPt.x, bubbleOxygenPt.y));
                sleep(2000);
            }

            var getBtn = text("开心收下").findOne(1000);
            if (getBtn != null) {
                log("点击 开心收下: " + getBtn.click());
            }
            //重置时间
            startTick = new Date().getTime();
            log("重置超时时间: " + common.timestampToTime(startTick + 5 * 60 * 1000));
        }

        sleep(2000);
        if (new Date().getTime() - startTick > 5 * 60 * 1000) {
            toastLog("没有更多的氧气和鸽子可领");
            break;
        }
    }
}

garden.doSignIn = function () {
    log("garden.doSignIn");
    var nowDate = new Date().Format("yyyy-MM-dd");
    var done = common.safeGet(nowDate + ":" + signInTag);
    if (done != null) {
        log(signInTag + " 已做: " + done);
        return true;
    }

    toast("garden.doSignIn");
    var actionBar = gotoGarden();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return false;
    }

    doGetDailyBonus();

    doGetOxygenTasks(actionBar);

    doGetBubbleOxygenAndPigeon();

    commonAction.backToAppMainPage();
    return false;
}

//仅收集离线收益
garden.doRoutine = function () {
    toastLog("garden.doRoutine");
    var actionBar = gotoGarden();
    if (actionBar == null) {
        commonAction.backToAppMainPage();
        return;
    }

    doGetBubbleOxygenAndPigeon();

    commonAction.backToAppMainPage();
}

module.exports = garden;