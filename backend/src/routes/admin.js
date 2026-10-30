import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../auth/middleware.js';
import {
  categorySchema,
  parseBody,
  productSchema,
  settingsSchema,
} from '../lib/validation.js';
import {
  clearProductImage,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  getProduct,
  listCategories,
  listProducts,
  readSettings,
  setProductImage,
  updateCategory,
  updateProduct,
  updateSettings,
} from '../services/admin.js';
import {
  deleteProductImage,
  saveProductImage,
  uploadImage,
} from '../services/uploads.js';
import { HttpError } from '../lib/errors.js';

/** Lê :id como inteiro positivo; qualquer outra coisa é 404, não erro de SQL. */
function idParam(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(404, 'not_found', 'Registro não encontrado.');
  }
  return id;
}

/** Traduz erros do multer para o mesmo formato de erro da API. */
function multipart(req, res) {
  return new Promise((resolve, reject) => {
    uploadImage(req, res, (error) => {
      if (!error) return resolve();
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return reject(new HttpError(413, 'payload_too_large', 'A imagem deve ter no máximo 5 MB.'));
        }
        return reject(new HttpError(400, 'bad_upload', 'Não foi possível ler o arquivo enviado.'));
      }
      return reject(error);
    });
  });
}

export function adminRoutes(db) {
  const router = Router();

  // Tudo abaixo do /api/admin exige sessão válida.
  router.use(requireAuth(db));

  /* Produtos ------------------------------------------------------------- */

  router.get('/products', (req, res) => {
    const { q = '', category = '', status = 'all' } = req.query;
    const safeStatus = ['all', 'active', 'inactive'].includes(status) ? status : 'all';

    res.json({
      products: listProducts(db, {
        q: String(q).slice(0, 80),
        category: String(category).slice(0, 60),
        status: safeStatus,
      }),
    });
  });

  router.get('/products/:id', (req, res) => {
    res.json({ product: getProduct(db, idParam(req.params.id)) });
  });

  router.post('/products', (req, res) => {
    const input = parseBody(productSchema, req.body);
    res.status(201).json({ product: createProduct(db, input) });
  });

  router.put('/products/:id', (req, res) => {
    const input = parseBody(productSchema, req.body);
    res.json({ product: updateProduct(db, idParam(req.params.id), input) });
  });

  router.delete('/products/:id', async (req, res) => {
    const { image } = deleteProduct(db, idParam(req.params.id));
    await deleteProductImage(image);
    res.status(204).end();
  });

  /* Imagem do produto ---------------------------------------------------- */

  router.post('/products/:id/image', async (req, res) => {
    const id = idParam(req.params.id);
    const product = getProduct(db, id);

    await multipart(req, res);
    const filename = await saveProductImage(req.file);

    try {
      const updated = setProductImage(db, id, filename);
      // Só apaga a antiga depois que a troca foi gravada.
      await deleteProductImage(product.image);
      res.status(201).json({ product: updated });
    } catch (error) {
      // Se o banco recusou, o arquivo novo não pode ficar órfão no disco.
      await deleteProductImage(filename);
      throw error;
    }
  });

  router.delete('/products/:id/image', async (req, res) => {
    const id = idParam(req.params.id);
    const product = getProduct(db, id);

    const updated = clearProductImage(db, id);
    await deleteProductImage(product.image);
    res.json({ product: updated });
  });

  /* Categorias ----------------------------------------------------------- */

  router.get('/categories', (req, res) => {
    res.json({ categories: listCategories(db) });
  });

  router.post('/categories', (req, res) => {
    const input = parseBody(categorySchema, req.body);
    res.status(201).json({ category: createCategory(db, input) });
  });

  router.put('/categories/:id', (req, res) => {
    const input = parseBody(categorySchema, req.body);
    res.json({ category: updateCategory(db, req.params.id, input) });
  });

  router.delete('/categories/:id', (req, res) => {
    deleteCategory(db, req.params.id);
    res.status(204).end();
  });

  /* Configurações -------------------------------------------------------- */

  router.get('/settings', (req, res) => {
    res.json({ settings: readSettings(db) });
  });

  router.put('/settings', (req, res) => {
    const input = parseBody(settingsSchema, req.body);
    res.json({ settings: updateSettings(db, input) });
  });

  return router;
}
