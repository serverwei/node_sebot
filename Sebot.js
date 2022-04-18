const request = require("request");
const fs = require("fs");
const ws = require("ws");

const config = JSON.parse((fs.readFileSync('config.json')).toString());

let golbal_wss;
let CD_List = [];
const Setu_CD = config.SetuCD;//second

const wss = new ws.Server({
    host: config.host,
    port: config.port
}, () => {
    console.log("等待连接: " + config.host + ":" + config.port)
});

wss.on("connection", (ws) => {
    console.log("反代已连接");
    golbal_wss = ws;

    ws.on("message", (data) => {
        if (JSON.parse(data.toString()).meta_event_type == "heartbeat") {
            return;
        }
        console.log(JSON.parse(data.toString()));
        MessageHandle(JSON.parse(data.toString()));
    })

    ws.on("close", () => {
        console.log("反代已断开");
    })
})

function SendGroupMsg(message, group_id) {
    const MesData = {
        "action": "send_msg",
        "params": {
            message_type: "group",
            group_id: group_id,
            message: message
        }
    }
    golbal_wss.send(JSON.stringify(MesData));
}

if (config.NormalPath != "") {
    CheckPath("./Setu/Normal");
} else {
    CheckPath(config.NormalPath);
}
if (config.R18Path != "") {
    CheckPath("./Setu/R18");
} else {
    CheckPath(config.R18Path);
}

function lolicon(r18, num, uid, keyword, tag, size, proxy, dataAfter, dataBefore, dsc, group_id) {
    if (config.pixiv_proxy == "" && proxy == "") {
        proxy = "i.pixiv.cat";
    } else {
        if (config.pixiv_proxy != "") {
            proxy = config.pixiv_proxy;
        }
    }

    const lolicon_api = "https://api.lolicon.app/setu/v2";
    let request_url = lolicon_api + "?r18=" + r18 + "&num=" +
        num + "&uid=" + uid + "&keyword=" + keyword + "&size=" +
        size + "&proxy=" + proxy + "&dataAfter=" + dataAfter +
        "&dataBefore=" + dataBefore + "&dsc=" + dsc;
    if(tag != "" || tag != " "){
        request_url += "&tag=" + tag;
    }
    request_url = encodeURI(request_url);
    //console.log(request_url);

    const params = {
        timeout: 5000,
        url: request_url
    };

    request.get(params, (err, res, body) => {
        if (err) {
            //console.log("色图API获取失败");
            return;
        }

        if (JSON.parse(body).data[0] == undefined) {
            //console.log("搜不到你想要的色图呢变态！");
            SendGroupMsg("搜不到你想要的色图呢变态！", group_id)
            return;
        }
        //console.log(res);

        console.log(JSON.parse(body).data[0]);
        let lolicon_data = JSON.parse(body).data[0];
        GetIMG(lolicon_data, group_id);
    })
}

