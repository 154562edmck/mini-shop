const { ElMessage, ElMessageBox } = ElementPlus

// 创建路由
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        { path: '/dashboard', component: Dashboard },
        { path: '/categories', component: Categories },
        { path: '/products', component: Products },
        { path: '/orders', component: Orders },
        { path: '/users', component: Users },
        { path: '/configs', component: Configs },
        { path: '/', redirect: '/categories' }
    ]
})

// 创建应用
const app = Vue.createApp({
    data() {
        return {
            isLoggedIn: false,
            loading: false,
            loginForm: {
                username: '',
                password: ''
            },
            isCollapse: localStorage.getItem('sidebarCollapsed')
                ? localStorage.getItem('sidebarCollapsed') === 'true'
                : window.innerWidth <= 768
        }
    },
    async created() {
        // 应用创建时检查登录状态
        try {
            await this.checkAuth()
            ElementPlus.ElMessage.success('欢迎回来！')
        } catch (error) {
            console.log('未登录状态')
        }
    },
    methods: {
        async checkAuth() {
            try {
                const res = await api.auth.check()
                this.isLoggedIn = true
                if (this.$router.currentRoute.value.path === '/') {
                    this.$router.push('/dashboard')
                }

            } catch (error) {
                this.isLoggedIn = false
                this.$router.push('/')
            }
        },
        async handleLogin() {
            this.loading = true;
            try {
                await api.auth.login(this.loginForm);
                this.isLoggedIn = true;
                this.$router.push('/dashboard');
                ElementPlus.ElMessage.success('登录成功');
            } catch (error) {
                ElementPlus.ElMessage.error('登录失败');
            } finally {
                this.loading = false;
            }

        },
        toggleCollapse() {
            this.isCollapse = !this.isCollapse;
            localStorage.setItem('sidebarCollapsed', this.isCollapse);
        }
    },
    mounted() {
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                this.isCollapse = true;
                localStorage.setItem('sidebarCollapsed', 'true');
            }
        });
    }
})

// 注册必要的组件和插件
app.use(ElementPlus)
app.use(router)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 挂载应用
app.mount('#app') 