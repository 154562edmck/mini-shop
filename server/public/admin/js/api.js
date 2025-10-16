// 添加请求拦截器
axios.interceptors.response.use(
    response => {
        // 请求成功，直接返回数据
        return response;
    },
    error => {
        console.error('请求失败:', error);

        // 排除不需要重定向的接口
        const excludeUrls = [
            '/api/install',
            '/api/auth/login',
            '/api/auth/check'
        ];

        // 检查是否是需要排除的 URL
        const isExcluded = excludeUrls.some(url => error.config.url.includes(url));

        // 如果是服务器错误或未授权，并且不是排除的接口
        if ((error.response?.status >= 500 || error.response?.status === 401) && !isExcluded) {
            console.log('服务器错误或未授权，重新检查状态');
            // 重定向到管理首页，让它重新检查安装状态
            window.location.href = '/admin/';
            return Promise.reject(error);
        }

        // 提取自定义错误消息
        const message = error.response?.data?.message || '请求失败';

        return Promise.reject(new Error(message)); // 抛出自定义错误消息
    }
);

// API 接口封装
const api = {
    // 登录相关
    auth: {
        login: (data) => axios.post('/admin/api/auth/login', data),
        logout: () => axios.post('/admin/api/auth/logout'),
        check: () => axios.get('/admin/api/auth/check')
    },
    // 分类相关
    categories: {
        list: () => axios.get('/admin/api/categories'),
        add: (data) => axios.post('/admin/api/categories', data),
        update: (id, data) => axios.put(`/admin/api/categories/${id}`, data),
        delete: (id) => axios.delete(`/admin/api/categories/${id}`)
    },
    // 商品相关
    products: {
        list: (params) => axios.get('/admin/api/products', { params }),
        add: (data) => axios.post('/admin/api/products', data),
        update: (id, data) => axios.put(`/admin/api/products/${id}`, data),
        delete: (id) => axios.delete(`/admin/api/products/${id}`),
        export: () => axios.get('/admin/api/products/export', { responseType: 'blob' }),
        import: (formData) => axios.post('/admin/api/products/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }),
        clear: () => axios.delete('/admin/api/products/clear')
    },
    // 规格相关
    specs: {
        list: (productId) => axios.get(`/admin/api/specs/products/${productId}/specs`),
        add: (data) => axios.post('/admin/api/specs/specs', data),
        update: (id, data) => axios.put(`/admin/api/specs/specs/${id}`, data),
        delete: (id) => axios.delete(`/admin/api/specs/specs/${id}`)
    },
    orders: {
        list: (params) => axios.get('/admin/api/orders', { params }),
        update: (id, data) => axios.put(`/admin/api/orders/${id}`, data),
        delete: (id) => axios.delete(`/admin/api/orders/${id}`),
        generateShareLink: (id) => axios.post(`/admin/api/orders/${id}/share`),
    },
    users: {
        list: (params) => axios.get('/admin/api/users', { params }),
        update: (id, data) => axios.put(`/admin/api/users/${id}`, data),
        delete: (id) => axios.delete(`/admin/api/users/${id}`)
    },
    configs: {
        list: () => axios.get('/admin/api/configs'),
        update: (key, data) => axios.put(`/admin/api/configs/${key}`, data)
    },
    upload: {
        image: (formData) => axios.post('/admin/api/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    dashboard: {
        getStats: () => axios.get('/admin/api/dashboard/stats')
    }
}