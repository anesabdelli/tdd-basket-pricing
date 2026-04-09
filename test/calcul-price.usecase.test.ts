import { CalculatePriceUseCase } from "@/calcul-price.usecase";
import { beforeEach, describe, expect, test } from "vitest";

class StubReductionGateway {
	public reduction: { type: string; amount: number } | null = null;
	getReductionByCode(_code: string): Promise<{ type: string; amount: number } | null> {
		return Promise.resolve(this.reduction);
	}
}

describe("CalculatePriceUseCase", () => {
	let stubReductionGateway: StubReductionGateway;
	let calculatePrice: CalculatePriceUseCase;

	beforeEach(() => {
		stubReductionGateway = new StubReductionGateway();
		calculatePrice = new CalculatePriceUseCase(stubReductionGateway);
	});

	test("should return the price of one product", async () => {
		const result = await calculatePrice.execute([
			{ name: "shirt", type: "TSHIRT", price: 10, quantity: 1 },
		]);
		expect(result).toBe(10);
	});

	test("should return the sum of two products", async () => {
		const result = await calculatePrice.execute([
			{ name: "shirt", type: "TSHIRT", price: 10, quantity: 1 },
			{ name: "pull", type: "PULL", price: 20, quantity: 1 },
		]);
		expect(result).toBe(30);
	});

	test("should multiply price by quantity", async () => {
		const result = await calculatePrice.execute([
			{ name: "shirt", type: "TSHIRT", price: 10, quantity: 3 },
		]);
		expect(result).toBe(30);
	});
});
