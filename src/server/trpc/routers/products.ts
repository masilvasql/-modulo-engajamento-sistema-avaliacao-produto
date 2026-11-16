import "server-only";

import {
  createProductSchema,
  listProductsSchema,
} from "@/lib/validations/products";
import { createProduct } from "@/server/products/create-product";
import { listProducts } from "@/server/products/list-products";
import { publicProcedure, router } from "@/server/trpc/init";

export const productsRouter = router({
  list: publicProcedure
    .input(listProductsSchema)
    .query(({ input }) => listProducts(input)),
  // Pública: qualquer cliente pode cadastrar produtos (POST /api/v1/products).
  create: publicProcedure
    .input(createProductSchema)
    .mutation(({ input }) => createProduct(input)),
});
