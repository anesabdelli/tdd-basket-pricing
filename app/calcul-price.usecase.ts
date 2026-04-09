export type ProductsType = "TSHIRT" | "PULL";

export type Product = {
	name: string;
	quantity: number;
	type: ProductsType;
	price: number;
};

export type Discount = {
	type: string;
	amount?: number;
	productType?: ProductsType;
};

export interface ReductionGateway {
	getReductionByCode(code: string): Promise<Discount | null>;
}

// NOTE: commentaires crées par moi pas d'IA (pour comprendre au fur et à mésure)


// Test 1 & 2 & 3 : implémentation pour faire passer le test au vert
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

// Test 7 & 8 : implémentation pour faire passer les tests au vert
// Use case : CalculatePriceUseCase {
//   + si BUY_ONE_GET_ONE, pour chaque paire de produits du type ciblé, un est offert
// }

export class CalculatePriceUseCase {
	constructor(private reductionGateway: ReductionGateway) {}

	async execute(products: Product[], code?: string): Promise<number> {
		if (!code) {
			return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
		}

		const discount = await this.reductionGateway.getReductionByCode(code);
		if (!discount) {
			return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
		}

		if (discount.type === "BUY_ONE_GET_ONE" && discount.productType) {
			const total = products.reduce((sum, p) => {
				if (p.type === discount.productType) {
					const paidQuantity = Math.ceil(p.quantity / 2);
					return sum + p.price * paidQuantity;
				}
				return sum + p.price * p.quantity;
			}, 0);
			return total;
		}

		const total = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

		if (discount.type === "PERCENTAGE" && discount.amount !== undefined) {
			return total * (1 - discount.amount / 100);
		}

		if (discount.type === "FIXED" && discount.amount !== undefined) {
			return Math.max(1, total - discount.amount);
		}

		return total;
	}
}
