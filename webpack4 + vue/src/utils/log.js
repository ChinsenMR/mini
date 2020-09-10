/* 日志类 */
export default {
    debug : function(){
        if(window.config.environment == 'debug'){
            for (var i = 0 ; i < arguments.length; i++){      // 获取参数内容。
                console.log(arguments[i]);
            }
        }
    },
    warning : function(){
        if(window.config.environment == 'debug'){
            for (var i = 0 ; i < arguments.length; i++){      // 获取参数内容。
                console.warn(arguments[i]);
            }
        }
    },
    error : function(){
        if(window.config.environment == 'debug'){
            for (var i = 0 ; i < arguments.length; i++){      // 获取参数内容。
                console.error(arguments[i]);
            }
        }
    }
}