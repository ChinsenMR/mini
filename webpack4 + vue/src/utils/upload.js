import plupload from '@static/plupload/plupload.dev.js';
import SparkMD5 from 'spark-md5';
import sha1 from 'js-sha1';

let __num = 0;
let __files = [];

/**
 * 对象扩展
 * @param target
 * @param source
 * @returns {object}
 */
function extend(target,source){
    for(let p in source){
        if(source.hasOwnProperty(p)){
            target[p] = source[p];
        }
    }
    return target;
};

/**
 * 克隆
 * @param obj
 * @returns {object}
 */
function clone(obj) {
    let o;
    switch(typeof obj){
        case 'undefined':
            break;
        case 'string'   : o = obj + '';
            break;
        case 'number'   : o = obj - 0;
            break;
        case 'boolean'  : o = obj;
            break;
        case 'object'   :
            if(obj === null){
                o = null;
            }else{
                if(obj instanceof Array){
                    o = [];
                    for(let i = 0, len = obj.length; i < len; i++){
                        o.push(clone(obj[i]));
                    }
                }else{
                    o = {};
                    for(let k in obj){
                        o[k] = clone(obj[k]);
                    }
                }
            }
            break;
        default:
            o = obj;
            break;
    }
    return o;
}

/**
 * 构造函数
 * @param params
 * @constructor
 */
