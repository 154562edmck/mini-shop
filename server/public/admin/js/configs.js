const Configs = {
    template: `
        <div class="app-container space-y-4 pb-4">
            <!-- 页面标题区域 -->
            <div class="bg-white rounded-none shadow-sm p-4">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-medium text-gray-700">系统配置</h2>
                    <div class="text-sm text-gray-500">
                        配置修改后将自动保存
                    </div>
                </div>
            </div>

            <!-- 配置内容区域 -->
            <div class="bg-white rounded-lg shadow-sm border-1.5 p-4 mx-4 mb-4 overflow-auto">
                <el-tabs type="border-card" class="config-tabs !border-none">
                    <el-tab-pane 
                        v-for="(configs, groupName) in groupedConfigs" 
                        :key="groupName" 
                        :label="groupName"
                    >
                        <div class="space-y-6">
                            <div 
                                v-for="config in configs" 
                                :key="config.key"
                                class="config-item bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                            >
                                <!-- 配置标题和描述 -->
                                <div class="mb-3">
                                    <div class="text-gray-700 font-medium mb-1">
                                        {{ config.description }}
                                    </div>
                                    <div v-if="config.source" class="text-sm text-gray-500">
                                        获取方式: {{ config.source }}
                                    </div>
                                </div>

                                <!-- 配置输入区域 -->
                                <div class="flex flex-col sm:flex-row gap-3">
                                    <div class="flex-1">
                                        <template v-if="config.type === 'textarea'">
                                            <el-input
                                                v-model="config.value"
                                                type="textarea"
                                                :rows="10"
                                                :placeholder="'请输入' + config.description"
                                                class="w-full !rounded-md"
                                                :maxlength="config.maxlength"
                                                show-word-limit
                                            ></el-input>
                                        </template>
                                        <template v-else-if="config.type === 'password'">
                                            <el-input
                                                v-model="config.value"
                                                type="password"
                                                show-password
                                                :placeholder="'请输入' + config.description"
                                                class="w-full !rounded-md"
                                            ></el-input>
                                        </template>
                                        <template v-else-if="config.type === 'number'">
                                            <el-input-number
                                                v-model="config.numValue"
                                                :placeholder="'请输入' + config.description"
                                                class="w-full !rounded-md"
                                                :controls-position="'right'"
                                                @change="handleNumberChange($event, config)"
                                            ></el-input-number>
                                        </template>
                                        <template v-else>
                                            <el-input
                                                v-model="config.value"
                                                :placeholder="'请输入' + config.description"
                                                class="w-full !rounded-md"
                                            ></el-input>
                                        </template>
                                    </div>

                                    <!-- 保存按钮 -->
                                    <div class="flex items-center gap-2">
                                        <el-button 
                                            type="primary" 
                                            @click="handleUpdate(config)"
                                            :loading="loading[config.key]"
                                            class="!bg-blue-500 hover:!bg-blue-600 border-none min-w-[80px]"
                                        >保存</el-button>
                                        
                                        <!-- 重启标记 -->
                                        <el-tag 
                                            v-if="config.restart_required" 
                                            type="warning" 
                                            size="small"
                                            class="whitespace-nowrap !bg-amber-50 !border-amber-200 !text-amber-600"
                                        >
                                            <el-icon class="mr-1"><Warning /></el-icon>
                                            需要重启
                                        </el-tag>
                                    </div>
                                </div>

                                <!-- 配置说明和警告 -->
                                <div class="mt-3 space-y-2">
                                    <div v-if="config.note" class="text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded">
                                        <el-icon class="mr-1"><InfoFilled /></el-icon>
                                        {{ config.note }}
                                    </div>
                                    <div v-if="config.restart_required" class="text-sm text-orange-600">
                                        <el-icon class="mr-1"><Warning /></el-icon>
                                        此配置修改后需要重启应用才能生效
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    `,
    data() {
        return {
            groupedConfigs: {},
            loading: {}
        }
    },
    mounted() {
        console.log('Configs mounted')
        this.loadConfigs()
        // 覆盖 el-tabs 的默认样式
        const style = document.createElement('style');
        style.textContent = `
            .config-tabs .el-tabs__header {
                background-color: transparent !important;
                border: none !important;
                margin: 0 0 1rem 0 !important;
            }
            .config-tabs .el-tabs__nav {
                border: none !important;
            }
            .config-tabs .el-tabs__item {
                border: none !important;
                transition: all 0.2s;
            }
            .config-tabs .el-tabs__item.is-active {
                background-color: #f3f4f6 !important;
                border-radius: 0.5rem;
            }
            .config-tabs .el-tabs__item:hover {
                background-color: #f3f4f6 !important;
                border-radius: 0.5rem;
            }
        `;
        document.head.appendChild(style);
    },
    methods: {
        async loadConfigs() {
            try {
                console.log('Loading configs...')
                const res = await api.configs.list()
                const configs = res.data.data
                
                // 处理数字类型的配置
                Object.keys(configs).forEach(group => {
                    configs[group].forEach(config => {
                        if (config.type === 'number') {
                            config.numValue = Number(config.value)
                        }
                    })
                })
                
                this.groupedConfigs = configs
            } catch (error) {
                console.error('Failed to load configs:', error)
                ElMessage.error('获取配置失败')
            }
        },
        handleNumberChange(value, config) {
            config.value = String(value)
        },
        async handleUpdate(config) {
            this.loading[config.key] = true;
            try {
                const value = config.type === 'number' ? config.numValue : config.value;
                await api.configs.update(config.key, { value: String(value) });
                
                // 检查是否更新了管理员凭据
                if (config.key === 'admin_username' || config.key === 'admin_password') {
                    ElMessage.success('更新成功，即将重新登录...');
                    setTimeout(() => {
                        window.location.href = '/admin';
                    }, 1500);
                    return;
                }

                ElMessage.success(
                    config.restart_required ? 
                    '更新成功，请重启应用使配置生效' : 
                    '更新成功'
                );
            } catch (error) {
                console.error('Failed to update config:', error);
                ElMessage.error('更新失败');
            } finally {
                this.loading[config.key] = false;
            }
        }
    }
} 