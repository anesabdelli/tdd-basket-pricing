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
	minAmount?: number;
};

export interface ReductionGateway {
	getReductionByCode(code: string): Promise<Discount | null>;
}

export interface DateProvider {
	now(): Date;
}

// NOTE: commentaires crées par moi pas d'IA (pour comprendre au fur et à mésure)

// Test 1 & 2 & 3 : implémentation pour faire passer le test au vert
// Use case : CalculatePriceUseCase {
//   execute(products) → somme des (price * quantity) pour chaque produit
// }

// Test 4 : implémentation pour faire passer le test au vert
// Use case : CalculatePriceUseCase {
//   execute(products, codes) → récupère la réduction via le gateway
//                            → si PERCENTAGE, applique le % sur le total
// }

// Test 5 & 6 : implémentation pour faire passer les tests au vert
// Use case : CalculatePriceUseCase {
//   + si FIXED, soustrait le montant fixe du total, minimum 1€
// }

// Test 7 & 8 : implémentation pour faire passer les tests au vert
// Use case : CalculatePriceUseCase {
//   + si BUY_ONE_GET_ONE, pour chaque paire de produits du type ciblé, un est offert
// }

// Test 9 & 10 : implémentation pour faire passer les tests au vert
// Use case : CalculatePriceUseCase {
//   + si minAmount défini et total < minAmount → pas de réduction
// }

// Test 11 &12 & 13 & 14 : implmentation pour faire passer les tests au vert
// Use case : CalculatePriceUseCase {
//   + execute accepte plusieurs codes string[]
//   + inject DateProvider pour contrpler la date
//   + ordre d'application : BUY_ONE_GET_ONE → PERCENTAGE/FIXED → BLACK_FRIDAY
//   + BLACK_FRIDAY : 50% uniquement du 2025-11-28 au 2025-12-01, minimum 1€, cumulable
// }

const BLACK_FRIDAY_START = new Date("2025-11-28T00:00:00");
const BLACK_FRIDAY_END = new Date("2025-12-01T23:59:59");

export class CalculatePriceUseCase {
	constructor(
		private reductionGateway: ReductionGateway,
		private dateProvider: DateProvider,
	) {}

	async execute(products: Product[], codes: string[] = []): Promise<number> {
		const discounts = (
			await Promise.all(codes.map((code) => this.reductionGateway.getReductionByCode(code)))
		).filter((d): d is Discount => d !== null);

		const bogoDiscounts = discounts.filter((d) => d.type === "BUY_ONE_GET_ONE");
		const regularDiscounts = discounts.filter((d) => d.type === "PERCENTAGE" || d.type === "FIXED");
		const blackFridayDiscounts = discounts.filter((d) => d.type === "BLACK_FRIDAY");

		// promos produit
		let total = products.reduce((sum, p) => {
			const bogo = bogoDiscounts.find((d) => d.productType === p.type);
			if (bogo) {
				return sum + p.price * Math.ceil(p.quantity / 2);
			}
			return sum + p.price * p.quantity;
		}, 0);

		// réductions fixes / pourcentage
		for (const discount of regularDiscounts) {
			if (discount.minAmount !== undefined && total < discount.minAmount) continue;

			if (discount.type === "PERCENTAGE" && discount.amount !== undefined) {
				total = total * (1 - discount.amount / 100);
			} else if (discount.type === "FIXED" && discount.amount !== undefined) {
				total = Math.max(1, total - discount.amount);
			}
		}

		// Black Friday (en dernier, cumulable)
		if (blackFridayDiscounts.length > 0 && this.isBlackFridayPeriod()) {
			total = Math.max(1, total * 0.5);
		}

		return total;
	}

	private isBlackFridayPeriod(): boolean {
		const now = this.dateProvider.now();
		return now >= BLACK_FRIDAY_START && now <= BLACK_FRIDAY_END;
	}
}
