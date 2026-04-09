import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "../ui/button.tsx";
import { PlusCircle } from "lucide-react";
import { Input } from "../ui/input.tsx";
import { availableDiscountCodes } from "@/data/discounts.ts";

export default function BasketTotal({
  subtotal,
  totalPrice,
  appliedCoupon,
  onAddCoupon,
  onRemoveCoupon,
}: {
  subtotal: number;
  totalPrice: number | null;
  appliedCoupon: string;
  onAddCoupon: (couponCode: string) => void;
  onRemoveCoupon: () => void;
}) {
  const [couponInput, setCouponInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCoupons = availableDiscountCodes.filter(
    (coupon) =>
      couponInput &&
      coupon.toLowerCase().includes(couponInput.toLowerCase()) &&
      coupon !== appliedCoupon
  );

  useEffect(() => {
    setShowSuggestions(filteredCoupons.length > 0 && couponInput.length > 0);
    setSelectedIndex(-1);
  }, [couponInput, filteredCoupons.length]);

  const handleAddCoupon = (code?: string) => {
    if (appliedCoupon) return; // Ne pas ajouter si un coupon est déjà appliqué
    const codeToAdd = code || couponInput;
    if (codeToAdd.trim()) {
      onAddCoupon(codeToAdd);
      setCouponInput("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === "Enter") {
        handleAddCoupon();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCoupons.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredCoupons.length) {
          handleAddCoupon(filteredCoupons[selectedIndex]);
        } else {
          handleAddCoupon();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const displayTotal = totalPrice !== null ? totalPrice : subtotal;
  return (
    <Card className="self-end w-full max-w-[400px]">
      <CardHeader>
        <CardTitle>Total</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex justify-between">
          <span>Sous-total</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div className="relative">
          <div className="flex justify-between gap-1">
            <Input
              ref={inputRef}
              className="h-6"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Code promo"
              onKeyDown={handleKeyDown}
              onFocus={() =>
                setShowSuggestions(
                  filteredCoupons.length > 0 && couponInput.length > 0
                )
              }
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              disabled={!!appliedCoupon}
            />
            <Button
              size="sm"
              className="h-6 gap-1"
              onClick={() => handleAddCoupon()}
              disabled={!!appliedCoupon}
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Ajouter un coupon
              </span>
            </Button>
          </div>
          {showSuggestions && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredCoupons.map((coupon, index) => (
                <div
                  key={coupon}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                    index === selectedIndex ? "bg-gray-100" : ""
                  }`}
                  onClick={() => handleAddCoupon(coupon)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="font-medium text-sm">{coupon}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {appliedCoupon && (
          <div className="flex justify-between">
            <span>Coupon appliqué</span>
            <div className="flex gap-1 flex-wrap justify-end">
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={onRemoveCoupon}
              >
                {appliedCoupon} ✕
              </Badge>
            </div>
          </div>
        )}
        <hr />
        <div className="flex justify-between">
          <span>Montant final</span>
          <span className="font-bold">{(displayTotal || 0).toFixed(2)} €</span>
        </div>
      </CardContent>
    </Card>
  );
}
