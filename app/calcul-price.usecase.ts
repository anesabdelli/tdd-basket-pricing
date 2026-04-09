export type ProductsType = "TSHIRT" | "PULL";

export type Product = {
	name: string;
	quantity: number;
	type: ProductsType;
	price: number;
};

export type Discount = {
	type: string;
	amount: number;
};

export interface ReductionGateway {
	getReductionByCode(code: string): Promise<Discount | null>;
}

// Test 1 : implémentation pour faire passer le test au vert
// Use case : CalculatePriceUseCase {
//   execute(products) → somme des (price * quantity) pour chaque produit
// }

export class CalculatePriceUseCase {
	constructor(private _reductionGateway: ReductionGateway) {}

	async execute(products: Product[], _code?: string): Promise<number> {
		return products.reduce((total, p) => total + p.price * p.quantity, 0);
	}
}
