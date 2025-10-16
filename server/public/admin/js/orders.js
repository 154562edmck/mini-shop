const Orders = {
    template: `
        <div class="app-container">
            <!-- 操作栏 -->
            <div class="bg-white rounded-none shadow-none p-4">
                <div class="flex justify-between items-center">
                    <h2 class="text-lg font-medium text-gray-700">订单列表</h2>
                </div>
            </div>

            <!-- 搜索和筛选区域 -->
            <div class="bg-white rounded-none shadow-sm p-4">
                <el-form :model="searchForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <el-form-item label="订单号" class="mb-0">
                        <el-input 
                            v-model="searchForm.order_no" 
                            placeholder="请输入订单号"
                            clearable
                            class="!rounded-md">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="用户名" class="mb-0">
                        <el-input 
                            v-model="searchForm.user_name" 
                            placeholder="请输入用户名"
                            clearable
                            class="!rounded-md">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="订单状态" class="mb-0">
                        <el-select 
                            v-model="searchForm.status" 
                            placeholder="请选择状态" 
                            clearable
                            class="w-full !rounded-md">
                            <el-option
                                v-for="(label, value) in statusOptions"
                                :key="value"
                                :label="label"
                                :value="Number(value)">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <div class="flex gap-2 items-end justify-end">
                        <el-button 
                            type="primary" 
                            @click="handleSearch" 
                            class="flex-1 md:flex-none !bg-blue-500 hover:!bg-blue-600 border-none">
                            <el-icon class="mr-1"><search /></el-icon>搜索
                        </el-button>
                        <el-button 
                            @click="resetSearch" 
                            class="flex-1 md:flex-none !border-gray-300 hover:!border-gray-400">
                            <el-icon class="mr-1"><refresh /></el-icon>重置
                        </el-button>
                    </div>
                </el-form>
            </div>

            <!-- 订单列表 -->
            <div class="bg-white rounded-lg shadow-sm border-1.5 overflow-hidden mx-4 my-4">
                <el-table 
                    :data="orders" 
                    style="width: 100%"
                    class="!border-none">
                    <el-table-column 
                        prop="order_no" 
                        label="订单号"
                        min-width="180">
                    </el-table-column>
                    <el-table-column 
                        prop="user_name" 
                        label="用户名"
                        min-width="120">
                    </el-table-column>
                    <el-table-column 
                        label="收货信息" 
                        min-width="200">
                        <template #default="scope">
                            <div class="space-y-1">
                                <div>{{ scope.row.receiver_name }} {{ scope.row.receiver_phone }}</div>
                                <div class="text-gray-500 text-sm">
                                    {{ scope.row.province }}{{ scope.row.city }}{{ scope.row.district }}{{ scope.row.address_detail }}
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column 
                        label="商品信息" 
                        min-width="300">
                        <template #default="scope">
                            <div class="space-y-2">
                                <div v-for="(item, index) in (isExpanded(scope.row) ? scope.row.items : scope.row.items.slice(0, 2))" 
                                     :key="item.id" 
                                     class="flex items-center gap-2">
                                    <el-image 
                                        :src="item.product_image" 
                                        class="w-10 h-10 rounded object-cover">
                                    </el-image>
                                    <div class="flex-1 min-w-0">
                                        <div class="truncate">{{ item.product_name }}</div>
                                        <div class="text-sm text-gray-500">
                                            {{ item.spec_name }} × {{ item.quantity }}
                                        </div>
                                    </div>
                                    <div class="text-red-500">¥{{ item.price }}</div>
                                </div>
                                
                                <!-- 展开/收起按钮 -->
                                <div v-if="scope.row.items.length > 2" 
                                     @click="toggleExpand(scope.row)"
                                     class="flex items-center justify-center py-1 px-2 text-sm text-blue-500 hover:bg-gray-50 cursor-pointer rounded">
                                    <span>{{ isExpanded(scope.row) ? '收起' : '展开全部' }}</span>
                                    <el-icon class="ml-1">
                                        <arrow-down v-if="!isExpanded(scope.row)" />
                                        <arrow-up v-else />
                                    </el-icon>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column 
                        prop="total_amount" 
                        label="总金额"
                        min-width="100"
                        align="center">
                        <template #default="scope">
                            <span class="text-red-500 font-medium">¥{{ scope.row.total_amount }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column 
                        prop="status" 
                        label="状态"
                        min-width="100"
                        align="center">
                        <template #default="scope">
                            <el-tag 
                                :type="getStatusType(scope.row)"
                                class="!border-none"
                                :class="getStatusClass(scope.row)">
                                {{ getStatusText(scope.row) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column 
                        label="支付方式" 
                        min-width="150"
                        align="center">
                        <template #default="scope">
                            <el-tag 
                                :type="getPayMethodType(scope.row)"
                                class="!border-none"
                                :class="getPayMethodClass(scope.row)">
                                {{ getPayMethodText(scope.row) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column 
                        label="操作" 
                        min-width="250"
                        align="center">
                        <template #default="scope">
                            <div class="flex gap-2 justify-center">
                                <el-button 
                                    size="small" 
                                    @click="handleEdit(scope.row)"
                                    class="!border-gray-300 hover:!border-blue-400 hover:!text-blue-500">
                                    <el-icon class="mr-1"><edit /></el-icon>编辑
                                </el-button>
                                <el-button 
                                    size="small" 
                                    type="danger" 
                                    @click="handleDelete(scope.row)"
                                    class="!bg-red-50 !border-red-200 !text-red-500 hover:!bg-red-100">
                                    <el-icon class="mr-1"><delete /></el-icon>删除
                                </el-button>
                                <el-button
                                    size="small"
                                    type="success"
                                    @click="handlePromote(scope.row)"
                                >
                                    推广
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页 -->
            <div class="bg-white rounded-lg shadow-sm p-4 mx-4">
                <el-pagination
                    v-model:current-page="currentPage"
                    v-model:page-size="pageSize"
                    :total="total"
                    :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next"
                    class="justify-end"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange">
                </el-pagination>
            </div>

            <!-- 编辑对话框 -->
            <el-dialog 
                title="编辑订单" 
                v-model="editDialogVisible"
                width="90%"
                max-width="500px"
                class="rounded-lg">
                <el-form :model="editForm" label-width="100px">
                    <el-form-item label="支付方式">
                        <el-select v-model="editForm.pay_method" class="w-full" @change="handlePayMethodChange">
                            <el-option
                                v-for="(label, value) in payMethodOptions"
                                :key="value"
                                :label="label"
                                :value="value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="易支付类型" v-if="editForm.pay_method === 'easypay'">
                        <el-select v-model="editForm.easy_pay_type" class="w-full">
                            <el-option
                                v-for="(label, value) in easyPayTypeOptions"
                                :key="value"
                                :label="label"
                                :value="value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="订单状态">
                        <el-select v-model="editForm.status" class="w-full">
                            <el-option
                                v-for="(label, value) in statusOptions"
                                :key="value"
                                :label="label"
                                :value="Number(value)">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="总金额">
                        <el-input-number 
                            v-model="editForm.total_amount"
                            :precision="2"
                            :step="0.01"
                            :min="0"
                            class="w-full">
                        </el-input-number>
                    </el-form-item>
                    <el-form-item label="过期时间">
                        <el-date-picker
                            v-model="editForm.expire_time"
                            type="datetime"
                            placeholder="选择过期时间"
                            format="YYYY-MM-DD HH:mm:ss"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            class="w-full"
                            clearable>
                        </el-date-picker>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div class="flex gap-2 justify-end">
                        <el-button @click="editDialogVisible = false">取消</el-button>
                        <el-button 
                            type="primary" 
                            @click="submitEdit"
                            class="!bg-blue-500 hover:!bg-blue-600 border-none">
                            确定
                        </el-button>
                    </div>
                </template>
            </el-dialog>

            <!-- 分享对话框 -->
            <el-dialog
                v-model="shareDialogVisible"
                title="推广订单"
                width="400px"
                class="qr-dialog"
            >
                <div class="flex flex-col items-center gap-8">
                    <div class="text-center w-full">
                        <p class="mb-3 text-gray-600 text-sm">分享链接</p>
                        <el-input
                            v-model="shareUrl"
                            readonly
                            class="w-full !rounded-lg"
                        >
                            <template #append>
                                <el-button color="success" @click="copyShareLink">
                                    复制
                                </el-button>
                            </template>
                        </el-input>
                    </div>
                    
                    <div class="text-center w-full">
                        <div class="flex justify-center gap-4 mb-4">
                            <el-select 
                                v-model="qrCodeColor" 
                                placeholder="选择颜色"
                                @change="handleStyleChange"
                                class="w-32"
                            >
                                <el-option
                                    v-for="color in qrCodeColors"
                                    :key="color.value"
                                    :label="color.label"
                                    :value="color.value"
                                >
                                    <div class="flex items-center">
                                        <div 
                                            class="w-4 h-4 rounded-full mr-2"
                                            :style="{ backgroundColor: color.value }"
                                        ></div>
                                        {{ color.label }}
                                    </div>
                                </el-option>
                            </el-select>
                        </div>

                        <div class="p-6 bg-white rounded-xl inline-block">
                            <img
                                v-if="qrCodeUrl"
                                :src="qrCodeUrl"
                                class="w-48 h-48 mx-auto"
                                alt="二维码"
                            />
                        </div>
                    </div>
                </div>
                
                <template #footer>
                    <div class="flex justify-center gap-4">
                        <el-button
                            type="primary"
                            @click="copyShareLink"
                            class="!bg-blue-500 hover:!bg-blue-600"
                        >
                            复制链接
                        </el-button>
                        <el-button
                            type="success"
                            @click="saveQrCode"
                            class="!bg-green-500 hover:!bg-green-600"
                        >
                            保存图片
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </div>
    `,
    data() {
        return {
            searchForm: {
                order_no: '',
                user_name: '',
                status: null
            },
            orders: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
            editDialogVisible: false,
            editForm: {
                status: null,
                total_amount: 0,
                expire_time: null,
                pay_method: 'wechat',
                easy_pay_type: 'wxpay'
            },
            currentOrder: null,
            statusOptions: {
                0: '待支付',
                1: '已支付',
                2: '已过期'
            },
            tableHeight: window.innerHeight - 300,
            expandedRows: new Set(),
            shareDialogVisible: false,
            shareUrl: '',
            qrCodeUrl: '',
            currentShareOrder: null,
            qrCodeColor: '#1677ff',
            qrCodeColors: [
                { label: '蓝色', value: '#1677ff' },
                { label: '绿色', value: '#52c41a' },
                { label: '黑色', value: '#000000' },
                { label: '紫色', value: '#722ed1' }
            ],
            payMethodOptions: {
                'wechat': '微信支付',
                'alipay': '支付宝',
                'easypay': '易支付'
            },
            easyPayTypeOptions: {
                'wxpay': '微信支付',
                'alipay': '支付宝',
                'qqpay': 'QQ钱包'
            }
        }
    },
    created() {
        this.loadOrders()
        window.addEventListener('resize', this.updateTableHeight)
    },
    unmounted() {
        window.removeEventListener('resize', this.updateTableHeight)
    },
    methods: {
        updateTableHeight() {
            this.tableHeight = window.innerHeight - 300
        },
        async loadOrders() {
            try {
                const params = {
                    page: this.currentPage,
                    limit: this.pageSize,
                    ...this.searchForm
                }
                const res = await api.orders.list(params)
                this.orders = res.data.data.list
                this.total = res.data.data.pagination.total
            } catch (error) {
                ElMessage.error('获取订单列表失败')
            }
        },
        handleSearch() {
            this.currentPage = 1
            this.loadOrders()
        },
        resetSearch() {
            this.searchForm = {
                order_no: '',
                user_name: '',
                status: null
            }
            this.handleSearch()
        },
        handleSizeChange(val) {
            this.pageSize = val
            this.loadOrders()
        },
        handleCurrentChange(val) {
            this.currentPage = val
            this.loadOrders()
        },
        getStatusType(row) {
            const statusTypes = {
                0: 'warning',    // 待支付
                1: 'primary',    // 已支付
                2: 'info',       // 已过期
            };
            return statusTypes[row.status] || 'info';
        },
        getStatusClass(row) {
            const statusClasses = {
                0: '!bg-orange-50 !text-orange-600',  // 待付款
                1: '!bg-blue-50 !text-blue-600',      // 待发货
                2: '!bg-indigo-50 !text-indigo-600',  // 待收货
                3: '!bg-emerald-50 !text-emerald-600',// 已完成
                4: '!bg-red-50 !text-red-600',        // 已取消
                5: '!bg-gray-50 !text-gray-600'       // 已过期
            };
            return statusClasses[row.status] || '!bg-gray-50 !text-gray-600';
        },
        getStatusText(row) {
            return this.statusOptions[row.status] || '未知状态';
        },
        handleEdit(row) {
            const { pay_method, easy_pay_type } = this.parsePayMethod(row.pay_method);
            this.editForm = {
                status: row.status,
                total_amount: row.total_amount,
                expire_time: row.expire_time,
                pay_method: pay_method,
                easy_pay_type: easy_pay_type
            };
            this.currentOrder = row;
            this.editDialogVisible = true;
        },
        validateStatusChange(newStatus, expireTime) {
            // 只有当前状态是已过期(5)，且要改为待付款(0)时才检查
            if (newStatus === 0) {
                // 检查过期时间是否是将来的时间
                if (!expireTime || new Date(expireTime) <= new Date()) {
                    return false;
                }
            }
            return true;
        },
        async submitEdit() {
            try {
                if (!this.validateStatusChange(
                    this.editForm.status,
                    this.editForm.expire_time
                )) {
                    ElMessage.error('已过期订单只能在过期时间为将来时才能改为待付款状态');
                    return;
                }

                const formData = {
                    status: this.editForm.status,
                    total_amount: this.editForm.total_amount,
                    expire_time: this.editForm.expire_time,
                    pay_method: this.editForm.pay_method === 'easypay'
                        ? `easypay-${this.editForm.easy_pay_type}`
                        : this.editForm.pay_method
                };

                if (this.editForm.status === 2) {
                    formData.expire_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
                }
                
                await api.orders.update(this.currentOrder.id, formData)
                ElMessage.success('更新成功')
                this.editDialogVisible = false
                this.loadOrders()
            } catch (error) {
                ElMessage.error('更新失败')
            }
        },
        async handleDelete(row) {
            try {
                await ElMessageBox.confirm('确定要删除该订单吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                await api.orders.delete(row.id)
                ElMessage.success('删除成功')
                this.loadOrders()
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('删除失败')
                }
            }
        },
        toggleExpand(row) {
            if (this.expandedRows.has(row.id)) {
                this.expandedRows.delete(row.id);
            } else {
                this.expandedRows.add(row.id);
            }
        },
        isExpanded(row) {
            return this.expandedRows.has(row.id);
        },
        // 处理推广按钮点击
        async handlePromote(row) {
            try {
                this.currentShareOrder = row;
                const response = await api.orders.generateShareLink(row.id);
                this.shareUrl = response.data.data.shareUrl;

                // 先显示对话框
                this.shareDialogVisible = true;

                // 生成二维码
                this.generateQRCode();
            } catch (error) {
                console.error('生成分享链接失败:', error);
                ElMessage.error('生成分享链接失败');
            }
        },
        // 生成二维码的方法
        generateQRCode() {
            const options = {
                width: 256,
                height: 256,
                margin: 1,
                color: {
                    dark: this.qrCodeColor,
                    light: '#ffffff'
                },
                type: 'image/png',
                quality: 0.92,
                errorCorrectionLevel: 'H',
                // 添加圆角效果
                rendererOpts: {
                    quality: 0.92
                }
            };

            QRCode.toDataURL(this.shareUrl, options, (error, url) => {
                if (error) {
                    console.error('生成二维码失败:', error);
                    ElMessage.error('生成二维码失败');
                    return;
                }
                this.qrCodeUrl = url;
            });
        },
        // 更新二维码样式
        handleStyleChange() {
            this.generateQRCode();
        },
        // 复制链接
        async copyShareLink() {
            try {
                await navigator.clipboard.writeText(this.shareUrl);
                ElMessage({
                    message: '链接已复制',
                    type: 'success',
                    duration: 1500
                });
            } catch (error) {
                // 降级处理
                const input = document.createElement('input');
                input.value = this.shareUrl;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                ElMessage({
                    message: '链接已复制',
                    type: 'success',
                    duration: 1500
                });
            }
        },
        // 保存二维码图片
        saveQrCode() {
            if (!this.qrCodeUrl) {
                ElMessage.error('二维码未生成');
                return;
            }
            const link = document.createElement('a');
            link.download = `share-qr-${this.currentShareOrder.order_no}.png`;
            link.href = this.qrCodeUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            ElMessage({
                message: '二维码已保存',
                type: 'success',
                duration: 1500
            });
        },
        getPayMethodType(row) {
            return row.pay_method === 'alipay' ? 'primary' : 'success';
        },
        getPayMethodClass(row) {
            const classes = {
                'wechat': '!bg-green-50 !text-green-600',
                'alipay': '!bg-blue-50 !text-blue-600'
            };
            return classes[row.pay_method] || '!bg-gray-50 !text-gray-600';
        },
        getPayMethodText(row) {
            if (row.pay_method?.startsWith('easypay-')) {
                const type = row.pay_method.split('-')[1];
                return `易支付-${this.easyPayTypeOptions[type]}`;
            }
            return this.payMethodOptions[row.pay_method] || '未知';
        },
        // 处理支付方式变化
        handlePayMethodChange(value) {
            if (value === 'easypay') {
                this.editForm.easy_pay_type = 'wxpay'; // 默认选择微信支付
            }
        },
        // 解析支付方式
        parsePayMethod(fullPayMethod) {
            if (fullPayMethod?.startsWith('easypay-')) {
                return {
                    pay_method: 'easypay',
                    easy_pay_type: fullPayMethod.split('-')[1]
                };
            }
            return {
                pay_method: fullPayMethod,
                easy_pay_type: 'wxpay'
            };
        }
    }
}