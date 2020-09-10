/* 验证类 */
export default {

    /* 验证 */
    /**
     * eg:
     *    Verify.run([
     *    {
     *        type : 'email',
     *        value : this.email,
     *        name : '邮箱',
     *        error_msg : '邮箱验证错误',
     *        canEmpty : false
     *    },
     *    {
     *        type : 'notEmpty',
     *        value : this.email,
     *        name : '密码',
     *        errorMsg : '',
     *        canEmpty : false
     *    }
     *    {
     *        type : 'reg',
     *        value : this.email,
     *        name : '密码',
     *        errorMsg : '',
     *        canEmpty : false,
     *        reg : '/^(0)?1([3|4|5|7|8])+([0-9]){9,10}$/'
     *    }
     *    ]);
     *
     *    if(verfiry !== true){
     *       window.tools.alert.info(verfiry.msg);
     *       return ;
     *   }
     *
     * */
    run: function (obj) {
        for (var i = 0; i < obj.length; i++) {
            var is_empty = true;

            if ((obj[i].canEmpty === false && window.tools.isEmpty(obj[i].value)) || tools.trim(obj[i].value) === '' ) {
                return {
                    result: false,
                    msg: obj[i]['name'] + '不能为空'
                }
            }
            else {
                is_empty = false;
            }

            if (is_empty === false && obj[i]['type'] !== 'notEmpty') {

                /*if (obj[i]['type'] === 'notEmpty') {
                    return true;
                }*/

                var result = false;

                if (obj[i]['type'] === 'reg') {
                    result = this.test['reg'](obj[i].value, obj[i]['reg']);
                }
                else {
                    result = this.test[obj[i]['type']](obj[i].value)
                }

                if (result === false) {
                    return {
                        result: false,
                        msg: obj[i]['errorMsg']
                    }
                }
            }
        }
        return true;
    },

    /* 验证 */
    test: {

        /* 自定义正则验证 */
        reg: function (data, reg) {
            return eval(reg).test(data);
        },

        /* 手机号码 */
        mobile: function (data) {
            var reg = /^1(3[0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|8[0-9]|9[89])\d{8}$/;
            return reg.test(data);
        },

        /* 邮件 */
        email: function (data) {
            var reg = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/i;
            return reg.test(data);
        },

        /* 身份证 */
        idCart: function (data) {
            var reg = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/;
            return reg.test(data);
        },

        /* 正整数 */
        positiveInteger:function(data){
            var reg = /^\+?[0-9][0-9]*$/;
            return reg.test(data);
        }
    }
}
