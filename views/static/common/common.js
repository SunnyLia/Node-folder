const moment = require("moment");
const fs = require("fs");
const path = require("path");

exports.readdir = function (req, res) {

    var path1 = decodeURI(req.path);
    if (path1 == "/favicon.ico") { return }
    fs.readdir("./views/static" + path1, function (err, files) {
        const allFold = [];
        if (err) {
            res.render("error")
            return
        }
        files.forEach(function (file) {
            let stats = fs.statSync("./views/static" + path1 + file);
            allFold.push({
                isFold: stats.isDirectory(),
                foldName: file,
                type: path.extname(file).substr(1).toUpperCase(),
                dir: path1 + file,
                date: dateFormat(stats.atime),
                size: (stats.size / 1024).toFixed(2)
            })
        })
        // res.send({ data: allFold })
        res.render("index", { foldLists: allFold, breadcrumbs: path1.split("/") })
    })
}
exports.deldir = function (req, res) {
    //文件夹 ==> /images/GIF表情 - 副本/
    //文件 ==> /static/images/404 - 副本.jpg

    let path = unescape(req.query.path);

    try {
        delfile("./views" + path, res);
        res.send({ code: 1 })
    } catch (e) {
        console.error(e);
        res.send({ code: "哎呀，删除时报错啦" })
    }
}
exports.rename = function (req, res) {
    let oldPath = unescape(req.query.oldPath);
    let newPath = unescape(req.query.newPath);

    try {
        fs.renameSync("./views" + oldPath, "./views" + newPath);
        res.send({ code: 1 })
    } catch (e) {
        console.error(e);
        res.send({ code: "哎呀，重命名时报错啦" })
    }
}
exports.paste = function (req, res) {
    let copyPath = unescape(req.query.copyPath);//被复制的文件路径   /static/images/你好.jpg
    let pasteDir = unescape(req.query.pasteDir);//粘贴的文件夹位置  /images/GIF表情包/
    let name = path.basename("./views" + copyPath);

    try {
        let isDir = fs.statSync("./views" + copyPath).isDirectory(); //判断被复制的是文件夹还是文件
        // 如果粘贴的路径里有和被复制的同名，则粘贴的文件后加"-副本";
        let files = fs.readdirSync("./views/static" + pasteDir);
        files.forEach(function (file) {
            if (file == name) {
                if (isDir) {
                    name = name + '-副本';
                } else {
                    let dot = path.extname("./views" + copyPath);
                    name = name.split(dot)[0] + "-副本" + dot;
                }
            }
        })

        pasteFile("./views" + copyPath, "./views/static" + pasteDir + name);
        res.send({ code: 1 })
    } catch (e) {
        console.error(e);
        res.send({ code: "哎呀，粘贴时报错啦" })
    }
}
exports.clip = function (req, res) {
    let clipPath = unescape(req.query.clipPath);//被剪切的文件路径  
    let pasteDir = unescape(req.query.pasteDir);//粘贴的文件夹位置 
    let name = path.basename("./views" + clipPath);
    try {
        fs.renameSync("./views" + clipPath, "./views/static" + pasteDir + name);
        res.send({ code: 1 })
    } catch (e) {
        console.error(e);
        res.send({ code: "哎呀，粘贴时报错啦" })
    }
}
exports.addFold = function (req, res) {
    let pasteDir = unescape(req.query.pasteDir);//粘贴的文件夹位置 
    try {
        if (req.query.code == 1) {
            fs.mkdirSync("./views/static" + pasteDir + "新建文件夹")
        } else {
            fs.writeFileSync("./views/static" + pasteDir +"新建文本文档.txt")
        }
        res.send({ code: 1 })
    } catch (e) {
        console.error(e);
        res.send({ code: "哎呀，新建时报错啦" })
    }
}
const pasteFile = function (old, now) {
    // 先判断复制的是文件还是文件夹
    if (fs.statSync(old).isDirectory()) {
        let files = fs.readdirSync(old);
        //如果是文件夹,那就需要先创建个空的now文件夹
        fs.mkdirSync(now)
        // 然后遍历old里面所有的文件
        files.forEach(function (file) {
            // 递归判断然后再将文件添加到now里面
            pasteFile(old + "/" + file, now + "/" + file);
        })
    } else {
        // 如果是文件直接写入
        fs.writeFileSync(now, fs.readFileSync(old))
    }
}
const delfile = function (path) {
    // 先判断此文件是文件夹还是文件
    var stat = fs.statSync(path);
    if (stat.isDirectory()) { // 是文件夹
        // 先获取到文件夹里所有的文件
        var files = fs.readdirSync(path)
        // 遍历文件再递归删除
        files.forEach(function (file) {
            delfile(path + "/" + file)
        })
        //最后删除这个空文件夹
        fs.rmdirSync(path);
    } else {//是文件
        // 直接删除该文件
        fs.unlinkSync(path)
    }
}
const dateFormat = function (date) {
    return moment(date).format('YYYY/MM/DD hh:mm');
}
