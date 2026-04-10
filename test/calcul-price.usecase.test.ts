import { CalculatePriceUseCase } from "@/calcul-price.usecase";
import { beforeEach, describe, expect, test } from "vitest";

import type { Discount } from "@/calcul-price.usecase";

class StubReductionGateway {
	public reduction: Discount | null = null;
	getReductionByCode(_code: string): Promise<Discount | null> {
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

	test("should give one free product with BUY_ONE_GET_ONE discount", async () => {
		// Given
		stubReductionGateway.reduction = { type: "BUY_ONE_GET_ONE", productType: "TSHIRT" };

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 10, quantity: 2 }],
			"BOGO",
		);

		// Then
		expect(result).toBe(10);
	});

	test("should apply BUY_ONE_GET_ONE only on the targeted product type", async () => {
		// Given
		stubReductionGateway.reduction = { type: "BUY_ONE_GET_ONE", productType: "TSHIRT" };

		// When
		const result = await calculatePrice.execute(
			[
				{ name: "shirt", type: "TSHIRT", price: 10, quantity: 2 },
				{ name: "pull", type: "PULL", price: 20, quantity: 1 },
			],
			"BOGO",
		);

		// Then
		expect(result).toBe(30);
	});

	test("should not apply discount if cart total is below minimum threshold", async () => {
		// Given
		stubReductionGateway.reduction = { type: "PERCENTAGE", amount: 10, minAmount: 50 };

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 30, quantity: 1 }],
			"PROMO10",
		);

		// Then
		expect(result).toBe(30); 
	});

	test("should apply discount if cart total meets the minimum threshold", async () => {
		// Given
		stubReductionGateway.reduction = { type: "PERCENTAGE", amount: 10, minAmount: 50 };

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 60, quantity: 1 }],
			"PROMO10",
		);

		// Then
		expect(result).toBe(54);
	});
});
