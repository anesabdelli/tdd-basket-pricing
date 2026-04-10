import type { Discount } from "@/calcul-price.usecase";
import { CalculatePriceUseCase } from "@/calcul-price.usecase";
import { beforeEach, describe, expect, test } from "vitest";

// Stub : contrôle ce que le gateway retourne par code
class StubReductionGateway {
	public reductions = new Map<string, Discount>();
	getReductionByCode(code: string): Promise<Discount | null> {
		return Promise.resolve(this.reductions.get(code) ?? null);
	}
}

// Stub : contrôle la date courante pour les tests Black Friday
class StubDateProvider {
	public currentDate: Date = new Date();
	now(): Date {
		return this.currentDate;
	}
}

describe("CalculatePriceUseCase", () => {
	let stubReductionGateway: StubReductionGateway;
	let stubDateProvider: StubDateProvider;
	let calculatePrice: CalculatePriceUseCase;

	beforeEach(() => {
		stubReductionGateway = new StubReductionGateway();
		stubDateProvider = new StubDateProvider();
		calculatePrice = new CalculatePriceUseCase(stubReductionGateway, stubDateProvider);
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
		stubReductionGateway.reductions.set("PROMO10", { type: "PERCENTAGE", amount: 10 });

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 100, quantity: 1 }],
			["PROMO10"],
		);

		// Then
		expect(result).toBe(90);
	});

	test("should apply a fixed discount", async () => {
		// Given
		stubReductionGateway.reductions.set("PROMO30", { type: "FIXED", amount: 30 });

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 100, quantity: 1 }],
			["PROMO30"],
		);

		// Then
		expect(result).toBe(70);
	});

	test("should not go below 1€ with a fixed discount", async () => {
		// Given
		stubReductionGateway.reductions.set("PROMO150", { type: "FIXED", amount: 150 });

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 100, quantity: 1 }],
			["PROMO150"],
		);

		// Then
		expect(result).toBe(1);
	});

	test("should give one free product with BUY_ONE_GET_ONE discount", async () => {
		// Given
		stubReductionGateway.reductions.set("BOGO", { type: "BUY_ONE_GET_ONE", productType: "TSHIRT" });

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 10, quantity: 2 }],
			["BOGO"],
		);

		// Then
		expect(result).toBe(10);
	});

	test("should apply BUY_ONE_GET_ONE only on the targeted product type", async () => {
		// Given
		stubReductionGateway.reductions.set("BOGO", { type: "BUY_ONE_GET_ONE", productType: "TSHIRT" });

		// When
		const result = await calculatePrice.execute(
			[
				{ name: "shirt", type: "TSHIRT", price: 10, quantity: 2 },
				{ name: "pull", type: "PULL", price: 20, quantity: 1 },
			],
			["BOGO"],
		);

		// Then
		expect(result).toBe(30);
	});

	test("should not apply discount if cart total is below minimum threshold", async () => {
		// Given
		stubReductionGateway.reductions.set("PROMO10", { type: "PERCENTAGE", amount: 10, minAmount: 50 });

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 30, quantity: 1 }],
			["PROMO10"],
		);

		// Then
		expect(result).toBe(30);
	});

	test("should apply discount if cart total meets the minimum threshold", async () => {
		// Given
		stubReductionGateway.reductions.set("PROMO10", { type: "PERCENTAGE", amount: 10, minAmount: 50 });

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 60, quantity: 1 }],
			["PROMO10"],
		);

		// Then
		expect(result).toBe(54);
	});

	test("should apply 50% Black Friday discount during BF weekend", async () => {
		// Given
		stubDateProvider.currentDate = new Date("2025-11-28T12:00:00"); // vendredi BF
		stubReductionGateway.reductions.set("BF2025", { type: "BLACK_FRIDAY" });

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 100, quantity: 1 }],
			["BF2025"],
		);

		// Then
		expect(result).toBe(50);
	});

	test("should not apply Black Friday discount outside BF weekend", async () => {
		// Given
		stubDateProvider.currentDate = new Date("2025-11-27T23:59:00"); // veille du BF
		stubReductionGateway.reductions.set("BF2025", { type: "BLACK_FRIDAY" });

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 100, quantity: 1 }],
			["BF2025"],
		);

		// Then
		expect(result).toBe(100);
	});

	test("should not go below 1€ with Black Friday discount", async () => {
		// Given
		stubDateProvider.currentDate = new Date("2025-11-29T10:00:00"); // samedi BF
		stubReductionGateway.reductions.set("BF2025", { type: "BLACK_FRIDAY" });

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 1, quantity: 1 }],
			["BF2025"],
		);

		// Then
		expect(result).toBe(1);
	});

	test("should stack Black Friday discount after other discounts", async () => {
		// Given
		stubDateProvider.currentDate = new Date("2025-11-28T12:00:00");
		stubReductionGateway.reductions.set("PROMO10", { type: "PERCENTAGE", amount: 10 });
		stubReductionGateway.reductions.set("BF2025", { type: "BLACK_FRIDAY" });

		// When
		const result = await calculatePrice.execute(
			[{ name: "shirt", type: "TSHIRT", price: 100, quantity: 1 }],
			["PROMO10", "BF2025"],
		);

		// Then
		expect(result).toBe(45); // 100 -10% = 90, puis BF 50% = 45
	});
});
