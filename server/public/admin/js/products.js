// 分类管理组件
const Products = {
    template: `
        <div class="app-container">
            <!-- 操作栏 -->
            <div class="bg-white rounded-none shadow-none p-4">
                <div class="flex justify-between items-center">
                    <h2 class="text-lg font-medium text-gray-700">商品列表</h2>
                    <div class="flex gap-2">
                        <el-button 
                            type="danger" 
                            @click="handleClear"
                            class="!bg-red-500 hover:!bg-red-600 border-none">
                            <el-icon class="mr-1"><delete /></el-icon>清空商品
                        </el-button>
                        <el-button 
                            type="success" 
                            @click="handleExport"
                            class="!bg-green-500 hover:!bg-green-600 border-none">
                            <el-icon class="mr-1"><download /></el-icon>导出
                        </el-button>
                        <el-upload
                            class="upload-demo"
                            action="/admin/api/products/import"
                            :show-file-list="false"
                            :on-success="handleImportSuccess"
                            :on-error="handleImportError"
                            accept=".csv">
                            <el-button 
                                type="warning"
                                class="!bg-yellow-500 hover:!bg-yellow-600 border-none">
                                <el-icon class="mr-1"><upload /></el-icon>导入
                            </el-button>
                        </el-upload>
                        <el-button 
                            type="primary" 
                            @click="showAddDialog"
                            class="!bg-blue-500 hover:!bg-blue-600 border-none">
                            <el-icon class="mr-1"><plus /></el-icon>添加商品
                        </el-button>
                    </div>
                </div>
            </div>
            <!-- 搜索和筛选区域 -->
            <div class="bg-white rounded-none shadow-sm p-4">
                <el-form :model="searchForm" class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <el-form-item label="商品名称" class="mb-0">
                        <el-input 
                            v-model="searchForm.name" 
                            placeholder="请输入商品名称"
                            clearable
                            class="!rounded-md">
                        </el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" class="mb-0">
                        <el-select 
                            v-model="searchForm.category_id" 
                            placeholder="请选择分类" 
                            clearable
                            class="w-full !rounded-md">
                            <el-option 
                                v-for="category in categories"
                                :key="category.id"
                                :label="category.name"
                                :value="Number(category.id)">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="商品状态" class="mb-0">
                        <el-select 
                            v-model="searchForm.is_on_sale" 
                            placeholder="请选择状态" 
                            clearable
                            class="w-full !rounded-md">
                            <el-option label="在售" :value="1"></el-option>
                            <el-option label="下架" :value="0"></el-option>
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
            
            <!-- 商品列表 -->
            <div class="bg-white rounded-lg shadow-sm border-1.5 overflow-hidden mx-4 my-4">
                <el-table 
                    :data="products" 
                    style="width: 100%"
                    :max-height="tableHeight"
                    class="!border-none"

                >
                    <el-table-column 
                        prop="merchant_name" 
                        label="商家名称"
                        min-width="120">
                    </el-table-column>
                    <el-table-column 
                        prop="name" 
                        label="商品名称"
                        min-width="180"
                        show-overflow-tooltip>
                        <template #default="scope">
                            <div class="flex items-center gap-2 flex-col">
                                <h2 class="font-medium">{{ scope.row.name }}</h2>
                                <el-button 
                                    size="small" 
                                    type="success" 
                                    @click="handleSpecs(scope.row)"
                                    class="!bg-emerald-500 hover:!bg-emerald-600 border-none">
                                    <el-icon class="mr-1"><list /></el-icon>规格
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column 
                        prop="category_name" 
                        label="所属分类"
                        min-width="120">
                    </el-table-column>
                    <el-table-column 
                        prop="image" 
                        label="商品图片"
                        min-width="100"
                        align="center">
                        <template #default="scope">
                            <el-image 
                                class="rounded-lg shadow-sm"
                                style="width: 50px; height: 50px; object-fit: cover;" 
                                :src="scope.row.image" 
                                :preview-src-list="[scope.row.image]">
                            </el-image>
                        </template>
                    </el-table-column>
                    <el-table-column 
                        label="价格信息" 
                        min-width="180">
                        <template #default="scope">
                            <div class="space-y-1">
                                <div class="text-gray-400 line-through">原价：¥{{scope.row.original_price}}</div>
                                <div class="text-red-500 font-medium">现价：¥{{scope.row.price}}</div>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column 
                        prop="stock" 
                        label="库存"
                        min-width="100"
                        align="center">
                    </el-table-column>
                    <el-table-column 
                        prop="is_on_sale" 
                        label="状态"
                        min-width="100"
                        align="center">
                        <template #default="scope">
                            <el-tag 
                                :type="scope.row.is_on_sale ? 'success' : 'info'" 
                                class="w-16 !border-none"
                                :class="scope.row.is_on_sale ? '!bg-emerald-50 !text-emerald-600' : '!bg-gray-50 !text-gray-600'">
                                {{ scope.row.is_on_sale ? '在售' : '下架' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column 
                        label="操作" 
                        min-width="200"
                        align="center">
                        <template #default="scope">
                            <div class="flex flex-wrap gap-2 justify-center">
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

            <!-- 添加/编辑对话框 -->
            <el-dialog 
                :title="dialogTitle" 
                v-model="dialogVisible"
                width="90%"
                max-width="600px"
                class="rounded-lg">
                <el-form :model="form" label-width="100px">
                    <el-form-item label="商家名称" required>
                        <el-input v-model="form.merchant_name" placeholder="请输入商家名称"></el-input>
                    </el-form-item>
                    <el-form-item label="商品名称" required>
                        <el-input v-model="form.name" placeholder="请输入商品名称"></el-input>
                    </el-form-item>
                    <el-form-item label="所属分类" required>
                        <el-select v-model="form.category_id" placeholder="请选择分类" class="w-full">
                            <el-option 
                                v-for="category in categories"
                                :key="category.id"
                                :label="category.name"
                                :value="category.id">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="商品图片" required>
                        <div class="flex items-center gap-4">
                            <el-upload
                                class="upload-demo"
                                action="#"
                                :http-request="uploadImage"
                                :show-file-list="false"
                                :before-upload="beforeImageUpload">
                                <el-button type="primary">选择图片</el-button>
                            </el-upload>
                            <div v-if="form.image" class="flex-1">
                                <el-image
                                    style="width: 100px; height: 100px"
                                    :src="form.image"
                                    fit="cover"
                                    class="rounded border"
                                    :preview-src-list="[form.image]"
                                />
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item label="价格信息">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm text-gray-500 mb-1">原价</label>
                                <el-input-number 
                                    v-model="form.original_price" 
                                    :precision="2"
                                    :step="0.01"
                                    :min="0"
                                    class="w-full">
                                </el-input-number>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-500 mb-1">现价</label>
                                <el-input-number 
                                    v-model="form.price" 
                                    :precision="2"
                                    :step="0.01"
                                    :min="0"
                                    class="w-full">
                                </el-input-number>
                            </div>
                        </div>
                    </el-form-item>
                    <el-form-item label="库存">
                        <el-input-number 
                            v-model="form.stock" 
                            :min="0"
                            class="w-full">
                        </el-input-number>
                    </el-form-item>
                    <el-form-item label="是否在售">
                        <el-switch 
                            v-model="form.is_on_sale" 
                            :active-value="1" 
                            :inactive-value="0"
                            active-text="在售"
                            inactive-text="下架">
                        </el-switch>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div class="flex gap-2 justify-end">
                        <el-button @click="dialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="handleSubmit">确定</el-button>
                    </div>
                </template>
            </el-dialog>

            <!-- 规格管理对话框 -->
            <el-dialog 
                :title="currentProduct ? currentProduct.name + ' - 规格管理' : '规格管理'" 
                v-model="specsDialogVisible"
                width="90%"
                max-width="700px"
                class="rounded-lg">
                <div class="mb-4">
                    <el-button type="primary" @click="addSpec">
                        <el-icon class="mr-1"><plus /></el-icon>添加规格
                    </el-button>
                </div>
                <el-table :data="specs">
                    <el-table-column prop="name" label="规格名称" min-width="150"></el-table-column>
                    <el-table-column prop="price" label="价格" min-width="100"></el-table-column>
                    <el-table-column prop="stock" label="库存" min-width="100"></el-table-column>
                    <el-table-column label="操作" min-width="150" align="center">
                        <template #default="scope">
                            <div class="flex gap-2 justify-center">
                                <el-button size="small" @click="editSpec(scope.row)">
                                    <el-icon class="mr-1"><edit /></el-icon>编辑
                                </el-button>
                                <el-button size="small" type="danger" @click="deleteSpec(scope.row)">
                                    <el-icon class="mr-1"><delete /></el-icon>删除
                                </el-button>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-dialog>

            <!-- 规格表单对话框 -->
            <el-dialog 
                :title="specForm.id ? '编辑规格' : '添加规格'" 
                v-model="specFormVisible"
                width="90%"
                max-width="500px"
                class="rounded-lg">
                <el-form :model="specForm" label-width="100px">
                    <el-form-item label="规格名称" required>
                        <el-input v-model="specForm.name" placeholder="请输入规格名称"></el-input>
                    </el-form-item>
                    <el-form-item label="价格">
                        <el-input-number 
                            v-model="specForm.price" 
                            :precision="2" 
                            :step="0.01" 
                            :min="0"
                            class="w-full">
                        </el-input-number>
                    </el-form-item>
                    <el-form-item label="库存">
                        <el-input-number 
                            v-model="specForm.stock" 
                            :min="0"
                            class="w-full">
                        </el-input-number>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div class="flex gap-2 justify-end">
                        <el-button @click="specFormVisible = false">取消</el-button>
                        <el-button type="primary" @click="submitSpec">确定</el-button>
                    </div>
                </template>
            </el-dialog>
        </div>
    `,
    data() {
        return {
            products: [],
            categories: [],
            dialogVisible: false,
            dialogTitle: '添加商品',
            form: {
                name: '',
                merchant_name: '',
                category_id: '',
                image: '',
                original_price: 0,
                price: 0,
                stock: 0,
                is_on_sale: 1
            },
            editingId: null,
            searchForm: {
                name: '',
                category_id: null,
                is_on_sale: null
            },
            specs: [],
            specsDialogVisible: false,
            specFormVisible: false,
            currentProduct: null,
            specForm: {
                id: null,
                product_id: null,
                name: '',
                price: 0,
                stock: 0
            },
            tableHeight: window.innerHeight - 300, // 动态计算表格高度
            currentPage: 1,
            pageSize: 10,
            total: 0
        }
    },
    created() {
        this.loadProducts()
        this.loadCategories()
        // 监听窗口大小变化
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
        async loadProducts() {
            try {
                const params = {
                    page: this.currentPage,
                    limit: this.pageSize
                }
                if (this.searchForm.name) {
                    params.name = this.searchForm.name
                }
                if (this.searchForm.category_id !== null) {
                    params.category_id = this.searchForm.category_id
                }
                if (this.searchForm.is_on_sale !== null) {
                    params.is_on_sale = this.searchForm.is_on_sale
                }

                const res = await api.products.list(params)
                this.products = res.data.data.list.map(item => ({
                    ...item,
                    category_id: Number(item.category_id),
                    is_on_sale: Number(item.is_on_sale)
                }))
                this.total = res.data.data.total
            } catch (error) {
                ElementPlus.ElMessage.error('获取商品列表失败')
            }
        },
        async loadCategories() {
            try {
                const res = await api.categories.list()
                this.categories = res.data.data.map(category => ({
                    ...category,
                    id: Number(category.id)
                }))
            } catch (error) {
                ElementPlus.ElMessage.error('获取分类列表失败')
            }
        },
        showAddDialog() {
            this.dialogTitle = '添加商品'
            this.form = {
                name: '',
                merchant_name: '',
                category_id: '',
                image: '',
                original_price: 0,
                price: 0,
                stock: 0,
                is_on_sale: 1
            }
            this.editingId = null
            this.dialogVisible = true
        },
        handleEdit(row) {
            this.dialogTitle = '编辑商品'
            this.form = {
                ...row,
                merchant_name: row.merchant_name || '',
                original_price: Number(row.original_price),
                price: Number(row.price),
                stock: Number(row.stock),
                is_on_sale: Number(row.is_on_sale)
            }
            this.editingId = row.id
            this.dialogVisible = true
        },
        async handleDelete(row) {
            try {
                await ElementPlus.ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                })
                await api.products.delete(row.id)
                ElementPlus.ElMessage.success('删除成功')
                this.loadProducts()
            } catch (error) {
                if (error !== 'cancel') {
                    ElementPlus.ElMessage.error('删除失败')
                }
            }
        },
        async handleSubmit() {
            try {
                if (!this.form.name || !this.form.category_id || !this.form.price) {
                    ElMessage.warning('请填写必要信息')
                    return
                }

                if (this.editingId) {
                    await api.products.update(this.editingId, this.form)
                    ElMessage.success('更新成功')
                } else {
                    await api.products.add(this.form)
                    ElMessage.success('添加成功')
                }
                this.dialogVisible = false
                this.loadProducts()
            } catch (error) {
                ElMessage.error(this.editingId ? '更新失败' : '添加失败')
            }
        },
        handleSearch() {
            this.loadProducts()
        },
        resetSearch() {
            this.searchForm = {
                name: '',
                category_id: null,
                is_on_sale: null
            }
            this.loadProducts()
        },
        async handleSpecs(row) {
            this.currentProduct = row
            this.specsDialogVisible = true
            await this.loadSpecs(row.id)
        },
        async loadSpecs(productId) {
            try {
                const res = await api.specs.list(productId)
                this.specs = res.data.data
            } catch (error) {
                ElMessage.error('获取规格列表失败')
            }
        },
        addSpec() {
            this.specForm = {
                id: null,
                product_id: this.currentProduct.id,
                name: '',
                price: 0,
                stock: 0
            }
            this.specFormVisible = true
        },
        editSpec(row) {
            this.specForm = { ...row }
            this.specFormVisible = true
        },
        async deleteSpec(row) {
            try {
                await ElMessageBox.confirm('确定要删除该规格吗？')
                await api.specs.delete(row.id)
                ElMessage.success('删除成功')
                this.loadSpecs(this.currentProduct.id)
            } catch (error) {
                if (error !== 'cancel') {
                    ElMessage.error('删除失败')
                }
            }
        },
        async submitSpec() {
            try {
                if (!this.specForm.name) {
                    ElMessage.warning('请输入规格名称')
                    return
                }

                if (this.specForm.id) {
                    await api.specs.update(this.specForm.id, this.specForm)
                    ElMessage.success('更新成功')
                } else {
                    await api.specs.add(this.specForm)
                    ElMessage.success('添加成功')
                }
                this.specFormVisible = false
                this.loadSpecs(this.currentProduct.id)
            } catch (error) {
                ElMessage.error(this.specForm.id ? '更新失败' : '添加失败')
            }
        },
        beforeImageUpload(file) {
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
        async uploadImage(options) {
            try {
                const formData = new FormData();
                formData.append('file', options.file);

                const res = await api.upload.image(formData);
                this.form.image = res.data.data.url;
                ElMessage.success('上传成功');
            } catch (error) {
                ElMessage.error('上传失败');
                console.error('Upload error:', error);
            }
        },
        handleSizeChange(newSize) {
            this.pageSize = newSize;
            this.loadProducts();
        },
        handleCurrentChange(newPage) {
            this.currentPage = newPage;
            this.loadProducts();
        },
        async handleExport() {
            try {
                window.location.href = '/admin/api/products/export';
            } catch (error) {
                ElMessage.error('导出失败');
            }
        },
        handleImportSuccess() {
            ElMessage.success('导入成功');
            this.loadProducts();
        },
        handleImportError() {
            ElMessage.error('导入失败');
        },
        async handleClear() {
            try {
                await ElementPlus.ElMessageBox.confirm(
                    '确定要清空所有商品数据吗？此操作将删除所有商品及其规格数据，且不可恢复！',
                    '警告',
                    {
                        confirmButtonText: '确定清空',
                        cancelButtonText: '取消',
                        type: 'warning',
                        confirmButtonClass: 'el-button--danger',
                        draggable: true,
                    }
                );

                await api.products.clear();
                ElementPlus.ElMessage.success('商品数据已清空');
                this.loadProducts();
            } catch (error) {
                if (error !== 'cancel') {
                    ElementPlus.ElMessage.error('清空失败');
                }
            }
        }
    },
    mounted() {
        // 添加自定义样式
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