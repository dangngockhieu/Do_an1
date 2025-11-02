'use strict';
import * as productService from '../services/productService.js';

export const getProductsWithPaginate = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const data = await productService.getProductsWithPaginate(page, limit, search, category);
    return res.status(200).json({ EC: 0, DT: data });
  } catch (err) {
    return res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(+req.params.id);
    if (!product) return res.status(404).json({ EC: 1, EM: 'Not found' });
    res.status(200).json({ EC: 0, DT: product });
  } catch (err) {
    res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    // build body from form-data fields
    const body = {};
    for (const key in req.body) {
      const val = req.body[key];
      if (!isNaN(val) && val !== '') body[key] = Number(val);
      else body[key] = val;
    }

    const created = await productService.createProduct(body, req.files);
    return res.status(200).json({
      EC: 0,
      DT: created,
      EM: 'Created successfully',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updated = await productService.updateProduct(+req.params.id, req.body);
    res.status(200).json({ EC: 0, DT: updated, EM: 'Updated successfully' });
  } catch (err) {
    res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const addProductImages = async (req, res) => {
  try {
    await productService.addProductImages(+req.params.id, req.files);
    res.status(200).json({ EC: 0, EM: 'Images added successfully' });
  } catch (err) {
    res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const updateProductImage = async (req, res) => {
  try {
    const updated = await productService.updateProductImage(+req.params.imageId, req.file);
    res.status(200).json({ EC: 0, DT: updated, EM: 'Image updated successfully' });
  } catch (err) {
    res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    await productService.deleteProductImage(+req.params.imageId);
    res.status(200).json({ EC: 0, EM: 'Image deleted successfully' });
  } catch (err) {
    res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await productService.deleteProduct(+req.params.id);
    res.status(200).json({ EC: 0, EM: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ EC: 1, EM: err.message });
  }
};
