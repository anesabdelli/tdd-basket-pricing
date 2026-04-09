import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { TrashIcon } from "lucide-react";
import { Product } from "../../data/products.ts";
import { Button } from "@/components/ui/button.tsx";

export default function BasketList({
  products,
  onRemoveProduct,
}: {
  products: Product[];
  onRemoveProduct: (productId: string) => void;
}) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Basket</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[150px] sm:table-cell text-center">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Nom du produit</TableHead>
                <TableHead className="hidden md:table-cell text-center">
                  Prix unitaire
                </TableHead>
                <TableHead className="hidden md:table-cell text-center">
                  Quantité
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} data-testid="basket-item">
                  <TableCell className="hidden sm:table-cell w-[64px]">
                    <img
                      alt="Product image"
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.imageUrl}
                      width="64"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="hidden md:table-cell w-[150px] text-center">
                    {product.price} €
                  </TableCell>
                  <TableCell className="hidden md:table-cell w-[150px] text-center">
                    {product.quantity}
                  </TableCell>
                  <TableCell className="w-5 text-center">
                    <Button
                      variant="ghost"
                      aria-label={`remove-${product.id}`}
                      size="icon"
                      onClick={() => onRemoveProduct(product.id)}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
