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

// Test 4 : implémentation pour faire passer le test au vert
// Use case : CalculatePriceUseCase {
//   execute(products, code) → récupère la réduction via le gateway
//                           → si PERCENTAGE, applique le % sur le total
// }

export class CalculatePriceUseCase {
	constructor(private reductionGateway: ReductionGateway) {}

	async execute(products: Product[], code?: string): Promise<number> {
		const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

		if (!code) return total;

		const discount = await this.reductionGateway.getReductionByCode(code);
		if (!discount) return total;

		if (discount.type === "PERCENTAGE") {
			return total * (1 - discount.amount / 100);
		}

		return total;
	}
}
