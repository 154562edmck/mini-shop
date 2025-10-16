// 分类管理组件
const Categories = {
    template: `
        <div class="app-container space-y-4">
            <!-- 搜索区域 -->
            <div class="bg-white rounded-none shadow-sm p-4">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <h2 class="text-lg font-medium text-gray-700">分类管理</h2>
                    <el-button 
                        type="primary" 
                        @click="showAddDialog"
                        class="!bg-blue-500 hover:!bg-blue-600 border-none"
                    >
                        <el-icon class="mr-1"><plus /></el-icon>添加分类
                    </el-button>
                </div>
            </div>
            
            <!-- 分类列表 -->
            <div class="bg-white rounded-lg shadow-sm mx-4">
                <div class="divide-y divide-gray-100">
                    <div v-for="item in categories" :key="item.id" 
                        class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-200">
                        <div class="flex items-center space-x-4">
                            <div class="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <el-icon class="text-blue-500 text-xl"><folder /></el-icon>
                            </div>
                            <div>
                                <h3 class="text-sm font-medium text-gray-900">{{ item.name }}</h3>
                                <p class="text-xs text-gray-500">排序: {{ item.sort }}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-2">
                            <el-button 
                                size="small" 
                                @click="handleEdit(item)"
                                class="!border-gray-300 hover:!border-blue-400 hover:!text-blue-500"
                            >
                                <el-icon class="mr-1"><edit /></el-icon>编辑
                            </el-button>
                            <el-button 
                                size="small" 
                                type="danger" 
                                @click="handleDelete(item)"
                                class="!bg-red-50 !border-red-200 !text-red-500 hover:!bg-red-100"
                            >
                                <el-icon class="mr-1"><delete /></el-icon>删除
                            </el-button>
                        </div>
                    </div>
                    
                    <!-- 空状态 -->
                    <div v-if="categories.length === 0" class="p-8 text-center">
                        <el-icon class="text-4xl text-gray-300 mb-2"><folder /></el-icon>
                        <p class="text-gray-500">暂无分类数据</p>
                    </div>
                </div>
            </div>

            <!-- 添加/编辑对话框 -->
            <el-dialog 
                :title="dialogTitle" 
                v-model="dialogVisible"
                custom-class="rounded-lg"
                width="90%"
                max-width="500px"
            >
                <el-form :model="form" label-position="top">
                    <el-form-item label="分类名称" required>
                        <el-input 
                            v-model="form.name"
                            placeholder="请输入分类名称"
                            maxlength="50"
                            show-word-limit
                            class="!rounded-md"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="排序">
                        <el-input-number 
                            v-model="form.sort"
                            :min="0"
                            :max="999"
                            class="w-full !rounded-md"
                        ></el-input-number>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div class="flex gap-2 justify-end">
                        <el-button 
                            @click="dialogVisible = false"
                            class="!border-gray-300"
                        >取消</el-button>
                        <el-button 
                            type="primary" 
                            @click="handleSubmit"
                            class="!bg-blue-500 hover:!bg-blue-600 border-none"
                        >确定</el-button>
                    </div>
                </template>
            </el-dialog>
        </div>
    `,
    data() {
        return {
            categories: [],
            dialogVisible: false,
            dialogTitle: '添加分类',
            form: {
                name: '',
                sort: 0
            },
            editingId: null,
            tableHeight: window.innerHeight - 300 // 动态计算表格高度
        }
    },
    created() {
        this.loadCategories()
        // 监听窗口大小变化，更新表格高度
        window.addEventListener('resize', this.updateTableHeight)
    },
    unmounted() {
        // 移除事件监听
        window.removeEventListener('resize', this.updateTableHeight)
    },
    methods: {
        updateTableHeight() {
            // 动态计算表格高度，考虑移动端底部导航栏
            const isMobile = window.innerWidth <= 768
            this.tableHeight = window.innerHeight - (isMobile ? 350 : 300)
        },
        async loadCategories() {
            try {
                const res = await api.categories.list()
                this.categories = res.data.data
            } catch (error) {
                ElMessage.error('获取分类列表失败')
            }
        },
        showAddDialog() {
            this.dialogTitle = '添加分类'
            this.form = { name: '', sort: 0 }
            this.editingId = null
            this.dialogVisible = true
        },
        handleEdit(row) {
            this.dialogTitle = '编辑分类'
            this.form = { ...row }
            this.editingId = row.id
            this.dialogVisible = true
        },
        async handleDelete(row) {
            try {
                await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                await api.categories.delete(row.id)
                ElMessage.success('删除成功')
                this.loadCategories()
            } catch (error) {
                console.error(error);
                if (error !== 'cancel') {
                    ElMessage.error(error.message || '删除失败')
                }
            }
        },
        async handleSubmit() {
            try {
                if (!this.form.name) {
                    ElMessage.warning('请输入分类名称')
                    return
                }

                if (this.editingId) {
                    await api.categories.update(this.editingId, this.form)
                    ElMessage.success('更新成功')
                } else {
                    await api.categories.add(this.form)
                    ElMessage.success('添加成功')
                }
                this.dialogVisible = false
                this.loadCategories()
            } catch (error) {
                ElMessage.error(this.editingId ? '更新失败' : '添加失败')
            }
        }
    },
    mounted() {
        // 添加自定义表格样式
        const style = document.createElement('style');
        style.textContent = `
            .el-table {
                --el-table-border-color: transparent !important;
                --el-table-header-bg-color: #f9fafb !important;
            }
            .el-table th {
                font-weight: 600 !important;
                color: #374151 !important;
            }
            .el-table--enable-row-hover .el-table__body tr:hover > td {
                background-color: #f3f4f6 !important;
            }
        `;
        document.head.appendChild(style);
    }
}