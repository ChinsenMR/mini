// packageA/pages/MyCollection/MyCollection.js

import {
	orderDetail,
	handleCollect
} from '../../../utils/requestApi';

const app = getApp();

Page(app.$page({
	/**
	 * 页面的初始数据
	 */
	data: {},
	state: {
		order: ['afterSaleList', 'checked']
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {

		this.setData({
			orderId: options.orderId,
		})
		
		app.$store.order.update({
			checked: false
		})

		this.getOrderDetail();
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	methods: {
		/* 获取订单详情 */
		getOrderDetail() {
			app.$api.getOrderDetail({
				orderId: this.data.orderId
			}).then((res) => {
				const {
					Data: {
						Suppliers
					}
				} = res;

				const list = Suppliers[0].LineItems;

				list.forEach((item) => {
					item.Image = app.tools.setImage(item.Image)
					item.checked = false;
				});

				app.$store.order.update({
					afterSaleList: list,
				})

			});
		},
		/* 全选 */
		onChange(event) {
			const {
				detail
			} = event;

			const {
				afterSaleList
			} = this.data;

			afterSaleList.forEach((item) => {
				item.checked = event.detail;
			});


			app.$store.order.update({
				afterSaleList,
				checked: detail
			})

		},
		/* 单独选中 */
		checkItem(e) {
			const {
				afterSaleList
			} = this.data;

			const {
				detail,
				currentTarget: {
					dataset: {
						index
					},
				},
			} = e;

			afterSaleList[index].checked = detail;



			// this.setData({
			// 	[`afterSaleList[${index}].checked`]: detail
			// });

			const hasCheked = afterSaleList.find((item) => !item.checked);
			app.$store.order.update({
				afterSaleList,
				checked: !Boolean(hasCheked)
			})
		},
		/* 去售后页面 */
		navigoToAfterSale() {
			const {
				afterSaleList,
				orderId
			} = this.data;

			const skuId = afterSaleList.map(v => v.checked && v.Id).join('_');

			if (skuId === 'false') {
				return app.alert.message('请选择要售后的商品')
			}

			app.goPage({
				url: '/subPackageC/applyAfterSale/applyAfterSale',
				options: {
					orderId,
					skuId,
					type: 1
				}
			})

		},
		/* 点击删除 */
		removeItems() {
			const {
				afterSaleList
			} = this.data;

			const checkList = afterSaleList.filter((item) => item.checked);

			const result = checkList.map((item) => item.ProductId);

			const resList = [];

			const asyncFn = async () => {
				return new Promise((resolve, rejcet) => {
					result.forEach((ProductId) => {
						handleCollect({
							ProductId
						}).then((res) => {
							resList.push(res.data);

							resolve(resList);
						});
					});
				});
			};

			asyncFn().then((res) => {
				wx.showToast({
					title: '操作成功'
				});

				this.setData({
					checked: false,
					edit: false,
				});

				this.getOrderDetail();
			});
		},
		// 跳转详情
		seeDetail(e) {
			if (this.data.edit) return;

			wx.navigateTo({
				url: `/pages/goodsDetail/goodsDetail?prDid=${e.currentTarget.dataset.productid}`,
			});

			wx.setStorageSync('buyType', 'fightgroup');
		},
		onClickLeft() {
			wx.showToast({
				title: '点击返回',
				icon: 'none'
			});
		},
		onClickRight() {
			this.setData({
				edit: !this.data.edit
			});
		},
	}


}));