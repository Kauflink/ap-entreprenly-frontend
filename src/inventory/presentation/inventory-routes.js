const LotList          = () => import('./views/lists/lot-list.vue');
const UnitLotList      = () => import('./views/lists/unit-lot-list.vue');
const WeightLotList    = () => import('./views/lists/weight-lot-list.vue');
const ProductList      = () => import('./views/lists/product-list.vue');
const UnitProductList  = () => import('./views/lists/unit-product-list.vue');
const WeightProductList= () => import('./views/lists/weight-product-list.vue');
const UnitLotForm      = () => import('./views/forms/unit-lot-form.vue');
const WeightLotForm    = () => import('./views/forms/weight-lot-form.vue');
const ProductForm      = () => import('./views/forms/product-form.vue');
const UnitProductForm  = () => import('./views/forms/unit-product-form.vue');
const WeightProductForm= () => import('./views/forms/weight-product-form.vue');

const dash = { layout: 'dashboard' };

const inventoryRoutes = [
    {
        path: 'inventory-lots', name: 'inventory-lots', component: LotList, meta: { title: 'Inventory', ...dash },
        children: [
            // Forms opened directly from lot-list (lot-list stays in background)
            { path: 'unit-lot/new',        name: 'inventory-unit-lot-create',   component: UnitLotForm,   meta: { title: 'New Unit Lot',    ...dash } },
            { path: 'unit-lot/:id/edit',   name: 'inventory-unit-lot-update',   component: UnitLotForm,   meta: { title: 'Edit Unit Lot',   ...dash } },
            { path: 'weight-lot/new',      name: 'inventory-weight-lot-create', component: WeightLotForm, meta: { title: 'New Weight Lot',  ...dash } },
            { path: 'weight-lot/:id/edit', name: 'inventory-weight-lot-update', component: WeightLotForm, meta: { title: 'Edit Weight Lot', ...dash } },
        ],
    },

    // Unit lot list — standalone page (dashboard sidebar stays visible)
    {
        path: 'inventory-unit-lots', name: 'inventory-unit-lots', component: UnitLotList, meta: { title: 'Unit Lots', ...dash },
        children: [
            { path: 'new',      name: 'inventory-unit-lots-list-new',  component: UnitLotForm, meta: { title: 'New Unit Lot',  ...dash } },
            { path: ':id/edit', name: 'inventory-unit-lots-list-edit', component: UnitLotForm, meta: { title: 'Edit Unit Lot', ...dash } },
        ],
    },

    // Weight lot list — standalone page (dashboard sidebar stays visible)
    {
        path: 'inventory-weight-lots', name: 'inventory-weight-lots', component: WeightLotList, meta: { title: 'Weight Lots', ...dash },
        children: [
            { path: 'new',      name: 'inventory-weight-lots-list-new',  component: WeightLotForm, meta: { title: 'New Weight Lot',  ...dash } },
            { path: ':id/edit', name: 'inventory-weight-lots-list-edit', component: WeightLotForm, meta: { title: 'Edit Weight Lot', ...dash } },
        ],
    },

    {
        path: 'inventory-products', name: 'inventory-products', component: ProductList, meta: { title: 'Products', ...dash },
        children: [
            { path: 'new',             name: 'inventory-products-new',         component: ProductForm,       meta: { title: 'New Product',        ...dash } },
            { path: ':id/edit',        name: 'inventory-products-edit',        component: ProductForm,       meta: { title: 'Edit Product',       ...dash } },
            { path: 'unit/new',        name: 'inventory-unit-products-new',    component: UnitProductForm,   meta: { title: 'New Unit Product',   ...dash } },
            { path: 'unit/:id/edit',   name: 'inventory-unit-products-edit',   component: UnitProductForm,   meta: { title: 'Edit Unit Product',  ...dash } },
            { path: 'weight/new',      name: 'inventory-weight-products-new',  component: WeightProductForm, meta: { title: 'New Weight Product', ...dash } },
            { path: 'weight/:id/edit', name: 'inventory-weight-products-edit', component: WeightProductForm, meta: { title: 'Edit Weight Product',...dash } },
        ],
    },

    { path: 'inventory-unit-products',   name: 'inventory-unit-products',   component: UnitProductList,   meta: { title: 'Unit Products',   ...dash } },
    { path: 'inventory-weight-products', name: 'inventory-weight-products', component: WeightProductList, meta: { title: 'Weight Products', ...dash } },
];

export default inventoryRoutes;
