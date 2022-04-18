# node_sebot<br>
基于node.js的色图搜索发送QQ机器人，使用go-cqhttp作为无头QQ客户端<br>

config.json说明<br>
    "host": "127.0.0.1", 本地bot使用地址<br>
    "port": 64000,  本地bot使用端口<br>
    "local_proxy": "http://127.0.0.1:10809", 色图下载代理，HTTP。留空不使用代理<br>
    "pixiv_proxy": "null",色图使用反代 留空使用i.pixiv.cat，null使用i.pximg.net<br>
    "R18": 2, R18选项 0不搜索R18，1搜索R18，2我全都要<br>
    "NormalPath": "",非R18图片保存完整路径，留空使用./Setu/Normal<br>
    "R18Path": "",R18图片保存完整路径，留空使用./Setu/R18<br>
    "Size": "original", 图片大小 original / regular<br>
    "Save_image": true,是否保存图片到本地<br>
    "SetuCD": 120, 色图调用CD<br>
    "admin":[<br>
        {"admin_id": 123456},<br>
        {"admin_id": 123456}<br>
    ] 管理员账号，目前功能是取消色图调用CD<br>
