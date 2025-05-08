export interface Model {
    id: number;
    brand: number;
    brand_name: string;
    name: string;
    description: string | null;
    release_date: string | null;
}
declare const modelService: {
    getAllModels: () => Promise<any>;
    getModelsByBrand: (brandId: number) => Promise<any>;
    getModelById: (id: number) => Promise<any>;
    createModel: (modelData: Partial<Model>) => Promise<any>;
    updateModel: (id: number, modelData: Partial<Model>) => Promise<any>;
    deleteModel: (id: number) => Promise<any>;
};
export default modelService;
