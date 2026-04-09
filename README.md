## Interview

### Setup

```bash

npm i
npm run dev
# ou
npm run test

cd frontend
npm i
npm run dev
```

### Objectif

On cherche à calculer le prix d'un panier lors d'une commande en ligne. La commande contient un panier avec des articles, et un ou plusieurs codes promo.  
**On veut donc créer la fonction permettant de déterminer le prix final du panier sur lequel est appliqué un ou plusieurs codes promo.**

Les codes promo peuvent être de plusieurs types :

- Une réduction en pourcentage (-10% sur la commande)
- Une réduction fixe (30€ d'offert) min 1€ la commande
- Un produit acheté, un produit offert (ex : un t-shirt acheté = un t-shirt offert).

- Black Friday

  - 50% sur tout le panier
  - Uniquement entre le vendredi 00h00 et le lundi 23h59 du week-end du Black Friday le 2025-28-11 au 2025-30-11.
  - Ne peut pas amener le total en dessous de 1 euro.
  - Cumulable avec d’autres promotions

Les réductions s’appliquent dans l’ordre défini par l’entreprise : d’abord les promos “produit”, ensuite les promos fixes/%, et enfin Black Friday.

Ils peuvent aussi avoir des conditions d'applications :

- Un code promo peut s’appliquer uniquement sur certains types de produits (exemple : uniquement sur les t-shirts)
- Réduction si la commande dépasse x€ (exemple : -10% dès 30 € d’achats)
- Un code promo ne doit jamais faire descendre le total sous 0.

**TLDR**:

- Calculer le montant final du panier après l'application des coupons dans le back
- Utiliser l'API dans le front

# BaBack-test
