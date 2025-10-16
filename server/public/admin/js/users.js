const Users = {
    template: `
        <div class="app-container">
            <!-- 操作栏 -->
            <div class="bg-white rounded-none shadow-none p-4">
                <div class="flex justify-between items-center">
                    <h2 class="text-lg font-medium text-gray-700">用户列表</h2>
                </div>
            </div>

            <!-- 搜索区域 -->
            <div class="bg-white rounded-none shadow-sm p-4">
                <el-form :model="searchForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <el-form-item label="用户昵称" class="mb-0">
                        <el-input 
                            v-model="searchForm.nickname" 
                            placeholder="请输入用户昵称"
                            clearable
                            class="!rounded-md">
                        </el-input>
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

            <!-- 用户列表 -->
            <div class="bg-white rounded-lg shadow-sm border-1.5 overflow-hidden mx-4 my-4">
                <el-table 
                    :data="users" 
                    style="width: 100%"
                    class="!border-none">
                    <el-table-column 
                        label="用户信息" 
                        min-width="300">
                        <template #default="scope">
                            <div class="flex items-center gap-4">
                                <el-image
                                    v-if="scope.row.avatar"
                                    :src="scope.row.avatar"
                                    style="width: 48px; height: 48px;"
                                    class="rounded-full object-cover border-2 border-gray-100"
                                    :preview-src-list="[scope.row.avatar]"
                                ></el-image>
                                <div class="flex-1 min-w-0">
                                    <p class="font-medium text-gray-900 truncate">
                                        {{ scope.row.nickname || '未设置昵称' }}
                                    </p>
                                    <p class="text-gray-500 text-sm truncate">
                                        OpenID: {{ scope.row.openid }}
                                    </p>
                                    <p class="text-gray-500 text-sm">
                                        注册时间: {{ scope.row.create_time }}
                                    </p>
                                </div>
                            </div>
                        </template>
                    </el-table-column>
                    
                    <el-table-column 
                        prop="order_count" 
                        label="订单数"
                        min-width="120"
                        align="center">
                        <template #default="scope">
                            <span class="text-gray-900">{{ scope.row.order_count }}</span>
                        </template>
                    </el-table-column>
                    
                    <el-table-column 
                        prop="total_spent" 
                        label="消费总额"
                        min-width="120"
                        align="center">
                        <template #default="scope">
                            <span class="text-red-500 font-medium">
                                ¥{{ scope.row.total_spent.toFixed(2) }}
                            </span>
                        </template>
                    </el-table-column>
                    
                    <el-table-column 
                        label="操作" 
                        min-width="150"
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
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- 分页 -->
            <div class="bg-white rounded-sm shadow-sm p-4 mx-4">
                <el-pagination
                    v-model:current-page="page"
                    v-model:page-size="limit"
                    :page-sizes="[10, 20, 50, 100]"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    layout="total, sizes, prev, pager, next"
                    class="justify-end">
                </el-pagination>
            </div>

            <!-- 编辑对话框 -->
            <el-dialog
                v-model="editDialogVisible"
                title="编辑用户信息"
                width="90%"
                max-width="500px"
                class="rounded-lg"
            >
                <el-form :model="editForm" label-position="top">
                    <el-form-item label="头像">
                        <div class="flex items-center gap-4">
                            <el-image
                                v-if="editForm.avatar"
                                :src="editForm.avatar"
                                class="w-20 h-20 rounded-full object-cover border-2 border-gray-100"
                            ></el-image>
                            <el-upload
                                class="avatar-uploader"
                                action="#"
                                :http-request="uploadAvatar"
                                :show-file-list="false"
                                :before-upload="beforeAvatarUpload"
                            >
                                <el-button 
                                    type="primary"
                                    class="!bg-blue-500 hover:!bg-blue-600 border-none">
                                    <el-icon class="mr-1"><upload-filled /></el-icon>更换头像
                                </el-button>
                            </el-upload>
                        </div>
                    </el-form-item>
                    <el-form-item label="昵称">
                        <el-input 
                            v-model="editForm.nickname" 
                            placeholder="请输入昵称"
                            class="!rounded-md">
                        </el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div class="flex gap-2 justify-end">
                        <el-button 
                            @click="editDialogVisible = false"
                            class="!border-gray-300">
                            取消
                        </el-button>
                        <el-button 
                            type="primary" 
                            @click="submitEdit"
                            class="!bg-blue-500 hover:!bg-blue-600 border-none">
                            确定
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </div>
    `,
    data() {
        return {
            users: [],
            page: 1,
            limit: 10,
            total: 0,
            searchForm: {
                nickname: ''
            },
            editDialogVisible: false,
            editForm: {
                nickname: '',
                avatar: ''
            },
            currentUser: null,
            tableHeight: window.innerHeight - 300
        }
    },
    created() {
        this.loadUsers()
        this.handleResize()
        window.addEventListener('resize', this.handleResize)
    },
    unmounted() {
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        handleResize() {
            this.tableHeight = window.innerHeight - 300
        },
        async loadUsers() {
            try {
                const params = {
                    page: this.page,
                    limit: this.limit,
                    ...this.searchForm
                }
                const res = await api.users.list(params)
                this.users = res.data.data.list
                this.total = res.data.data.pagination.total
            } catch (error) {
                ElMessage.error('获取用户列表失败')
            }
        },
        handleSearch() {
            this.page = 1
            this.loadUsers()
        },
        resetSearch() {
            this.searchForm = {
                nickname: ''
            }
            this.handleSearch()
        },
        handleSizeChange(val) {
            this.limit = val
            this.loadUsers()
        },
        handleCurrentChange(val) {
            this.page = val
            this.loadUsers()
        },
        async handleDelete(row) {
            try {
                await ElMessageBox.confirm('确定要删除该用户吗？删除后无法恢复！', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                await api.users.delete(row.id)
                ElMessage.success('删除成功')
                this.loadUsers()
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('删除失败')
                }
            }
        },
        beforeAvatarUpload(file) {
            const isImage = file.type.startsWith('image/');
            const isLt5M = file.size / 1024 / 1024 < 5;

            if (!isImage) {
                ElMessage.error('只能上传图片文件!');
                return false;
            }
            if (!isLt5M) {
                ElMessage.error('图片大小不能超过 5MB!');
                return false;
            }
            return true;
        },
        async uploadAvatar(options) {
            try {
                const formData = new FormData();
                formData.append('file', options.file);

                const res = await api.upload.image(formData);
                this.editForm.avatar = res.data.data.url;
                ElMessage.success('上传成功');
            } catch (error) {
                ElMessage.error('上传失败');
                console.error('Upload error:', error);
            }
        },
        handleEdit(row) {
            this.currentUser = row;
            this.editForm = {
                nickname: row.nickname,
                avatar: row.avatar
            };
            this.editDialogVisible = true;
        },
        async submitEdit() {
            try {
                if (!this.editForm.nickname.trim()) {
                    ElMessage.warning('昵称不能为空');
                    return;
                }

                await api.users.update(this.currentUser.id, {
                    nickname: this.editForm.nickname.trim(),
                    avatar: this.editForm.avatar
                });
                
                ElMessage.success('更新成功');
                this.editDialogVisible = false;
                this.loadUsers();
            } catch (error) {
                ElMessage.error('更新失败');
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