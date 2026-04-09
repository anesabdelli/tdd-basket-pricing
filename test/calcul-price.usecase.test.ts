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

	test("should apply a percentage discount", async () => {
		// Given
		stubReductionGateway.reduction = { type: "PERCENTAGE", amount: 10 };

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 100, quantity: 1 }],
			"PROMO10",
		);

		// Then
		expect(result).toBe(90);
	});

	// Test 5 : réduction fixe
	test("should apply a fixed discount", async () => {
		// Given
		stubReductionGateway.reduction = { type: "FIXED", amount: 30 };

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 100, quantity: 1 }],
			"PROMO30",
		);

		// Then
		expect(result).toBe(70);
	});

	// Test 6 : réduction fixe ne peut pas descendre sous 1€
	test("should not go below 1€ with a fixed discount", async () => {
		// Given
		stubReductionGateway.reduction = { type: "FIXED", amount: 150 };

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 100, quantity: 1 }],
			"PROMO150",
		);

		// Then
		expect(result).toBe(1);
	});
});
