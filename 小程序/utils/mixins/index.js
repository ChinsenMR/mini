export default {
	/* 私有方法 */
	/* 获取当前页面 */
	_currentPage() {
		const pages = getCurrentPages();
		return pages[pages.length - 1];
	},

	/* 输入值 */
	input(e, that) {
		const {
			currentTarget: {
				dataset: {
					name
				},
			},
			detail: {
				value
			},
		} = e;

		that.setData({
			[`form${name}`]: value
		});
	},

	/* 清除一个对象中所有的值 */
	clear(e) {
		const that = this._currentPage();

		let {
			currentTarget: {
				dataset: {
					form = e
				} /* 别觉得奇怪，e就是在生命周期调用，传入的值为对象 */ ,
			},
		} = e;

		form = e.currentTarget ? that.data.form : form;

		for (let item in form) {
			form[item] = null;
		}

		that.setData(form);
	},



	/* 修改小程序标题 */
	setTitle(title) {
		wx.setNavigationBarTitle({
			title
		});
	},


	/* 查看图片 */
	previewImage(current = '', urls = []) {
		/* 如果传入的是索引值 */
		if (typeof current == "number") {
			current = urls[current];
		}

		wx.previewImage({
			current,
			urls
		});
	},

	/* 修改带参数跳转，简化使用方式 */
	goPage(target = {}, callback) {
		let targetUrl, jumpType;
		if (target.hasOwnProperty('currentTarget')) {
			const {
				currentTarget: {
					dataset: {
						options,
						url,
						type,
					},
				},
			} = target;
			targetUrl = url + this.concatOptions(options);
			jumpType = type;
		} else {
			const {
				url,
				options,
				type,
			} = target;

			targetUrl = url + this.concatOptions(options);
			jumpType = type;
		}

		const params = {
			url: targetUrl,
			success: () => {
				typeof callback === 'function' && callback();
			}
		}
		if (jumpType === 'redirect') {
			wx.redirectTo(params)
		} else {
			wx.navigateTo(params)
		}

	},
	/* 返回 */
	goBack(delta = 1) {
		getCurrentPages().length > 1 ?
			wx.navigateBack({
				delta
			}) :
			wx.redirectTo({
				url: '/pages/home/home'
			})
	},

	/* 将对象拼接成参数 */
	concatOptions(options = {}) {

		let keys = Object.keys(options).length > 0 ? '?' : '';

		for (let keyItem in options) {
			keys += `${keyItem}=${options[keyItem]}&`;
		}

		return keys = keys.substring(0, keys.length - 1);
	},
	/* 获取参数 */
	getQueryVariable(url, variable) {
		const query = url;
		let vars = query.split("&");
		for (let i = 0; i < vars.length; i++) {
			let pair = vars[i].split("=");
			if (pair[0] == variable) {
				return pair[1];
			}
		}
		return (false);
	},

	getDataset(e) {
		const {
			currentTarget: {
				dataset
			}
		} = e;

		return dataset
	},

	/* 正整数过滤器 */
	intFilter(number) {
		return Number(number) === NaN ? '' : Number(number.replace(/[-.]/g, ''));
	},
	filters: {
		date(text) {
			return text.replace('T', ' ')
		}
	},
	/* 校验是否需要登录 */
	checkLoginStatus(mastLogin) {
		const app = getApp();
		if (!app.cache.loadCookie()) {
			app.alert.confirm({
				content: '您还没有登录哦'
			}, conf => {
				if (conf) {
					this.goPage({
						url: '/pages/authorizationLogin/authorizationLogin'
					})
				} else {
					mastLogin && this.goBack()
				}


			})
		}
	},



};