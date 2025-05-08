export interface Brand {
    id: number;
    name: string;
    origin_country: string | null;
    picture: string | null;
    description: string | null;
    website: string | null;
}
declare const brandService: {
    getAllBrands: () => Promise<any>;
    getBrandById: (id: number) => Promise<any>;
    createBrand: (brandData: FormData) => Promise<any>;
    updateBrand: (id: number, brandData: FormData) => Promise<any>;
    deleteBrand: (id: number) => Promise<any>;
};
export default brandService;