function GetIMG(lolicon_data, group_id) {
    let local_proxy;
    if (config.local_proxy == "") {
        local_proxy = false;
    } else {
        local_proxy = config.local_proxy;
    }

    let referer;
    if (config.pixiv_proxy == "null") {
        referer = "http://pixiv.net";
    } else {
        referer = "";
    }

    const proxy_config = {
        timeout: 5000,
        url: lolicon_data.urls[config.Size],
        proxy: local_proxy,
        headers: {
            referer: referer,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3100.0 Safari/537.36",
            "Accept-Encoding": "gzip" // 使用gzip压缩让数据传输更快
        },
        encoding: null,  // 方便解压缩返回的数据
    };
    const req = request.get(proxy_config, (err, res, body) => {
        if (err) {
            //console.log("色图下载失败！");
            SendGroupMsg("色图下载失败！", group_id);
            return;
        }

        //console.log(body.toString());
        if (body.toString().includes("405 Not Allowed")) {
            //console.log("405 Not Allowed 色图下载失败！");
            return;
        }

        if (lolicon_data.r18) {
            if (config.R18Path == "") {
                path_head = __dirname + "\\Setu\\R18\\";
            } else {
                path_head = config.R18Path;
            }
        } else {
            if (config.NormalPath == "") {
                path_head = __dirname + "\\Setu\\Normal\\";
            } else {
                path_head = config.NormalPath;
            }
        }

        const img_base64 = body.toString('base64');//转base64
        const message = lolicon_data.title + " pid: " + lolicon_data.pid + "[CQ:image,file=base64://" + img_base64 + "]";
        SendGroupMsg(message, group_id);

        if (config.Save_image) {
            fs.writeFile(path_head + lolicon_data.pid + "_" + lolicon_data.title + "." + lolicon_data.ext, body, "binary", (err) => {
                if (err) {
                    //console.log("色图保存失败！");
                }

                console.log("色图保存至： " + path_head + "pid_" + lolicon_data.pid + "_uid_" + lolicon_data.uid + "." + lolicon_data.ext);
            })
        }
    });

    //let size = 0;
    //let downsize = 0;
    // req.on('response', (data)=>{
    //     size = Number(data.headers['content-length']);
    // });

    // req.on('data', (data)=>{
    //     downsize += data.toString().length;
    //     console.log("正在下载: " + parseInt(downsize / size * 100) + "%");
    //     readline.moveCursor(process.stdout, -10, -1);
    // });
    // req.on('end', () => {
    //     console.log("正在下载: 100%");
    //     console.log("色图下载完毕！");
    // })
}

function MessageHandle(data) {
    if(data.message == undefined){
        return;
    }

    if (data.message_type == "private") {
        //私聊消息
        return;
    }

    if (data.message == "色图") {
        if (!SetuCD(data)) {
            return;
        }

        SendGroupMsg("正在搜索...", data.group_id);
        lolicon(0, 1, "", "", "", config.Size, "", "", "", false, data.group_id);
    } else if (data.message.slice(0, 3) == "色图 " && data.message.length > 3) {
        if (!SetuCD(data)) {
            return;
        }

        SendGroupMsg("正在搜索...", data.group_id);
        let tmp = data.message.slice(3, data.message.length);
        let SpaceFind = false;
        let tag = "";
        if(tmp.includes(" ")){
            for(let i=0;i<tmp.length;i++){
                if(tmp[i] != " " && !SpaceFind){
                    tag +=tmp[i];
                    SpaceFind == true;
                    continue;
                }
                if(tmp[i] == " " && SpaceFind){
                    break;
                }
                tag +=tmp[i];
            }
        }else{
            tag = tmp;
        }
        lolicon(0, 1, "", "", tag, config.Size, "", "", "", false, data.group_id);
    }
}

function SetuCD(data) {//色图调用CD
    for(let i = 0;i<config.admin.length;i++){
        if (data.user_id == config.admin[i].admin_id) {
            break;
        }else {
            let find_id = false;
            for (let i = 0; i < CD_List.length; i++) {
                if (CD_List[i].user_id == data.user_id) {
                    find_id = true;
                    if (data.time - CD_List[i].time <= Setu_CD) {
                        let message = "CD中, 还剩" + (Setu_CD - (data.time - CD_List[i].time)) + "秒!";
                        SendGroupMsg(message, data.group_id)
                        return false;
                    } else {
                        CD_List[i].time = data.time;
                        break;
                    }
                }
            }
    
            if (!find_id) {
                CD_List.push({
                    user_id: data.user_id,
                    time: data.time
                })
            }
        }
    }  
    return true;
}

function CheckPath(path) {//检查文件夹路径存在
    try {
        fs.accessSync(path, constants.R_OK | constants.W_OK);
        console.log("exist");
    } catch (err) {
        try {
            fs.mkdirSync(path, { recursive: true });
            //console.log("保存路径文件夹创建成功");
        } catch (err) {
            //console.log("保存路径文件夹创建失败");
        }
    }
}

