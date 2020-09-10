<template>
  <div id="app" :page="page" :style="`min-height: ${height}px`">
    <!-- <v-touch v-on:swipeleft="onSwipeLeft" v-on:swiperight="onSwipeRight" tag="div"> -->
    <router-view></router-view>
    <!-- </v-touch> -->
  </div>
</template>

<script>
import "./mixin";
export default {
  data() {
    return {
      page: this.attachProperty(),
      height: 554,
    };
  },
  name: "app",
  watch: {
    $route: "watchRouter", // 监听路由变化，如果路由改变，会再次执行该方法
  },
  created() {},
  methods: {
    onSwipeLeft() {
      window.history.go(-1);
    },
    onSwipeRight() {
      window.history.go(1);
    },
    watchRouter() {
      console.log("路由发生了变化:", this.$route);

      this.page = this.attachProperty();
      this.height = document.documentElement.clientHeight;

      this.verifyRouter();
    },

    verifyRouter() {
      // 不存在自动跳转到404页面
      if (this.$route.matched.length < 1) {
        return app.router.replace("/404");
      }
    },

    attachProperty() {
      let i = this.$route.path.replace(/\//g, "_");
      if (i.indexOf("_") === 0) {
        i = i.replace("_", "");
      }
      return i === "" ? "index" : i;
    },

    initWechatConfig() {
      let that = this;

      app.router.afterEach((to, from, next) => {
        setTimeout(() => {
          let desc = "这是首页描述",
            title = "这是首页";
          // ios
          if (
            app.device().ios &&
            app.isWeChat() &&
            that.$store.state.app.is_wxjs
          ) {
            that.wxShare({
              title: title,
              url: `${location.origin}${config.base ? config.base : "/"}`,
              desc: desc,
              img: that.$store.state.app.logo,
              ajax_data: {
                url: tools.cache.get("initUrl"),
              },
            });
          }
          // Android
          if (
            app.isAndroid() &&
            app.isWeChat() &&
            that.$store.state.app.is_wxjs
          ) {
            that.wxShare({
              title: title,
              url: `${location.origin}${config.base ? config.base : "/"}`,
              desc: desc,
              img: that.$store.state.app.logo,
              ajax_data: {
                url: location.href,
              },
            });
          }
        }, 500);
      });
    },
  },
  mounted() {
    this.initWechatConfig();
  },
};
</script>

<style>
</style>
