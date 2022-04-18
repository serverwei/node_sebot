# node_sebot<br>
基于node.js的色图搜索发送QQ机器人，使用go-cqhttp作为无头QQ客户端<br>

config.json说明<br>
    "host": "127.0.0.1", 本地bot使用地址
    "port": 64000,  本地bot使用端口
    "local_proxy": "http://127.0.0.1:10809", 色图下载代理，HTTP
    "pixiv_proxy": "null",色图使用反代 留空使用i.pixiv.cat，null使用i.pximg.net
    "R18": 2, R18选项 0不搜索R18，1搜索R18，2我全都要
    "NormalPath": "",非R18图片保存完整路径，留空使用./Setu/Normal
    "R18Path": "",R18图片保存完整路径，留空使用./Setu/R18
    "Size": "original", 图片大小 original / regular
    "Save_image": true,是否保存图片到本地
    "SetuCD": 120, 色图调用CD
    "admin":[
        {"admin_id": 123456},
        {"admin_id": 123456}
    ] 管理员账号，目前功能是取消色图调用CD
