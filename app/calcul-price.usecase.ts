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

// NOTE: commentaires crées par moi pas d'IA (pour comprendre au fur et à mésure)


// Test 1 : implémentation pour faire passer le test au vert
// Use case : CalculatePriceUseCase {
//   execute(products) → somme des (price * quantity) pour chaque produit
// }

// Test 4 : implémentation pour faire passer le test au vert
// Use case : CalculatePriceUseCase {
//   execute(products, code) → récupère la réduction via le gateway
//                           → si PERCENTAGE, applique le % sur le total
// }

// Test 5 & 6 : implémentation pour faire passer les tests au vert
// Use case : CalculatePriceUseCase {
//   + si FIXED, soustrait le montant fixe du total, minimum 1€
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

		if (discount.type === "FIXED") {
			return Math.max(1, total - discount.amount);
		}

		return total;
	}
}