let uploaders = function(params) {
    let defaults = clone(this.data);
    this.data = extend(defaults,params);
    this.init(params);
};
uploaders.prototype = {
    data: {
        uploader: {},
        total_part: 0,
        part_now: 0,
        params: {},
        complete_url: '',
        callback: function(obj){}  //回调函数，返回当前图片数据
    },
    /* 初始化 */
    init: function (params) {
        let that = this;

        let mime_types = [];

        if(params.group){

            for(let i = 0; i < params.group.length; i++){
                if(params.group[i] === 'img'){
                    mime_types.push({
                        title: "Image files",
                        extensions: "jpg,gif,png,jpeg"
                    })
                }
                if(params.group[i] === 'zip'){
                    mime_types.push({
                        title: "Zip files",
                        extensions: "zip,rar,lzh,gzip"
                    })
                }
            }
        }

        if(params.custom){
            mime_types.push({
                title: "Custom files",
                extensions : params.custom
            })
        }

        let type = params.type || '';
        let url = params.url || '';
        let container = params.container || 'container';
        let browse_button = params.browse_button || 'pickfiles';
        let progress = params.progress || undefined;
        let setting = params.setting || 'loacl';
        let max_file_size = params.max_file_size || '10mb';
        let chunk_size = params.chunk_size || '204800';
        let multi_selection = params.multi_selection || false;
        let offset = params.offset || 0;  
        let uploadType = params.uploadType || undefined;

        let uploader = new plupload.Uploader({
            runtimes: 'html5,flash,silverlight,html4',
            browse_button: browse_button, // you can pass in id...
            container: document.getElementById(container), // ... or DOM Element itself
            url: window.config.api.url + url,
            multi_selection: multi_selection,
            // flash_swf_url: '../static/plupload/Moxie.swf',
            // silverlight_xap_url: '../static/plupload/Moxie.xap',
            offset: offset,
            chunk_size: chunk_size,
            filters: {
                mime_types: mime_types,
                max_file_size: max_file_size,
                /*[
                    {title : "Image files", extensions : "jpg,gif,png,jpeg"},
                    {title : "Zip files", extensions : "zip"}
                ]*/
            },
            init: {
                PostInit: function (up) {
                    //document.getElementById(progress).innerHTML = '';

                    /*document.getElementById('uploadfiles').onclick = function () {
                        uploader.start();
                        return false;
                    };*/
                    if(params.PostInit){
                        params.PostInit(up);
                    }

                },
                FilesAdded: function (up, files) {

                    plupload.each(files, function (file) {
                        /*document.getElementById('filelist').innerHTML += '<div id="' + file.id + '"><b></b></div>';*/
                    });
                    
                    if(params.FilesAdded){
                        let is_true = params.FilesAdded(up, files);
                        
                        if (is_true === false) {
                            return;
                        }
                    }

                    uploader.stop();
                
                    if(window.config.uploadType === 1 || uploadType === 1){  
                        that.algorithm(up, files[0], function(obj){
                            __num = 0;
                            __num ++;
                            __files = files;
                            that.getUploadIdAndSign(files[0], setting, type, function () {
                                up.start();
                            },params, obj);
                        },params);
                    }else{
                        __num = 0;
                        __num ++;
                        __files = files;
                        that.getUploadIdAndSign(files[0], setting, type, function () {
                            up.start();
                        },params);
                    }

                },
                UploadProgress: function (up, file) {
                    if(params.UploadProgress){
                        params.UploadProgress(up, file, 1);
                    }else {
                        if(progress != undefined){
                            document.getElementById(progress).innerHTML = file.percent+'%';
                            document.getElementById(progress).style.width = file.percent+'%';
                        }
                    }
                    /*document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";*/
                },
                Error: function (up, err) {
                    if(err.code == '-601'){
                        tools.alert.error(config.language === 'English' ? "Sorry, we don't support this type of file." : '该文件格式不支持!');
                    }else if(err.code == '-600') {
                        tools.alert.error(config.language === 'English' ? "Sorry, the file is too large!" : '文件过大!');
                    }else if(err.code == '-700'){
                        tools.alert.error(config.language === 'English' ? "Sorry, we don't support this type of image file." : '该图片格式不支持!');
                    }else{
                        tools.alert.error(config.language === 'English' ? "Upload fail, please try again." : '文件上传失败!');
                    }
                    //document.getElementById('console').innerHTML += "\nError #" + err.code + ": " + err.message;

                    if(params.Error){
                        params.Error(up, err);
                    }else {
                        if(progress != undefined){
                            document.getElementById(progress).innerHTML = '';
                            document.getElementById(progress).style.width = '';
                        }
                    }

                },
                //小片上传完成后
                ChunkUploaded: function (uploader, file, responseObject) {

                    if(params.ChunkUploaded){
                        params.ChunkUploaded(uploader, file, responseObject);
                    }else {
                        if(progress != undefined){
                            document.getElementById(progress).innerHTML = '';
                            document.getElementById(progress).style.width = '';
                        }
                    }

                    if(responseObject.status != 200){
                        uploader.stop();
                        tools.alert.error(config.language === 'English' ? "Upload fail, please try again." : '文件上传失败!');
                        return;
                    }
                    
                    if (that.data.total_part > that.data.part_now) {
                        that.setParams(parseInt(that.data.part_now) + 1);
                    }else if(that.data.total_part === that.data.part_now) {
                        uploader.stop()
                        that.data.uploader.removeFile(file); //删除当前文件的上传队列
                    }
                },
                //上传完成
                FileUploaded: function(uploader,file,responseObjec){
                    
                    if(multi_selection){
                        uploader.stop();
                    }

                    if(params.FileUploaded){
                        params.FileUploaded(uploader,file,responseObjec);
                    }else {
                        if(progress != undefined){
                            document.getElementById(progress).innerHTML = '';
                            document.getElementById(progress).style.width = '';
                        }
                    }
                    
                    if(responseObjec.status != 200){
                        tools.alert.error(config.language === 'English' ? "Upload fail, please try again." : '文件上传失败!');
                        return;
                    }
                    
                    if(window.config.uploadType === 1 || uploadType === 1){
                        that.setComplete(that.data.upload_id,params,uploader,multi_selection,function(){
                            that.algorithm(uploader, __files[__num], function(obj){
                                that.getUploadIdAndSign(__files[__num], setting, type, function () {
                                    __num ++;
                                    uploader.start();
                                },params,obj);
                            },params);
                        });
                    }else{
                        that.setComplete(that.data.upload_id,params,uploader,multi_selection,function(){
                            that.getUploadIdAndSign(__files[__num], setting, type, function () {
                                __num ++;
                                uploader.start();
                            },params);
                        });
                    }
                    
                }
            }
        });

        uploader.init();
        that.data.uploader = uploader;
    },


    /* 获取上传id和签名 */
    getUploadIdAndSign: function (file, setting, type, start, params, obj) {
        let that = this, ajaxData = this.data.params.ajaxData || {};
        let is_rar = file["name"].substr(file["name"].lastIndexOf('.'),file["name"].length);

        if(file['type'] == ""){
            file['type'] = "octet-stream";
        }

        // if(file['type'] == "" && (is_rar == ".rar"||is_rar == ".RAR")){
        //     file['type'] = "octet-stream";
        // }

        let part_size = that.data.uploader.getOption('chunk_size');
        let progress = params.progress || undefined;

        if(part_size == 0){
            part_size = file.size;
        }

        ajaxData.total_size = file['size'];
        ajaxData.part_size = part_size;
        ajaxData.file_type = file['type'];
        ajaxData.filename = file['name'];
        ajaxData.upload_setting = setting;
        ajaxData.upload_type = type;

        if(obj){
            ajaxData.md5 = obj.md5;
            ajaxData.sha1 = obj.sha1;
        }
        
        //获取上传id
        tools.ajax({
            url: params.url,
            ajaxData: ajaxData,
            successFun: function (res) {
                let upload_id = res.data.upload_id;
                that.data.upload_id = upload_id;
                that.data.file_type = ajaxData.file_type;
                // that.data.total_part = res.data.part_num;
                that.data.cloud_type = res.data.cloud_type;
                that.data.total_part = res.list.length;
                that.data.complete_url = res.data.complete_url;
                that.data.sign = res.list;


                //设置参数
                if(res.data.is_upload_end === 0){
                    that.data.uploader.offset = 0;
                    that.setParams(1);
                }
                else if(res.data.is_upload_end === 1){
                    let obj = {};
                    obj.upload_id = upload_id;
                    obj.url = res.data.url;
                    obj.origin_filename = res.data.origin_filename;
                    typeof that.data.callback === "function" && that.data.callback({data:obj});  //返回当前数据
                    that.data.uploader.removeFile(file); //删除当前文件的上传队列
                    return;
                }
                else if(res.data.is_upload_end === 2){
                    if(res.data.part_now === res.data.part_num){
                        that.setComplete(upload_id,params,that.data.uploader,that.data.uploader,that.data.uploader.multi_selection,start);
                        return;
                    }else{
                        that.data.uploader.offset = res.data.part_now * res.data.part_size;
                        that.setParams(1);
                        // that.setParams(parseInt(res.data.part_now)+1);
                    }
                }else{
                    that.setParams(1);
                }

                //分块
                if (res.data.part_num > 1) {
                    that.data.uploader.setOption('chunk_size',res.data.part_size);
                }
                else{
                    that.data.uploader.setOption('chunk_size','0KB');
                }
                
                start();
            },
            errorFun: function (error_data, status, headers, error_obj) {
                if(params.getUploadIdAndSign){
                    params.getUploadIdAndSign();
                }else {
                    if(progress != undefined){
                        document.getElementById(progress).innerHTML = '';
                        document.getElementById(progress).style.width = '';
                    }
                }
                that.data.uploader.removeFile(file);
                tools.alert.error(error_data.error_msg);
            },
            type: 'POST'
        });
    },

    /* md5 和 sha1 算法 */
    algorithm(up, files, next, params){
        let obj = {};
        let that = this;
        let progress = params.progress || undefined;
        let is_init = true;

        let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
            file = files.getNative(),
            chunkSize = 2097152, // read in chunks of 2MB 2097152
            spark = new SparkMD5.ArrayBuffer(),
            chunks = Math.ceil(file.size / chunkSize),
            currentChunk = 0,
            total = parseInt(file.size / chunkSize) + 1,
            result,
            fileReader = new FileReader();
            fileReader.onload = function(e){
        
                spark.append(e.target.result);
                
                result = sha1(e.target.result,result);

                currentChunk++;

                let percent = GetPercent(currentChunk,total);

                if(params.UploadProgress){
                    files.percent = parseInt(percent);
                    params.UploadProgress(up, files, 0);
                }else {
                    if(progress != undefined){
                        document.getElementById(progress).innerHTML = '读取文件中：'+percent+'%';
                        document.getElementById(progress).style.width = '100%';
                    }
                }

                if (currentChunk < chunks){

                    if(document.getElementById(that.data.container)){
                        loadNext(); 
                    }
                    
                }else{

                    if(progress != undefined){
                        document.getElementById(progress).innerHTML = '';
                        document.getElementById(progress).style.width = '';
                    }

                    obj = {
                        'sha1': result,
                        'md5': spark.end()
                    };

                    next(obj);

                }
                
            },
            fileReader.onerror = function () {
                console.log('error:','\糟糕，好像哪里错了');
                next(null);
            };

        function loadNext() {
            let start = currentChunk * chunkSize,
                end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file,start,end));
        };

        loadNext();

        // 计算两个整数的百分比值 
        function GetPercent(num, total) { 
            num = parseFloat(num); 
            total = parseFloat(total); 
            if (isNaN(num) || isNaN(total)) { 
                return "-"; 
            } 
            return total <= 0 ? "0" : (Math.round(num / total * 10000) / 100); 
        } 

        function destroy () {
            chunkSize = total = null; // purge these exclusively
        }
    },  

    /* 设置参数 */
    setParams: function (part_now) {
        let that = this;
        let data = that.data.sign[parseInt(part_now) - 1];
        let params = {};
        let headers = {}
        let url = data.host+'?token=' + tools.cache.get('Authorization');
        
        let type
        if (data.type == 'cloud') {

            if (that.data.cloud_type === 'AWS-s3') {
                params = {
                    key: data.dir + data.filename,
                    'Content-Type': that.data.file_type,
                    policy: data.policy,
                    success_action_status: '200', //让服务端返回200,不然，默认会返回204
                    callback: data.callback,
                    signature: data.signature,
                    signature: data.signature,
                    'x-amz-Signature': data['x-amz-Signature'],
                    'x-amz-algorithm': data['x-amz-algorithm'],
                    'x-amz-credential': data['x-amz-credential'],
                    'x-amz-date': data['x-amz-date'],
                    acl: 'public-read',
                    // success_action_redirect: false
                };

                if (data.fixed_download_filename) {
                    headers = {
                        'Content-Disposition': `attachment;filename=${encodeURI(data.fixed_download_filename)}`
                    }
                    params['Content-Disposition'] = `attachment;filename=${data.fixed_download_filename}`;
                }
            }
            else if (that.data.cloud_type === 'qcould') {
                params = {
                    key: data.dir + data.filename,
                    'Content-Type': that.data.file_type,
                    policy: data.policy,
                    success_action_status: '200', //让服务端返回200,不然，默认会返回204
                    callback: data.callback,
                    signature: data.signature
                };

                if (data.fixed_download_filename) {
                    headers = {
                        'Content-Disposition': `attachment;filename=${encodeURI(data.fixed_download_filename)}`
                    }
                    params['Content-Disposition'] = `attachment;filename=${data.fixed_download_filename}`;
                }
            }
            else {
                if (data.fixed_download_filename) {
                    headers = {
                        'Content-Disposition': `attachment;filename=${encodeURI(data.fixed_download_filename)}`
                    }
                }
                params = {
                    key: data.dir + data.filename,
                    policy: data.policy,
                    OSSAccessKeyId: data.accessid,
                    success_action_status: '200', //让服务端返回200,不然，默认会返回204
                    callback: data.callback,
                    signature: data.signature
                };

            }

            url = data.host;
        }
        else if (data.type == 'local') {
            params = {
                upload_id: data.upload_id,
                part_now: data.part_now
            };
        }
        
        that.data.uploader.setOption({
            url: url,
            headers: headers,
            multipart_params: params,
            type: type
        });

        that.data.part_now = part_now;

    },

    /* 调取完成 */
    setComplete: function (upload_id,params,uploader,multi_selection,start) {
        let that = this;
        let url = that.data.complete_url + upload_id;
        let progress = params.progress || undefined;

        tools.ajax({
            url: url,
            ajaxData: {},
            successFun: function (res) {
                if(params.setComplete){
                    params.setComplete();
                }else {
                    if(progress != undefined){
                        document.getElementById(progress).innerHTML = '';
                        document.getElementById(progress).style.width = '';
                    }
                }
                typeof that.data.callback === "function" && that.data.callback(res);  //返回当前数据

                if(__files.length > 1 && multi_selection){
                    if(__num === __files.length){
                        return;
                    }
                    start();
                }
            },
            errorFun: function (error_data, status, headers, error_obj) {
                if(params.setComplete){
                    params.setComplete();
                }else {
                    if(progress != undefined){
                        document.getElementById(progress).innerHTML = '';
                        document.getElementById(progress).style.width = '';
                    }
                }
                uploader.splice(0, __files.length);
                tools.alert.error(error_data.error_msg);
            },
            type: 'PUT'
        });
    }

};

export default function(params){
    return new uploaders(params);
};
