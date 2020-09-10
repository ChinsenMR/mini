export default {
    /* 拿 / 存 / 删 */
    async get(key) {
        const result = new Promise(next => {
            wx.getStorage({
                key,
                success: res => {
                    next(res.data)
                }
            });
        })
        return result
    },
    async set(key, data) {
        const result = new Promise(next => {
            wx.setStorage({
                key,
                data,
                success: res => {
                    next(res)
                }
            });
        })
        return result
    },
    async remove(key) {
        const result = new Promise(next => {
            wx.removeStorage({
                key,
                success: res => {
                    next(res)
                }
            });
        })
        return result
    },
    /* cookie操作 */
    loadCookie() {
        return wx.getStorageSync('cookie')
    },
    setCookie(cookie) {
        wx.setStorageSync('cookie', cookie) || ''
    },
    removeCookie() {
        wx.setStorageSync('cookie', cookie) || ''
    },
    loadUserInfo() {
        return wx.getStorageSync('userInfo') || ''
    },
    loadUserId() {
        return wx.getStorageSync('userid') || ''
    }
}