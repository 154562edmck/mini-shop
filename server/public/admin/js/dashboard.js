const Dashboard = {
    template: `
        <div class="min-h-screen bg-gray-50/80 p-4">
            <!-- 头部统计卡片 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <el-card shadow="hover" class="!bg-gradient-to-br from-blue-500 to-blue-600 border-none">
                    <div class="text-white">
                        <div class="text-sm opacity-80">今日已付订单</div>
                        <div class="text-2xl font-bold mt-2">{{ stats.today.orderCount || 0 }}</div>
                        <div class="text-sm mt-2">
                            收入：¥{{ formatPrice(stats.today.orderAmount) }}
                        </div>
                    </div>
                </el-card>

                <el-card shadow="hover" class="!bg-gradient-to-br from-green-500 to-green-600 border-none">
                    <div class="text-white">
                        <div class="text-sm opacity-80">总已付订单</div>
                        <div class="text-2xl font-bold mt-2">{{ stats.total.orderCount || 0 }}</div>
                        <div class="text-sm mt-2">
                            收入：¥{{ formatPrice(stats.total.orderAmount) }}
                        </div>
                    </div>
                </el-card>

                <el-card shadow="hover" class="!bg-gradient-to-br from-purple-500 to-purple-600 border-none">
                    <div class="text-white">
                        <div class="text-sm opacity-80">商品总数</div>
                        <div class="text-2xl font-bold mt-2">{{ stats.total.productCount || 0 }}</div>
                        <div class="text-sm mt-2">
                            库存预警：{{ stats.alerts.lowStock || 0 }}
                        </div>
                    </div>
                </el-card>

                <el-card shadow="hover" class="!bg-gradient-to-br from-orange-500 to-orange-600 border-none">
                    <div class="text-white">
                        <div class="text-sm opacity-80">用户总数</div>
                        <div class="text-2xl font-bold mt-2">{{ stats.total.userCount || 0 }}</div>
                        <div class="text-sm mt-2">
                            活跃度：{{ calculateActiveRate() }}%
                        </div>
                    </div>
                </el-card>
            </div>

            <!-- 订单状态统计 -->
            <div class="mb-6">
                <el-card shadow="hover">
                    <template #header>
                        <div class="font-medium">订单状态分布</div>
                    </template>
                    <el-table :data="orderStatusList" stripe>
                        <el-table-column label="订单状态" min-width="120">
                            <template #default="{ row }">
                                <el-tag :type="getOrderStatusType(row.status)">
                                    {{ getOrderStatusText(row.status) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="count" label="订单数量" min-width="120"/>
                        <el-table-column label="订单金额" min-width="120">
                            <template #default="{ row }">
                                ¥{{ formatPrice(row.amount) }}
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </div>

            <!-- 图表区域 -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <el-card shadow="hover" class="h-[400px]">
                    <template #header>
                        <div class="font-medium">近7天订单趋势</div>
                    </template>
                    <div ref="orderChart" class="w-full h-[350px] p-4 pb-12 flex justify-center items-center"></div>
                </el-card>


                <el-card shadow="hover" class="h-[400px]">
                    <template #header>
                        <div class="font-medium">商品分类统计</div>
                    </template>
                    <div ref="categoryChart" class="w-full h-[350px] p-4 pb-12 flex justify-center items-center"></div>
                </el-card>
            </div>
        </div>
    `,

    data() {
        return {
            stats: {
                today: { orderCount: 0, orderAmount: 0 },
                total: { orderCount: 0, orderAmount: 0, productCount: 0, userCount: 0 },
                orderStatus: [],
                alerts: { lowStock: 0 },
                weeklyOrders: [],
                categoryStats: []
            },
            orderChart: null,
            categoryChart: null
        }
    },

    computed: {
        orderStatusList() {
            return this.stats.orderStatus || [];
        }
    },

    methods: {
        formatPrice(price) {
            return (price || 0).toFixed(2)
        },

        calculateActiveRate() {
            if (!this.stats.total.userCount) return 0;
            return Math.round((this.stats.today.orderCount / this.stats.total.userCount) * 100) || 0
        },

        async loadStats() {
            try {
                const res = await api.dashboard.getStats()
                this.stats = res.data.data
                this.$nextTick(() => {
                    this.initCharts()
                })
            } catch (error) {
                ElementPlus.ElMessage.error('获取统计数据失败')
            }
        },

        initCharts() {
            // 销毁旧的图表实例
            if (this.orderChart) {
                this.orderChart.dispose();
            }
            if (this.categoryChart) {
                this.categoryChart.dispose();
            }

            // 通用配置
            const commonConfig = {
                backgroundColor: 'transparent',
                textStyle: {
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    color: '#64748b'
                }
            };

            // 订单趋势图
            this.orderChart = echarts.init(this.$refs.orderChart)
            this.orderChart.setOption({
                ...commonConfig,
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(0, 0, 0, 0.05)',
                    borderWidth: 1,
                    textStyle: {
                        color: '#334155'
                    },
                    formatter: function (params) {
                        const data = params[0];
                        return `<div class="font-medium">${data.name}</div>${data.seriesName}：${data.value}`;
                    }
                },
                grid: {
                    top: '5%',
                    left: '3%',
                    right: '4%',
                    bottom: '8%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: this.stats.weeklyOrders.map(item => item.date),
                    axisLine: {
                        lineStyle: { color: '#e2e8f0' }
                    },
                    axisTick: { show: false }
                },
                yAxis: {
                    type: 'value',
                    splitLine: {
                        lineStyle: { color: '#e2e8f0', type: 'dashed' }
                    },
                    axisLine: { show: false },
                    axisTick: { show: false }
                },
                series: [{
                    name: '订单数',
                    data: this.stats.weeklyOrders.map(item => item.count),
                    type: 'line',
                    smooth: true,
                    symbolSize: 8,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(6, 182, 212, 0.25)' },
                            { offset: 1, color: 'rgba(6, 182, 212, 0.05)' }
                        ])
                    },
                    lineStyle: {
                        width: 3,
                        color: '#06b6d4'
                    },
                    itemStyle: {
                        color: '#06b6d4',
                        borderWidth: 2,
                        borderColor: '#fff'
                    }
                }]
            })

            // 分类统计图
            this.categoryChart = echarts.init(this.$refs.categoryChart)
            this.categoryChart.setOption({
                ...commonConfig,
                tooltip: {
                    trigger: 'item',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderColor: 'rgba(0, 0, 0, 0.05)',
                    borderWidth: 1,
                    textStyle: {
                        color: '#334155'
                    },
                    formatter: '{b}: {c} ({d}%)'
                },
                series: [{
                    type: 'pie',
                    radius: ['45%', '70%'],
                    center: ['50%', '50%'],
                    avoidLabelOverlap: true,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: '{b}\n{c}',
                        color: '#64748b',
                        fontSize: 12,
                        lineHeight: 16
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 14,
                            fontWeight: 'bold'
                        },
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.2)'
                        }
                    },
                    labelLine: {
                        length: 15,
                        length2: 0,
                        maxSurfaceAngle: 80
                    },
                    data: this.stats.categoryStats.map((item, index) => ({
                        name: item.name,
                        value: item.count,
                        itemStyle: {
                            color: [
                                '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981',
                                '#3b82f6', '#ec4899', '#6366f1', '#14b8a6'
                            ][index % 8]
                        }
                    }))
                }]
            })
        },

        handleResize() {
            if (this.orderChart) {
                this.orderChart.resize()
            }
            if (this.categoryChart) {
                this.categoryChart.resize()
            }
        },

        getOrderStatusText(status) {
            const statusMap = {
                0: '待支付',
                1: '已支付',
                2: '已过期'
            };
            return statusMap[status] || '已过期';
        },

        getOrderStatusType(status) {
            const typeMap = {
                0: 'warning',
                1: 'primary',
                2: 'info'
            };
            return typeMap[status] || 'info';
        }
    },

    mounted() {
        this.loadStats()
        window.addEventListener('resize', this.handleResize)
    },

    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize)
        if (this.orderChart) {
            this.orderChart.dispose()
        }
        if (this.categoryChart) {
            this.categoryChart.dispose()
        }
    }
} 