export type ProductsType = "TSHIRT" | "PULL";

export type Product = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: ProductsType;
  description: string;
  imageUrl: string;
};

export const productsStub: Product[] = [
  {
    id: "1",
    name: "Microphone",
    price: 30.0,
    quantity: 1,
    type: "TSHIRT",
    description:
      "Un super microphone pour enregistrer des podcasts ou des vidéos.",
    imageUrl: "https://prd.place/400?id=12",
  },
  {
    id: "2",
    name: "Cadre",
    price: 20.0,
    quantity: 2,

    type: "PULL",
    description: "Un cadre pour mettre une photo de famille.",
    imageUrl: "https://prd.place/400?id=24",
  },
  {
    id: "3",
    name: "Voiture",
    price: 10.0,
    quantity: 1,
    type: "TSHIRT",
    description: "Une voiture télécommandée pour jouer avec les enfants.",
    imageUrl: "https://prd.place/400?id=36",
  },
];
