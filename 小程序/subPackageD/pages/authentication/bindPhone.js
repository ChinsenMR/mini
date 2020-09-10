const app = getApp();

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		form: {
			verifyCode: null,
			phone: null,
			message: '发送验证码'
		},
	},
	/* 输入值 */
	inputText(e) {
		const {
			currentTarget: {
				dataset: {
					field
				}
			},
			detail: {
				value
			}
		} = e;
	
		this.setData({
			[`form.${field}`]: String(value)
		});
	
	},
	/* 倒计时 */
	countDown() {
		let time = 60;
		let that = this;
		let timer = setInterval(() => {
			if (time == 0) {
				clearInterval(timer);
				that.setData({
					'form.message': '重新发送',
				});
				return;
			}

			time--;
			that.setData({
				'form.message': '重新获取' + time + 's',
			});
		}, 1000);
	},
	/* 发送短信 */
	sendVerifySms() {
		const {
			form: {
				phone,
				verifyCode
			}
		} = this.data;

		if (!'发送验证码, 重新发送'.includes(verifyCode)) return;

		if (phone.length !== 11) {
			return app.alert.message('手机号码格式有误')
		}

		app.$api.sendSmsByAlterMobile({
			phone
		}).then((res) => {
			if (!res.success) {
				return app.alert.message('发送失败')
			}

			app.alert.success('发送成功')

			this.countDown();
		});
	},
	/* 绑定手机 */
	bindPhone() {
		const {
			form: {
				phone,
				verifyCode,
				message
			}
		} = this.data;

		if (message === '发送验证码') {
			return app.alert.message('请先获取验证码')
		}

		if (verifyCode.length !== 6) {
			return app.alert.message('请输入正确的验证码')
		}
		if (phone.length !== 11) {
			return app.alert.message('请输入正确的手机号')
		}

		const formData = {
			phone,
			verificationCode: verifyCode,
		};

		app.$api.bindPhoneByAlterMobile(formData).then((res) => {
			if (!res.success) {
				return app.alert.success(res.Msg)
			}

			app.alert.success('绑定成功')
			app.goBack();
		});
	},

});