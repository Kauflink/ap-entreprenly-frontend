const LotList           = () => import('./views/lists/lot-list.vue');
const UnitLotList       = () => import('./views/lists/unit-lot-list.vue');
const WeightLotList     = () => import('./views/lists/weight-lot-list.vue');
const ProductList       = () => import('./views/lists/product-list.vue');
const UnitProductList   = () => import('./views/lists/unit-product-list.vue');
const WeightProductList = () => import('./views/lists/weight-product-list.vue');
const UnitLotForm       = () => import('./views/forms/unit-lot-form.vue');
const WeightLotForm     = () => import('./views/forms/weight-lot-form.vue');
const ProductForm       = () => import('./views/forms/product-form.vue');
const UnitProductForm   = () => import('./views/forms/unit-product-form.vue');
const WeightProductForm = () => import('./views/forms/weight-product-form.vue');

const dash = { layout: 'dashboard' };

const inventoryRoutes = [
    {
        path: 'inventory-lots', name: 'inventory-lots', component: LotList, meta: { titleKey: 'pages.lots', ...dash },
        children: [
            { path: 'unit-lot/new',        name: 'inventory-unit-lot-create',   component: UnitLotForm,   meta: { titleKey: 'pages.newLot',  ...dash } },
            { path: 'unit-lot/:id/edit',   name: 'inventory-unit-lot-update',   component: UnitLotForm,   meta: { titleKey: 'pages.editLot', ...dash } },
            { path: 'weight-lot/new',      name: 'inventory-weight-lot-create', component: WeightLotForm, meta: { titleKey: 'pages.newLot',  ...dash } },
            { path: 'weight-lot/:id/edit', name: 'inventory-weight-lot-update', component: WeightLotForm, meta: { titleKey: 'pages.editLot', ...dash } },
        ],
    },

    {
        path: 'inventory-unit-lots', name: 'inventory-unit-lots', component: UnitLotList, meta: { titleKey: 'pages.unitLots', ...dash },
        children: [
            { path: 'new',      name: 'inventory-unit-lots-list-new',  component: UnitLotForm, meta: { titleKey: 'pages.newLot',  ...dash } },
            { path: ':id/edit', name: 'inventory-unit-lots-list-edit', component: UnitLotForm, meta: { titleKey: 'pages.editLot', ...dash } },
        ],
    },

    {
        path: 'inventory-weight-lots', name: 'inventory-weight-lots', component: WeightLotList, meta: { titleKey: 'pages.weightLots', ...dash },
        children: [
            { path: 'new',      name: 'inventory-weight-lots-list-new',  component: WeightLotForm, meta: { titleKey: 'pages.newLot',  ...dash } },
            { path: ':id/edit', name: 'inventory-weight-lots-list-edit', component: WeightLotForm, meta: { titleKey: 'pages.editLot', ...dash } },
        ],
    },

    {
        path: 'inventory-products', name: 'inventory-products', component: ProductList, meta: { titleKey: 'pages.products', ...dash },
        children: [
            { path: 'new',             name: 'inventory-products-new',         component: ProductForm,       meta: { titleKey: 'pages.newProduct',  ...dash } },
            { path: ':id/edit',        name: 'inventory-products-edit',        component: ProductForm,       meta: { titleKey: 'pages.editProduct', ...dash } },
            { path: 'unit/new',        name: 'inventory-unit-products-new',    component: UnitProductForm,   meta: { titleKey: 'pages.newProduct',  ...dash } },
            { path: 'unit/:id/edit',   name: 'inventory-unit-products-edit',   component: UnitProductForm,   meta: { titleKey: 'pages.editProduct', ...dash } },
            { path: 'weight/new',      name: 'inventory-weight-products-new',  component: WeightProductForm, meta: { titleKey: 'pages.newProduct',  ...dash } },
            { path: 'weight/:id/edit', name: 'inventory-weight-products-edit', component: WeightProductForm, meta: { titleKey: 'pages.editProduct', ...dash } },
        ],
    },

    { path: 'inventory-unit-products',   name: 'inventory-unit-products',   component: UnitProductList,   meta: { titleKey: 'pages.unitProducts',   ...dash } },
    { path: 'inventory-weight-products', name: 'inventory-weight-products', component: WeightProductList, meta: { titleKey: 'pages.weightProducts', ...dash } },
];

export default inventoryRoutes;
