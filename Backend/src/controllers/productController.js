'use strict';
import * as productService from '../services/productService.js';

export const getProductsWithPaginate = async (req, res) => {
  try {
    const page = +req.query.page || 1;
    const limit = +req.query.limit || 10;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const factory = req.query.factory || '';
    const data = await productService.getProductsWithPaginate(page, limit, search, category, factory);
    return res.status(200).json({ EC: 0, DT: data });
  } catch (err) {
    return res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const getTopSellingLaptop = async (req,res) => {
  try {
    const products = await productService.getTopSellingLaptop();
    if (!products) return res.status(404).json({ EC: 1, EM: 'Not found' });
    res.status(200).json({ EC: 0, DT: products });
  } catch (err) {
    res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const getTopSellingPhone = async (req, res) => {
  try {
    const products = await productService.getTopSellingPhone();
    if (!products) return res.status(404).json({ EC: 1, EM: 'Not found' });
    res.status(200).json({ EC: 0, DT: products });
  } catch (err) {
    res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const addProductFeatures = async (req, res) => {
  try {
    let { featureIDs } = req.body;

    if (typeof featureIDs === "string") {
      featureIDs = JSON.parse(featureIDs);
    }

    await productService.addProductFeatures(+req.params.productID, featureIDs);
    res.status(200).json({ EC: 0, EM: "Added successfully" });
  } catch (err) {
    console.error(" addProductFeatures error:", err);
    res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const deleteProductFeature = async (req, res) => {
  try {
    await productService.deleteProductFeature(+req.query.productID, +req.query.featureID);
    res.status(200).json({ EC: 0, EM: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ EC: 1, EM: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const {product, reviews} = await productService.getProductById(+req.params.id);
    if (!product) return res.status(404).json({ EC: 1, EM: 'Not found' });
    res.status(200).json({ EC: 0, DT: {product, reviews} });
  } catch (err) {
    res.status(500).json({ EC: 1, EM: err.message });
  }
}

export const getFilteredProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filters = req.body;

    const products = await productService.getAllProducts(category, filters);

    res.status(200).json({
      EC: 0,
      DT: {products, count: products.length},
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({
      EC: 1,
      EM: "Lỗi khi lấy danh sách sản phẩm",
    });
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
